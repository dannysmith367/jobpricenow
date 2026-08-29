// ============================================================
// JobPriceNow — Quote PDF Generator
//
// Renders a finished quote (contractor info, customer info,
// scope of work, price, notes) as a polished letter-size PDF
// using pdf-lib. Returns raw bytes — callers decide whether to
// store, download, or email them.
//
// Design: a thin brand accent bar at the top, a two-column header
// (business info left, quote metadata right), a highlighted price
// box, small colored accent rules under each section label, and a
// branded footer — dressed up from the earlier plain top-to-bottom
// text layout while staying dependency-free (pdf-lib only).
// ============================================================

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Matches the site's actual brand colors (--navy / --blue in styles.css)
const NAVY = rgb(11 / 255, 37 / 255, 69 / 255);
const BLUE = rgb(46 / 255, 111 / 255, 242 / 255);
const MUTED = rgb(0.42, 0.46, 0.53);
const LIGHT_LINE = rgb(0.88, 0.9, 0.93);
const PRICE_BOX_BG = rgb(0.93, 0.96, 1); // faint blue tint
const PRICE_BOX_BORDER = rgb(0.75, 0.85, 0.98);

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const TOP_BAR_HEIGHT = 6;

export async function generateQuotePdf(quote) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  function addPage(doc) {
    const p = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    p.drawRectangle({ x: 0, y: PAGE_HEIGHT - TOP_BAR_HEIGHT, width: PAGE_WIDTH, height: TOP_BAR_HEIGHT, color: BLUE });
    return p;
  }

  let page = addPage(pdfDoc);
  let y = PAGE_HEIGHT - MARGIN - TOP_BAR_HEIGHT - 10;
  const contentWidth = PAGE_WIDTH - MARGIN * 2;

  function ensureSpace(needed) {
    if (y - needed < MARGIN) {
      page = addPage(pdfDoc);
      y = PAGE_HEIGHT - MARGIN - TOP_BAR_HEIGHT - 10;
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

  function drawSectionLabel(text) {
    ensureSpace(20);
    page.drawText(text.toUpperCase(), { x: MARGIN, y, size: 10, font: bold, color: BLUE });
    y -= 5;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + 28, y }, thickness: 2, color: BLUE });
    y -= 13;
  }

  function drawRule() {
    ensureSpace(14);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LIGHT_LINE });
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

  // ---- Header: two-column — business info left, quote metadata right ----
  const c = quote.contractor || {};
  const headerTop = y;
  const leftColWidth = contentWidth * 0.62;

  // Embed the logo (if any) FIRST so we know its height before laying out
  // the metadata text next to it — otherwise the logo and the quote
  // number/date can end up drawn on top of each other in the same corner.
  let logoImage = null;
  let logoW = 0;
  let logoH = 0;
  if (c.logoDataUrl) {
    try {
      const match = /^data:(image\/(?:png|jpeg));base64,(.+)$/.exec(c.logoDataUrl);
      if (match) {
        const bytes = Buffer.from(match[2], "base64");
        logoImage = match[1] === "image/png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const maxW = 70;
        const maxH = 40;
        const scale = Math.min(maxW / logoImage.width, maxH / logoImage.height, 1);
        logoW = logoImage.width * scale;
        logoH = logoImage.height * scale;
      }
    } catch (err) {
      console.error("Failed to embed logo in quote PDF:", err.message);
      logoImage = null;
    }
  }

  if (logoImage) {
    page.drawImage(logoImage, { x: PAGE_WIDTH - MARGIN - logoW, y: headerTop - logoH, width: logoW, height: logoH });
  }

  // Right column starts BELOW the logo (if any), never beside/under it.
  let ry = logoImage ? headerTop - logoH - 10 : headerTop;
  const rightX = PAGE_WIDTH - MARGIN;
  const rDraw = (text, { size = 9.5, f = font, color = MUTED, gap = 13 } = {}) => {
    const w = f.widthOfTextAtSize(String(text || ""), size);
    page.drawText(String(text || ""), { x: rightX - w, y: ry, size, font: f, color });
    ry -= gap;
  };
  rDraw(`QUOTE #${quote.quoteNumber}`, { size: 10.5, f: bold, color: NAVY, gap: 15 });
  rDraw(`Date: ${quote.date}`, { gap: 13 });
  rDraw(`Valid until: ${quote.expirationDate}`, { gap: 13 });

  let ly = headerTop;
  const lDraw = (text, { size = 11, f = font, color = NAVY, gap = 16 } = {}) => {
    const lines = wrapText(String(text || ""), f, size, leftColWidth);
    for (const line of lines) {
      page.drawText(line, { x: MARGIN, y: ly, size, font: f, color });
      ly -= gap;
    }
  };
  lDraw(c.businessName || c.contractorName || "Handyman Quote", { size: 19, f: bold, gap: 24 });
  if (c.contractorName && c.businessName) lDraw(c.contractorName, { size: 10.5, color: MUTED, gap: 14 });
  const contactLine = [c.phone, c.email, c.website].filter(Boolean).join("   •   ");
  if (contactLine) lDraw(contactLine, { size: 9.5, color: MUTED, gap: 12 });
  if (c.address) lDraw(c.address, { size: 9.5, color: MUTED, gap: 12 });
  if (c.licenseNumber) lDraw(`License #${c.licenseNumber}`, { size: 9.5, color: MUTED, gap: 12 });

  y = Math.min(ly, ry) - 10;
  drawRule();

  // ---- Customer ----
  const cu = quote.customer || {};
  if (cu.name || cu.jobAddress) {
    drawSectionLabel("Customer");
    if (cu.name) drawText(cu.name, { size: 10.5, gap: 13 });
    if (cu.jobAddress) drawText(cu.jobAddress, { size: 10.5, color: MUTED, gap: 13 });
    const cuContact = [cu.phone, cu.email].filter(Boolean).join("   •   ");
    if (cuContact) drawText(cuContact, { size: 10.5, color: MUTED, gap: 13 });
    y -= 6;
    drawRule();
  }

  // ---- Scope of work ----
  drawText(quote.content.quoteTitle, { size: 14, f: bold, gap: 19 });
  if (quote.content.customerSummary) {
    drawText(quote.content.customerSummary, { size: 10.5, color: MUTED, gap: 14 });
    y -= 4;
  }
  if (quote.content.scopeOfWork?.length) {
    drawSectionLabel("Scope of Work");
    for (const item of quote.content.scopeOfWork) {
      drawText(`•  ${item}`, { size: 10.5, gap: 13, maxWidth: contentWidth - 10 });
    }
    y -= 6;
  }
  if (quote.content.estimatedDuration) {
    drawText(`Estimated duration: ${quote.content.estimatedDuration}`, { size: 10, color: MUTED, gap: 14 });
  }
  drawRule();

  // ---- Price — highlighted box, not just plain text ----
  const priceLabel = "Total Estimate";
  const priceText = formatMoney(quote.price);
  const boxHeight = 62;
  ensureSpace(boxHeight + 14);
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: PRICE_BOX_BG,
    borderColor: PRICE_BOX_BORDER,
    borderWidth: 1,
  });
  page.drawText(priceLabel.toUpperCase(), { x: MARGIN + 18, y: y - 24, size: 9.5, font: bold, color: MUTED });
  page.drawText(priceText, { x: MARGIN + 18, y: y - 48, size: 26, font: bold, color: NAVY });
  y -= boxHeight + 20;
  drawRule();

  // ---- Notes ----
  if (quote.content.notes?.length || quote.additionalNotes) {
    drawSectionLabel("Additional Notes");
    if (quote.additionalNotes) drawText(quote.additionalNotes, { size: 10, color: MUTED, gap: 13 });
    for (const note of quote.content.notes || []) {
      drawText(`•  ${note}`, { size: 10, color: MUTED, gap: 13 });
    }
    y -= 6;
    drawRule();
  }

  // ---- Terms ----
  drawSectionLabel("Terms");
  drawText(quote.paymentTerms || "Payment due upon completion unless otherwise specified.", { size: 9.5, color: MUTED, gap: 12 });
  drawText(
    "This quote is based on the described scope of work. Additional work or unforeseen conditions may require a revised estimate.",
    { size: 9, color: MUTED, gap: 12 }
  );

  // ---- Footer ----
  ensureSpace(26);
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LIGHT_LINE });
  y -= 16;
  const footerText = "Generated with JobPriceNow.com";
  const footerWidth = font.widthOfTextAtSize(footerText, 8.5);
  page.drawText(footerText, { x: (PAGE_WIDTH - footerWidth) / 2, y, size: 8.5, font, color: BLUE });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
