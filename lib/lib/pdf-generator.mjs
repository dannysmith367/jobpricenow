// ============================================================
// JobPriceNow — Quote PDF Generator
//
// Renders a finished quote (contractor info, customer info,
// scope of work, price, notes) as a clean letter-size PDF using
// pdf-lib. Returns raw bytes — callers decide whether to store,
// download, or email them.
// ============================================================

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const NAVY = rgb(0.06, 0.09, 0.16);
const BLUE = rgb(0.15, 0.39, 0.92);
const MUTED = rgb(0.42, 0.46, 0.53);
const LIGHT_LINE = rgb(0.88, 0.9, 0.93);

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 54;

export async function generateQuotePdf(quote) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  const contentWidth = PAGE_WIDTH - MARGIN * 2;

  function ensureSpace(needed) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawText(text, { size = 11, f = font, color = NAVY, gap = 16, x = MARGIN, maxWidth = contentWidth } = {}) {
    const lines = wrapText(String(text || ""), f, size, maxWidth);
    for (const line of lines) {
      ensureSpace(gap);
      page.drawText(line, { x, y, size, font: f, color });
      y -= gap;
    }
  }

  function drawRule() {
    ensureSpace(14);
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: LIGHT_LINE,
    });
    y -= 14;
  }

  function wrapText(text, f, size, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  }

  // ---- Header: contractor info (with optional logo top-right) ----
  const c = quote.contractor || {};
  const textBlockWidth = c.logoDataUrl ? contentWidth - 100 : contentWidth;

  if (c.logoDataUrl) {
    try {
      const match = /^data:(image\/(?:png|jpeg));base64,(.+)$/.exec(c.logoDataUrl);
      if (match) {
        const bytes = Buffer.from(match[2], "base64");
        const image = match[1] === "image/png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const maxW = 90;
        const maxH = 50;
        const scale = Math.min(maxW / image.width, maxH / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, { x: PAGE_WIDTH - MARGIN - w, y: y - h + 10, width: w, height: h });
      }
    } catch (err) {
      console.error("Failed to embed logo in quote PDF:", err.message);
    }
  }

  drawText(c.businessName || c.contractorName || "Handyman Quote", { size: 20, f: bold, gap: 26, maxWidth: textBlockWidth });
  if (c.contractorName && c.businessName) drawText(c.contractorName, { size: 11, color: MUTED, gap: 14, maxWidth: textBlockWidth });
  const contactLine = [c.phone, c.email, c.website].filter(Boolean).join("   •   ");
  if (contactLine) drawText(contactLine, { size: 10, color: MUTED, gap: 12, maxWidth: textBlockWidth });
  if (c.address) drawText(c.address, { size: 10, color: MUTED, gap: 12, maxWidth: textBlockWidth });
  if (c.licenseNumber) drawText(`License #${c.licenseNumber}`, { size: 10, color: MUTED, gap: 12, maxWidth: textBlockWidth });

  y -= 6;
  drawText("QUOTE", { size: 13, f: bold, color: BLUE, gap: 16 });
  drawText(`Quote #${quote.quoteNumber}   •   ${quote.date}   •   Valid until ${quote.expirationDate}`, {
    size: 9.5,
    color: MUTED,
    gap: 18,
  });
  drawRule();

  // ---- Customer ----
  const cu = quote.customer || {};
  if (cu.name || cu.jobAddress) {
    drawText("Customer", { size: 11, f: bold, gap: 15 });
    if (cu.name) drawText(cu.name, { size: 10.5, gap: 13 });
    if (cu.jobAddress) drawText(cu.jobAddress, { size: 10.5, color: MUTED, gap: 13 });
    const cuContact = [cu.phone, cu.email].filter(Boolean).join("   •   ");
    if (cuContact) drawText(cuContact, { size: 10.5, color: MUTED, gap: 13 });
    y -= 6;
    drawRule();
  }

  // ---- Scope of work ----
  drawText(quote.content.quoteTitle, { size: 13, f: bold, gap: 18 });
  if (quote.content.customerSummary) {
    drawText(quote.content.customerSummary, { size: 10.5, color: MUTED, gap: 14 });
    y -= 4;
  }
  if (quote.content.scopeOfWork?.length) {
    drawText("Scope of Work", { size: 11, f: bold, gap: 15 });
    for (const item of quote.content.scopeOfWork) {
      drawText(`•  ${item}`, { size: 10.5, gap: 13, maxWidth: contentWidth - 10 });
    }
    y -= 6;
  }
  if (quote.content.estimatedDuration) {
    drawText(`Estimated duration: ${quote.content.estimatedDuration}`, { size: 10, color: MUTED, gap: 14 });
  }
  drawRule();

  // ---- Price ----
  ensureSpace(50);
  drawText("Total Estimate", { size: 11, f: bold, color: MUTED, gap: 16 });
  drawText(formatMoney(quote.price), { size: 24, f: bold, color: NAVY, gap: 30 });
  drawRule();

  // ---- Notes ----
  if (quote.content.notes?.length || quote.additionalNotes) {
    drawText("Additional Notes", { size: 11, f: bold, gap: 15 });
    if (quote.additionalNotes) drawText(quote.additionalNotes, { size: 10, color: MUTED, gap: 13 });
    for (const note of quote.content.notes || []) {
      drawText(`•  ${note}`, { size: 10, color: MUTED, gap: 13 });
    }
    y -= 6;
    drawRule();
  }

  // ---- Terms ----
  drawText("Terms", { size: 11, f: bold, gap: 15 });
  drawText(
    quote.paymentTerms || "Payment due upon completion unless otherwise specified.",
    { size: 9.5, color: MUTED, gap: 12 }
  );
  drawText(
    "This quote is based on the described scope of work. Additional work or unforeseen conditions may require a revised estimate.",
    { size: 9, color: MUTED, gap: 12 }
  );

  ensureSpace(20);
  drawText("Generated with JobPriceNow.com", { size: 8.5, color: MUTED, gap: 12 });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
