import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdfFromDom(
  elementRef: React.RefObject<HTMLElement | null>,
  filename: string
): Promise<void> {
  if (!elementRef.current) {
    throw new Error("Element reference is not attached to DOM");
  }

  try {
    // Hide buttons or elements you don't want in the PDF
    const elementsToHide = elementRef.current.querySelectorAll(".no-print");
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    const canvas = await html2canvas(elementRef.current, {
      scale: 2, // High resolution for PDF
      useCORS: true,
      backgroundColor: "#0a0a14",
      logging: false,
    });

    // Restore hidden elements
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = "";
    });

    const imgData = canvas.toDataURL("image/png");
    
    // A4 paper dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the ratio to fit the width perfectly
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let heightLeft = scaledHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    // Add new pages if height is larger than one PDF page
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight; // Move image up
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(filename);
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  }
}
