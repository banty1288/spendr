import html2canvas from "html2canvas";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

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
    const canvas = await html2canvas(elementRef.current, {
      scale: 2, // High resolution
      useCORS: true, // Allow external images
      backgroundColor: "#0a0a14", // Fallback Spendr background
      logging: false,
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png", 1.0);
    });

    if (!blob) {
      throw new Error("Failed to generate image blob");
    }

    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: options?.title || "Spendr",
        text: options?.text || "Check this out!",
        url: options?.url,
        files: [file],
      });
    } else {
      // Fallback for Desktop/Unsupported browsers
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Error sharing DOM element:", err);
    throw err;
  }
}
