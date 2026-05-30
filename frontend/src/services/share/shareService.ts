import { toBlob } from "html-to-image";

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

/**
 * Captures a React DOM reference as a Blob and attempts to share it
 * using the Web Share API. Falls back to downloading the image.
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
  } catch (err) {
    console.error("Error sharing DOM element:", err);
    throw err;
  }
}

export async function shareContent(options: ShareOptions): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share(options);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.warn("Error sharing content:", err);
    }
  } else {
    console.warn("Web Share API not supported.");
  }
}
