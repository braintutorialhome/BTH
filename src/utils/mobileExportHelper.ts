import { jsPDF } from 'jspdf';

/**
 * Detects if the current browser environment is running inside an Android WebView,
 * Capacitor, Cordova, or mobile APK container.
 */
export const isMobileOrWebView = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroidWebView = /wv|Android.*Version\/[\d.]+/i.test(ua) || (Boolean((window as any).chrome) && /Android/i.test(ua) && !/Version\/[\d.]+/i.test(ua));
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const hasNativeBridge = Boolean(
    (window as any).Android ||
    (window as any).AndroidInterface ||
    (window as any).JSBridge ||
    (window as any).AndroidBridge ||
    (window as any).webkit?.messageHandlers
  );
  return isAndroidWebView || isMobileUa || (isTouchDevice && window.innerWidth < 1024) || hasNativeBridge;
};

/**
 * Converts a Blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Stages a generated document (PDF or CSV) to the backend server
 * so Android APK WebViews can download via clean HTTP/HTTPS with proper
 * Content-Disposition attachment headers.
 */
export const stageFileOnServer = async (
  blob: Blob,
  filename: string,
  mimeType: string
): Promise<{ downloadUrl: string; viewUrl: string } | null> => {
  try {
    const dataUrl = await blobToBase64(blob);
    const pureBase64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

    const response = await fetch('/api/export/stage-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data: pureBase64,
        filename,
        mimeType
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.downloadUrl) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const downloadUrl = `${origin}${data.downloadUrl}`;
      const viewUrl = `${origin}${data.downloadUrl}&inline=1`;
      return { downloadUrl, viewUrl };
    }
  } catch (err) {
    console.warn('Server staging unavailable, falling back to client-only export:', err);
  }
  return null;
};

/**
 * Triggers native Android WebView JavascriptInterface if registered in the APK
 */
const tryNativeAndroidBridge = async (blob: Blob, filename: string, mimeType: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  const bridge = w.Android || w.AndroidInterface || w.JSBridge || w.AndroidBridge;

  if (!bridge) return false;

  try {
    const dataUrl = await blobToBase64(blob);
    const pureBase64 = dataUrl.split(',')[1] || dataUrl;

    if (typeof bridge.downloadFile === 'function') {
      bridge.downloadFile(pureBase64, filename, mimeType);
      return true;
    }
    if (typeof bridge.downloadBase64File === 'function') {
      bridge.downloadBase64File(pureBase64, filename, mimeType);
      return true;
    }
    if (typeof bridge.downloadBlob === 'function') {
      bridge.downloadBlob(pureBase64, filename, mimeType);
      return true;
    }
    if (typeof bridge.saveFile === 'function') {
      bridge.saveFile(pureBase64, filename, mimeType);
      return true;
    }
    if (typeof bridge.postMessage === 'function') {
      bridge.postMessage(JSON.stringify({ action: 'download', filename, data: pureBase64, mimeType }));
      return true;
    }
  } catch (err) {
    console.warn('Native Android bridge call encountered error:', err);
  }
  return false;
};

/**
 * Executes direct download via hidden iframe and anchor tag.
 * The hidden iframe is especially critical for Android WebViews because
 * standard Android WebView DownloadListener intercepts iframe HTTPS downloads
 * without navigating away or breaking the single-page application.
 */
const triggerDirectDownload = (url: string, filename: string) => {
  try {
    // 1. Hidden iframe for Android WebView DownloadListener
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 15000);
  } catch (e) {
    console.warn('Iframe download trigger error:', e);
  }

  try {
    // 2. Hidden anchor tag
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.setAttribute('download', filename);
    a.setAttribute('target', '_self');
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 15000);
  } catch (e) {
    console.warn('Anchor download trigger error:', e);
  }
};

/**
 * Browser anchor download fallback using blob object URL
 */
const triggerBlobDownload = (blob: Blob, filename: string): boolean => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';
    link.href = url;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_self');
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 10000);
    return true;
  } catch (err) {
    console.warn('triggerBlobDownload failed:', err);
    return false;
  }
};

/**
 * Displays an interactive toast notification on the screen
 */
export const showExportToast = (
  message: string, 
  isSuccess: boolean = true, 
  actionLabel?: string, 
  onAction?: () => void
) => {
  if (typeof document === 'undefined') return;

  const existingToast = document.getElementById('bth-export-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'bth-export-toast';
  toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-2xl transition-all duration-300 flex items-center gap-3 backdrop-blur-xl border ${
    isSuccess 
      ? 'bg-slate-900/95 text-emerald-400 border-emerald-500/30' 
      : 'bg-slate-900/95 text-rose-400 border-rose-500/30'
  }`;

  const dot = `<span class="w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}"></span>`;
  const text = `<span class="truncate max-w-[220px] sm:max-w-[320px]">${message}</span>`;
  toast.innerHTML = `${dot}${text}`;

  if (actionLabel && onAction) {
    const btn = document.createElement('button');
    btn.className = 'ml-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/40 transition-all cursor-pointer whitespace-nowrap active:scale-95';
    btn.textContent = actionLabel;
    btn.onclick = (e) => {
      e.stopPropagation();
      onAction();
    };
    toast.appendChild(btn);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    setTimeout(() => {
      try {
        toast.remove();
      } catch {}
    }, 400);
  }, 5000);
};

/**
 * Displays a dedicated mobile download sheet / modal tailored for Android APK WebViews.
 * Provides instant 1-tap options:
 * - Direct HTTPS Save / Download to device
 * - Web Share directly to WhatsApp / Drive / Files
 * - Open in System Browser (Chrome)
 * - Copy Download Link
 */
export const showMobileDownloadModal = (params: {
  filename: string;
  blob: Blob;
  mimeType: string;
  downloadUrl?: string;
  viewUrl?: string;
}) => {
  if (typeof document === 'undefined') return;

  const existingModal = document.getElementById('bth-mobile-download-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const { filename, blob, mimeType, downloadUrl, viewUrl } = params;
  const isPdf = mimeType.includes('pdf');
  const sizeKb = Math.round(blob.size / 1024);

  const modalContainer = document.createElement('div');
  modalContainer.id = 'bth-mobile-download-modal';
  modalContainer.className = 'fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200';

  const card = document.createElement('div');
  card.className = 'w-full max-w-md bg-[#0b1329] border border-white/20 rounded-3xl p-5 shadow-2xl text-white space-y-4';

  // Title Header
  const headerHtml = `
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl ${isPdf ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} flex items-center justify-center font-black text-sm">
          ${isPdf ? 'PDF' : 'CSV'}
        </div>
        <div>
          <h3 class="text-sm font-black text-white leading-tight">Document Ready</h3>
          <p class="text-[11px] font-medium text-slate-400">${sizeKb > 0 ? `${sizeKb} KB • ` : ''}Android APK & Mobile Download</p>
        </div>
      </div>
      <button id="bth-modal-close" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
      <p class="text-xs font-bold text-slate-200 truncate" title="${filename}">${filename}</p>
      <p class="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        File generated and ready on device
      </p>
    </div>
  `;

  card.innerHTML = headerHtml;

  // Actions Container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'space-y-2.5 pt-1';

  // Button 1: Download to Device
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer';
  downloadBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    <span>Save / Download to Device</span>
  `;
  downloadBtn.onclick = () => {
    if (downloadUrl) {
      triggerDirectDownload(downloadUrl, filename);
    }
    triggerBlobDownload(blob, filename);
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
      <span>Downloading... Check Notification Bar</span>
    `;
    setTimeout(() => {
      downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Save / Download to Device</span>
      `;
    }, 4000);
  };
  actionsContainer.appendChild(downloadBtn);

  // Button 2: Share via WhatsApp / Drive / Files (Direct User Gesture)
  const shareBtn = document.createElement('button');
  shareBtn.className = 'w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-md shadow-indigo-600/20';
  shareBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
    <span>Share to WhatsApp / Drive / Files</span>
  `;
  shareBtn.onclick = async () => {
    try {
      let file: File | null = null;
      try {
        file = new File([blob], filename, { type: mimeType, lastModified: Date.now() });
      } catch {}

      if (navigator.share) {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: `Document: ${filename}`
          });
          return;
        } else if (downloadUrl) {
          await navigator.share({
            title: filename,
            text: `Download student document ${filename}:`,
            url: downloadUrl
          });
          return;
        }
      }
      // Fallback: Copy link
      if (downloadUrl) {
        await navigator.clipboard.writeText(downloadUrl);
        showExportToast('Download link copied to clipboard!');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Share error:', err);
      }
    }
  };
  actionsContainer.appendChild(shareBtn);

  // Button 3: Open in External Browser / Chrome
  if (downloadUrl) {
    const browserBtn = document.createElement('button');
    browserBtn.className = 'w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer';
    browserBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      <span>Open in Chrome / External Browser</span>
    `;
    browserBtn.onclick = () => {
      const targetUrl = viewUrl || downloadUrl;
      // If running inside Cordova or Capacitor:
      const w = window as any;
      if (w.cordova?.InAppBrowser?.open) {
        w.cordova.InAppBrowser.open(targetUrl, '_system');
        return;
      }
      // Standard window.open with _system or _blank
      try {
        window.open(targetUrl, '_system');
      } catch {
        window.open(targetUrl, '_blank');
      }
    };
    actionsContainer.appendChild(browserBtn);

    // Button 4: Copy Download Link
    const copyBtn = document.createElement('button');
    copyBtn.className = 'w-full py-2 px-4 rounded-xl text-slate-400 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer';
    copyBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>Copy Direct Download Link</span>
    `;
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(downloadUrl);
        copyBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span class="text-emerald-400 font-bold">Link Copied to Clipboard!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy Direct Download Link</span>
          `;
        }, 3000);
      } catch {}
    };
    actionsContainer.appendChild(copyBtn);
  }

  card.appendChild(actionsContainer);
  modalContainer.appendChild(card);
  document.body.appendChild(modalContainer);

  const closeModal = () => {
    try {
      modalContainer.classList.add('fade-out');
      setTimeout(() => {
        try {
          modalContainer.remove();
        } catch {}
      }, 150);
    } catch {}
  };

  const closeBtn = card.querySelector('#bth-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
};

/**
 * Master file export pipeline handling Android WebView APK, Mobile browsers, and Desktop.
 */
export const exportFileForMobileAndWeb = async (
  blob: Blob,
  filename: string,
  mimeType: string
): Promise<void> => {
  const isMobile = isMobileOrWebView();

  // 1. Check for native Android JavascriptInterface bridge in APK
  const bridgeHandled = await tryNativeAndroidBridge(blob, filename, mimeType);
  if (bridgeHandled) {
    showExportToast(`Exported ${filename} via Android APK!`);
    return;
  }

  // 2. Stage file on backend server to obtain guaranteed HTTPS download URL
  const staged = await stageFileOnServer(blob, filename, mimeType);

  // 3. Immediately trigger direct download
  if (staged?.downloadUrl) {
    triggerDirectDownload(staged.downloadUrl, filename);
  }
  triggerBlobDownload(blob, filename);

  // 4. On Mobile / APK WebView: Always open the interactive Action Modal
  // This guarantees that if the user's APK lacks automatic DownloadManager listener,
  // they have instant 1-tap options to Save, Share to WhatsApp/Drive, or Open in Chrome!
  if (isMobile) {
    showMobileDownloadModal({
      filename,
      blob,
      mimeType,
      downloadUrl: staged?.downloadUrl,
      viewUrl: staged?.viewUrl
    });
  } else {
    // Desktop: Sleek toast
    showExportToast(`Downloaded ${filename}`);
  }
};

/**
 * Specialized helper to export jsPDF instances on Android APK and Web
 */
export const exportPdfDocument = async (doc: jsPDF, filename: string): Promise<void> => {
  try {
    const pdfBlob = doc.output('blob');
    await exportFileForMobileAndWeb(pdfBlob, filename, 'application/pdf');
  } catch (e) {
    console.warn('Failed to export PDF blob, attempting direct save:', e);
    doc.save(filename);
  }
};

/**
 * Specialized helper to export CSV data on Android APK and Web
 */
export const exportCsvData = async (csvText: string, filename: string): Promise<void> => {
  try {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
    await exportFileForMobileAndWeb(blob, filename, 'text/csv');
  } catch (e) {
    console.error('Failed to export CSV:', e);
    showExportToast('Failed to export CSV', false);
  }
};
