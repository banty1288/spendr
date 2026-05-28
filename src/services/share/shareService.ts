import { toBlob } from "html-to-image";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:image/png;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Captures a React DOM reference as a Blob and attempts to share it
 * using the native mobile Web Share API. Falls back to downloading
 * the image on desktop devices.
 */
export async function shareDomElement(
  elementRef: React.RefObject<HTMLElement | null>,
  filename: string,
  options?: ShareOptions
): Promise<void> {
  if (!elementRef.current) {
    throw new Error("Element reference is not attached to DOM");
  }

  try {
    const blob = await toBlob(elementRef.current, {
      pixelRatio: 2, // High resolution
      backgroundColor: "#0a0a14", // Fallback Spendr background
      style: { margin: "0" },
    });

    if (!blob) {
      throw new Error("Failed to generate image blob");
    }

    if (Capacitor.isNativePlatform()) {
      // Native Capacitor Share via Filesystem
      try {
        const base64Data = await blobToBase64(blob);
        const writeResult = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: options?.title || "Spendr",
          text: options?.text || "Check this out!",
          url: writeResult.uri,
          dialogTitle: 'Share with',
        });
      } catch (nativeShareErr) {
        console.warn("Native share failed:", nativeShareErr);
        // Fallback gracefully
        downloadFile(blob, filename);
      }
    } else {
      // Web Share API fallback
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: options?.title || "Spendr",
            text: options?.text || "Check this out!",
            url: options?.url,
            files: [file],
          });
        } catch (shareErr) {
          if (shareErr instanceof DOMException && shareErr.name === "AbortError") {
            return; // User canceled the share dialog
          }
          console.warn("Web Share API failed, falling back to download", shareErr);
          downloadFile(blob, filename);
        }
      } else {
        // Fallback for Desktop/Unsupported browsers
        downloadFile(blob, filename);
      }
    }
  } catch (err) {
    console.error("Error sharing DOM element:", err);
    throw err;
  }
}
