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
const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 3000);
};

/**
 * Displays a lightweight toast notification on the screen
 */
export const showExportToast = (message: string, isSuccess: boolean = true) => {
  if (typeof document === 'undefined') return;

  const existingToast = document.getElementById('bth-export-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'bth-export-toast';
  toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-2xl transition-all duration-300 flex items-center gap-2.5 backdrop-blur-xl border ${
    isSuccess 
      ? 'bg-slate-900/95 text-emerald-400 border-emerald-500/30' 
      : 'bg-slate-900/95 text-rose-400 border-rose-500/30'
  }`;

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}"></span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    setTimeout(() => {
      try {
        toast.remove();
      } catch {}
    }, 400);
  }, 4000);
};

/**
 * Master file export function handling Android WebView APK, Mobile browsers, and Desktop.
 */
export const exportFileForMobileAndWeb = async (
  blob: Blob,
  filename: string,
  mimeType: string
): Promise<void> => {
  const isMobile = isMobileOrWebView();

  // 1. If APK has native Android JavascriptInterface
  const bridgeHandled = await tryNativeAndroidBridge(blob, filename, mimeType);
  if (bridgeHandled) {
    showExportToast(`Exporting ${filename} via Android APK...`);
    return;
  }

  // 2. On Mobile / Android WebView: Use Web Share API Level 2 (files support)
  // This opens Android's system share drawer with "Save to device", "Files", "Drive", etc.
  if (isMobile) {
    showExportToast(`Preparing ${filename} for APK export...`);
    const shareHandled = await tryWebShareFile(blob, filename, mimeType);
    if (shareHandled) {
      showExportToast(`${filename} export ready!`);
      return;
    }
  }

  // 3. Fallback: Trigger standard browser download
  try {
    triggerBrowserDownload(blob, filename);
    showExportToast(`Downloading ${filename}...`);
  } catch (e) {
    console.error('Download fallback error:', e);
    // 4. Data URI fallback as ultimate safety net
    try {
      const dataUrl = await blobToBase64(blob);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try { link.remove(); } catch {}
      }, 2000);
      showExportToast(`Exported ${filename}`);
    } catch (err) {
      showExportToast(`Failed to export ${filename}`, false);
    }
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
