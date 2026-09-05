import { jsPDF } from 'jspdf';

/**
 * Detects if the current browser environment is running inside an Android WebView,
 * Capacitor, Cordova, or mobile APK container.
 */
export const isMobileOrWebView = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroidWebView = /wv|Android.*Version\/[\d.]+/i.test(ua);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasNativeBridge = Boolean(
    (window as any).Android ||
    (window as any).AndroidInterface ||
    (window as any).JSBridge ||
    (window as any).AndroidBridge ||
    (window as any).webkit?.messageHandlers
  );
  return isAndroidWebView || isMobile || hasNativeBridge;
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
 * Tries to send file to any native Android WebView JavascriptInterface if available in the APK.
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
 * Tries to share the file via modern Web Share API Level 2 (files support).
 * In Android WebViews (Chromium engine), this opens Android's native system share sheet
 * allowing the user to "Save to device", "Save to Downloads", "Drive", "WhatsApp", etc.
 */
const tryWebShareFile = async (blob: Blob, filename: string, mimeType: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    // Create a File object from Blob
    const file = new File([blob], filename, {
      type: mimeType,
      lastModified: Date.now()
    });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: filename,
        text: `Exported ${filename} from Brain Tutorial Home`
      });
      return true;
    }
  } catch (err: any) {
    // If the user cancelled the Android share sheet (AbortError), don't treat as failure
    if (err?.name === 'AbortError') {
      return true;
    }
    console.warn('Web Share API failed:', err);
  }
  return false;
};

/**
 * Standard browser anchor download fallback using blob object URL
 */
const triggerBrowserDownload = (blob: Blob, filename: string): boolean => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';
    link.href = url;
    link.setAttribute('download', filename);
    // Never use target="_blank" in Android WebViews as it can be blocked
    link.setAttribute('target', '_self');
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 4000);
    return true;
  } catch (err) {
    console.warn('triggerBrowserDownload failed:', err);
    return false;
  }
};

/**
 * Secondary download trigger using Base64 Data URI
 * Highly reliable in Android WebViews where blob: schemes may not be intercepted.
 */
const triggerDataUriDownload = async (blob: Blob, filename: string): Promise<boolean> => {
  try {
    const dataUrl = await blobToBase64(blob);
    const link = document.createElement('a');
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';
    link.href = dataUrl;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_self');
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 4000);
    return true;
  } catch (err) {
    console.warn('triggerDataUriDownload failed:', err);
    return false;
  }
};

/**
 * Displays an interactive toast notification on the screen
 * with optional Action button (e.g. Share via App / Save)
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
 * Master file export function handling Android WebView APK, Mobile browsers, and Desktop.
 * Guarantees both PDF and CSV exports initiate standard downloads AND support Android APKs.
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
    showExportToast(`Exporting ${filename} via Android APK...`);
    return;
  }

  // 2. Prepare file object for Web Share API if supported
  let shareSupported = false;
  let shareFileObj: File | null = null;
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      shareFileObj = new File([blob], filename, { type: mimeType, lastModified: Date.now() });
      if (navigator.canShare({ files: [shareFileObj] })) {
        shareSupported = true;
      }
    } catch {}
  }

  // 3. Trigger direct browser download
  const blobDownloaded = triggerBrowserDownload(blob, filename);

  // If in Android WebView and blob might be ignored, also attempt data URI
  if (isMobile) {
    await triggerDataUriDownload(blob, filename);
  }

  // 4. Provide instant feedback & mobile Share / Save action
  if (shareSupported && isMobile) {
    showExportToast(
      `Exported ${filename}`,
      true,
      'Share / Save via App',
      async () => {
        try {
          if (shareFileObj) {
            await navigator.share({
              files: [shareFileObj],
              title: filename,
              text: `Download file: ${filename}`
            });
          }
        } catch (err: any) {
          if (err?.name !== 'AbortError') {
            console.warn('Manual share failed:', err);
          }
        }
      }
    );
  } else {
    showExportToast(blobDownloaded ? `Downloaded ${filename}` : `Exported ${filename}`);
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
 * Prepends UTF-8 BOM (\uFEFF) to ensure Microsoft Excel and Android Sheets
 * display Rupee symbols (₹) and UTF-8 characters accurately.
 */
export const exportCsvData = async (csvText: string, filename: string): Promise<void> => {
  try {
    // UTF-8 Byte Order Mark
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
    await exportFileForMobileAndWeb(blob, filename, 'text/csv');
  } catch (e) {
    console.error('Failed to export CSV:', e);
    showExportToast('Failed to export CSV', false);
  }
};
