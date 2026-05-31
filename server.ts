import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.post("/api/generate-summary", async (req, res) => {
  const { student, records } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const recordsSummary = records.map((r: any) => ({
    date: r.date,
    scores: r.scores,
    activity: r.activityLog
  })).slice(0, 10);

  const prompt = `
    Analyze the following IEP monitoring records for ${student.name} (${student.class}) and provide a concise, professional "Catatan Penting" (Important Notes) in Bahasa Indonesia.
    
    Data:
    ${JSON.stringify(recordsSummary)}
    
    Guidelines:
    1. Focus on trends (improvement or decline).
    2. Mention specific areas like Literacy, Numeracy, or Emotional Regulation if significant.
    3. Be encouraging but objective.
    4. Keep it under 100 words.
    5. Ensure the tone matches a professional school report.
    
    Output should start directly with the narrative.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    res.json({ text: result.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Vite Middleware/Static Assets
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
