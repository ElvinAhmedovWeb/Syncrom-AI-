import { jsPDF } from "jspdf";

// ============================================================
// Slayd / PDF ixracı — model cavabını prezentasiya slaydlarına
// çevirib PDF olaraq endirir. Tamamilə brauzer tərəflidir,
// server sorğusu yoxdur.
// ============================================================

export interface Slide {
  title: string;
  bullets: string[];
}

/**
 * Markdown mətnini slaydlara bölür.
 *
 * Strategiya:
 * 1. `##` başlıqları varsa — hər başlıq yeni slayddır.
 * 2. Yoxdursa, `**qalın**` sətirlər başlıq sayılır.
 * 3. Hər iki hal yoxdursa, boş sətirlərlə paraqraflara bölünür.
 *
 * Nəticə ən azı 1 slayd qaytarır.
 */
export function parseSlides(markdown: string): Slide[] {
  const lines = markdown.split("\n");

  // ---------- Strategiya 1: ## başlıqlar ----------
  const hasHeadings = lines.some((l) => /^#{1,3}\s+/.test(l));
  if (hasHeadings) return splitByHeadings(lines);

  // ---------- Strategiya 2: **qalın** başlıqlar ----------
  const hasBold = lines.some((l) => /^\*\*.+\*\*\s*$/.test(l.trim()));
  if (hasBold) return splitByBold(lines);

  // ---------- Strategiya 3: paraqraflara bölünmə ----------
  return splitByParagraphs(lines);
}

function stripMd(s: string): string {
  return s
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*]\s+/, "")
    .replace(/^\s*\d+\.\s+/, "")
    .trim();
}

function splitByHeadings(lines: string[]): Slide[] {
  const slides: Slide[] = [];
  let current: Slide | null = null;

  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line)) {
      if (current) slides.push(current);
      current = { title: stripMd(line), bullets: [] };
    } else {
      const clean = stripMd(line);
      if (clean && current) current.bullets.push(clean);
      else if (clean && !current) {
        current = { title: "", bullets: [clean] };
      }
    }
  }
  if (current) slides.push(current);
  return slides.length ? slides : [{ title: "Prezentasiya", bullets: lines.map(stripMd).filter(Boolean) }];
}

function splitByBold(lines: string[]): Slide[] {
  const slides: Slide[] = [];
  let current: Slide | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\*\*.+\*\*\s*$/.test(trimmed)) {
      if (current) slides.push(current);
      current = { title: stripMd(trimmed), bullets: [] };
    } else {
      const clean = stripMd(trimmed);
      if (clean && current) current.bullets.push(clean);
      else if (clean && !current) {
        current = { title: "", bullets: [clean] };
      }
    }
  }
  if (current) slides.push(current);
  return slides.length ? slides : [{ title: "Prezentasiya", bullets: lines.map(stripMd).filter(Boolean) }];
}

function splitByParagraphs(lines: string[]): Slide[] {
  const paragraphs: string[][] = [];
  let buf: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (buf.length) {
        paragraphs.push(buf);
        buf = [];
      }
    } else {
      buf.push(stripMd(line));
    }
  }
  if (buf.length) paragraphs.push(buf);

  if (!paragraphs.length) return [{ title: "Prezentasiya", bullets: ["(boş cavab)"] }];

  // Hər paraqraf bir slayd — birinci sətir başlıq, qalanları bullet
  return paragraphs.map((p) => ({
    title: p[0],
    bullets: p.slice(1),
  }));
}

// ============================================================
// PDF yaratma
// ============================================================

// Syncrom AI brend rəngləri
const BG_GRADIENT_START = [15, 17, 28] as const;   // #0f111c — tünd
const BG_GRADIENT_END   = [26, 30, 50] as const;    // #1a1e32 — bir az açıq
const ACCENT            = [99, 102, 241] as const;   // #6366f1 — indigo
const TEXT_WHITE        = [240, 240, 250] as const;
const TEXT_MUTED        = [160, 165, 190] as const;

function lerpColor(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Slaydlardan landscape PDF yaradır və Blob qaytarır.
 */
export function generateSlidePdf(slides: Slide[], brandName = "Syncrom AI"): Blob {
  // Landscape A4
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  slides.forEach((slide, idx) => {
    if (idx > 0) doc.addPage();

    // Gradient fon — vertical şeritlərlə simulyasiya
    const steps = 40;
    const stripH = H / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(BG_GRADIENT_START, BG_GRADIENT_END, t);
      doc.setFillColor(c[0], c[1], c[2]);
      doc.rect(0, i * stripH, W, stripH + 0.5, "F");
    }

    // Accent xətt — yuxarı
    doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.rect(0, 0, W, 1.2, "F");

    // Slayd nömrəsi
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`${idx + 1} / ${slides.length}`, W - 15, H - 8);

    // Brend — aşağı sol
    doc.setFontSize(8);
    doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.text(brandName, 15, H - 8);

    // Başlıq
    let cursorY = 28;
    if (slide.title) {
      doc.setFontSize(24);
      doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);
      const titleLines = doc.splitTextToSize(slide.title, W - 40);
      doc.text(titleLines, 20, cursorY);
      cursorY += titleLines.length * 11 + 8;
    }

    // Accent xətt — başlıq altı
    if (slide.title && slide.bullets.length) {
      doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
      doc.setLineWidth(0.4);
      doc.line(20, cursorY - 3, 80, cursorY - 3);
      cursorY += 4;
    }

    // Bullet-lər
    doc.setFontSize(13);
    doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);
    for (const bullet of slide.bullets) {
      if (cursorY > H - 20) break; // Slayd daşmasın
      const wrapped = doc.splitTextToSize(bullet, W - 50);
      // Bullet nöqtəsi
      doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
      doc.circle(24, cursorY - 1.5, 1.2, "F");
      doc.text(wrapped, 30, cursorY);
      cursorY += wrapped.length * 6 + 4;
    }
  });

  return doc.output("blob");
}

/**
 * Mesaj mətnindən slayd PDF yaradıb brauzerdə endirir.
 */
export function exportAsSlides(content: string, filename = "syncrom-slides.pdf"): void {
  const slides = parseSlides(content);
  const blob = generateSlidePdf(slides);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
