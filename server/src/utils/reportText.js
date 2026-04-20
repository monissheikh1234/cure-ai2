import fs from "fs/promises";
import mammoth from "mammoth";

export async function extractReportText({ filePath, mimeType }) {
  // Word (.docx) files
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const buf = await fs.readFile(filePath);
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return (value || "").trim();
  }

  // Other types (images, PDFs, etc.) are currently not parsed to keep runtime simple.
  // You can extend this helper later for additional formats if needed.
  return "";
}

