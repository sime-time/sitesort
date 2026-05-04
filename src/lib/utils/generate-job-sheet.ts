import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type MaterialInput = {
  name: string;
  quantity: number | null;
  note: string | null;
};

type TaskInput = {
  description: string;
  completed: boolean;
};

export type JobSheetInput = {
  name: string;
  address: string | null;
  contractor: string | null;
  materials: MaterialInput[];
  tasks: TaskInput[];
};

const PAGE_WIDTH = 612; // US Letter portrait (8.5x11in * 72)
const PAGE_HEIGHT = 792;
const MARGIN = 40;
const FONT_SIZE = 10;
const LINE_HEIGHT = 14;

function formatDateIso(isoValue: string | null) {
  if (!isoValue) return "-";
  const dateOnly = isoValue.slice(0, 10);
  const [y, m, d] = dateOnly.split("-");
  if (!y || !m || !d) return "-";
  return `${Number(m)}/${Number(d)}/${y}`;
}

// Simple wrap helper using font measurements
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  size: number,
): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else {
      lines.push(current);
      current = words[i];
    }
  }

  lines.push(current);
  return lines;
}

export async function generateJobSheetPdf(job: JobSheetInput): Promise<File> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Filter materials and tasks
  const usedMaterials = job.materials;
  const completedTasks = job.tasks;

  // Create first page
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  // Determine if new page is needed
  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) addPage();
  };

  const drawLabelValue = (label: string, value: string) => {
    ensureSpace(LINE_HEIGHT);
    page.drawText(label, {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font: bold,
      color: rgb(0, 0, 0),
    });
    page.drawText(value || "-", {
      x: MARGIN + 90,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  };

  // Header
  page.drawText("JOB SHEET", { x: MARGIN, y, size: 16, font: bold });
  page.drawText(`Generated: ${formatDateIso(new Date().toISOString())}`, {
    x: PAGE_WIDTH - MARGIN - 130,
    y: y + 2,
    size: 9,
    font,
  });

  y -= 24;

  // Job details
  drawLabelValue("Job:", job.name || "-");
  drawLabelValue("Address:", job.address?.trim() || "-");
  drawLabelValue("Contractor:", job.contractor?.trim() || "-");

  y -= 10;

  // Materials section
  ensureSpace(40);

  page.drawText("MATERIALS USED", { x: MARGIN, y, size: 12, font: bold });

  y -= 18;

  const colQty = MARGIN;
  const colName = MARGIN + 55;
  const colNotes = MARGIN + 280;
  const tableRight = PAGE_WIDTH - MARGIN;

  const drawMaterialsHeader = () => {
    page.drawLine({
      start: { x: MARGIN, y: y + 12 },
      end: { x: tableRight, y: y + 12 },
      thickness: 1,
    });
    page.drawText("Qty", { x: colQty, y, size: FONT_SIZE, font: bold });
    page.drawText("Material", { x: colName, y, size: FONT_SIZE, font: bold });
    page.drawText("Notes", { x: colNotes, y, size: FONT_SIZE, font: bold });
    y -= LINE_HEIGHT;
    page.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: tableRight, y: y + 4 },
      thickness: 1,
    });
    y -= 4;
  };

  drawMaterialsHeader();

  if (usedMaterials.length === 0) {
    ensureSpace(LINE_HEIGHT);
    page.drawText("No materials with quantity or notes.", {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
    });
    y -= LINE_HEIGHT;
  } else {
    for (const m of usedMaterials) {
      const qtyText = `${Number(m.quantity ?? 0) || 0}x`;
      const nameLines = wrapText(
        m.name || "-",
        colNotes - colName - 8,
        font,
        FONT_SIZE,
      );
      const noteLines = wrapText(
        m.note?.trim() || "-",
        tableRight - colNotes,
        font,
        FONT_SIZE,
      );
      const rowLines = Math.max(nameLines.length, noteLines.length);
      const rowHeight = rowLines * LINE_HEIGHT + 2;
      if (y - rowHeight < MARGIN) {
        addPage();
        drawMaterialsHeader();
      }
      page.drawText(qtyText, { x: colQty, y, size: FONT_SIZE, font: bold });
      for (let i = 0; i < rowLines; i += 1) {
        const lineY = y - i * LINE_HEIGHT;
        if (nameLines[i])
          page.drawText(nameLines[i], {
            x: colName,
            y: lineY,
            size: FONT_SIZE,
            font,
          });
        if (noteLines[i])
          page.drawText(noteLines[i], {
            x: colNotes,
            y: lineY,
            size: FONT_SIZE,
            font,
          });
      }
      y -= rowHeight;
      page.drawLine({
        start: { x: MARGIN, y: y + 4 },
        end: { x: tableRight, y: y + 4 },
        thickness: 0.5,
      });
      y -= 4;
    }
  }

  y -= 10;

  // Tasks section
  ensureSpace(30);
  page.drawText("COMPLETED TASKS", { x: MARGIN, y, size: 12, font: bold });

  y -= 16;

  if (completedTasks.length === 0) {
    ensureSpace(LINE_HEIGHT);
    page.drawText("No completed tasks.", {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
    });
    y -= LINE_HEIGHT;
  } else {
    const bulletX = MARGIN;
    const textX = MARGIN + 18;
    const textWidth = PAGE_WIDTH - MARGIN - textX;
    for (const task of completedTasks) {
      const lines = wrapText(
        task.description || "-",
        textWidth,
        font,
        FONT_SIZE,
      );
      const blockHeight = lines.length * LINE_HEIGHT;
      ensureSpace(blockHeight + 2);
      page.drawText("[x]", { x: bulletX, y, size: FONT_SIZE, font: bold });
      for (let i = 0; i < lines.length; i += 1) {
        page.drawText(lines[i], {
          x: textX,
          y: y - i * LINE_HEIGHT,
          size: FONT_SIZE,
          font,
        });
      }
      y -= blockHeight + 2;
    }
  }

  const bytes = await pdf.save();
  return new File([bytes], "job-sheet.pdf", { type: "application/pdf" });
}
