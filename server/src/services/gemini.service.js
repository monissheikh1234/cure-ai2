import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("Gemini API key missing. Set GEMINI_API_KEY in server/.env");
    err.statusCode = 400;
    throw err;
  }
  return new GoogleGenerativeAI(apiKey);
}

function normalizeModelName(name) {
  return String(name || "").trim().replace(/^models\//, "");
}

export async function analyzeMedicalReport(reportText) {
  const genAI = getClient();
  const preferred = normalizeModelName(process.env.GEMINI_MODEL) || "gemini-2.0-flash";
  const fallbacks = [
    preferred,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  const prompt = `You are a medical assistant. Analyze the medical report text below.
Return a JSON object with keys:
- summary: concise bullet-like summary (string)
- explanation: simple patient-friendly explanation (string)
- recommendations: safe general next steps and when to see a doctor (string)

Medical report text:
"""${reportText}"""`;

  let lastErr = null;
  let text = "";
  for (const modelName of fallbacks) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text();
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (lastErr) throw lastErr;

  // Best-effort JSON extraction; fall back to raw text sections if parsing fails.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: String(parsed.summary ?? ""),
        explanation: String(parsed.explanation ?? ""),
        recommendations: String(parsed.recommendations ?? "")
      };
    } catch {
      // fall through
    }
  }

  return {
    summary: text.slice(0, 2000),
    explanation: "",
    recommendations: ""
  };
}

