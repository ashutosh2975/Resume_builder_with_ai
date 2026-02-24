import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { RefObject } from 'react';

export type ExportQuality = 'low' | 'medium' | 'high';

interface QualityOption {
  key: ExportQuality;
  label: string;
  dpi: string;
  description: string;
  scale: number;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  { key: 'low', label: 'Low', dpi: '72 dpi', description: 'Small file, fast export', scale: 1 },
  { key: 'medium', label: 'Medium', dpi: '150 dpi', description: 'Good for most uses', scale: 2 },
  { key: 'high', label: 'High', dpi: '300 dpi', description: 'Professional print quality', scale: 4 },
];

async function generateCanvas(el: HTMLElement, quality: ExportQuality) {
  const option = QUALITY_OPTIONS.find(o => o.key === quality) || QUALITY_OPTIONS[1];

  // Create a canvas with high scale for better quality
  const canvas = await html2canvas(el, {
    scale: option.scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (doc) => {
      // Find the cloned element in the dummy document
      const clonedEl = doc.getElementById(el.id) || doc.body.querySelector('[data-resume-preview]');
      if (clonedEl instanceof HTMLElement) {
        // IMPORTANT: Strip transforms from the clone so it captures at full size
        clonedEl.style.transform = 'none';
        clonedEl.style.width = '794px'; // Force A4 width in pixels at 96dpi
        clonedEl.style.margin = '0';
        clonedEl.style.padding = '0';
      }
    }
  });

  return canvas;
}

export async function downloadPNG(
  ref: RefObject<HTMLElement>,
  filename: string,
  quality: ExportQuality = 'high',
) {
  if (!ref.current) return;
  const canvas = await generateCanvas(ref.current, quality);
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export async function downloadPDF(
  ref: RefObject<HTMLElement>,
  filename: string,
  quality: ExportQuality = 'high',
) {
  if (!ref.current) return;
  const canvas = await generateCanvas(ref.current, quality);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  // Handle multi-page
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
