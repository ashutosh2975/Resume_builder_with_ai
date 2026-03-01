import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { RefObject } from 'react';
import type { ResumeData } from '@/context/ResumeContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

/**
 * Get resume rendered as HTML from backend
 */
export async function getResumeHTML(
  resumeData: ResumeData,
  templateConfig: Record<string, any>
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/export/render-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: resumeData, template: templateConfig }),
    });
    if (!response.ok) throw new Error('Failed to render HTML');
    const data = await response.json();
    return data.html;
  } catch (error) {
    console.error('Backend HTML rendering failed, using DOM fallback:', error);
    throw error;
  }
}

/**
 * Improved generateCanvas that properly handles A4 sizing with correct layout
 */
async function generateCanvas(el: HTMLElement, quality: ExportQuality): Promise<HTMLCanvasElement> {
  const option = QUALITY_OPTIONS.find(o => o.key === quality) || QUALITY_OPTIONS[1];
  const A4_WIDTH = 794;

  // Create clean off-screen wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    width: ${A4_WIDTH}px;
    transform: none !important;
    z-index: -9999;
    overflow: visible;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    width: ${A4_WIDTH}px !important;
    min-height: 1123px;
    transform: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    position: relative !important;
    background: #ffffff;
    font-size: 11px !important;
  `;

  // Remove transforms and ensure visibility
  clone.querySelectorAll<HTMLElement>('[style]').forEach(node => {
    const style = node.getAttribute('style') || '';
    node.setAttribute('style', 
      style
        .split(';')
        .filter(s => !s.includes('transform') && !s.includes('scale'))
        .join(';') + '; opacity: 1 !important;'
    );
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Wait for layout
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: option.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: A4_WIDTH,
      windowWidth: A4_WIDTH,
      windowHeight: Math.max(1123, clone.scrollHeight || 1123),
    });
  } finally {
    document.body.removeChild(wrapper);
  }

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

  const pdfWidth = 210;   // mm
  const pdfPageHeight = 297; // mm

  // Calculate actual height based on canvas aspect ratio
  // Canvas is A4_WIDTH (794px) wide
  const canvasAspectRatio = canvas.height / canvas.width;
  const imgHeightMm = pdfWidth * canvasAspectRatio;

  // Add image to first page
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeightMm, undefined, 'FAST');

  // Add additional pages if resume is longer than one page
  let heightLeft = imgHeightMm - pdfPageHeight;
  let position = -pdfPageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
    heightLeft -= pdfPageHeight;
    position -= pdfPageHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
