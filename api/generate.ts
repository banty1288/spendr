import type { VercelRequest, VercelResponse } from '@vercel/node';

// The function signature matches the frontend GenerateJsonOptions
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Retrieve the API key from environment variables
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const { prompt, temperature = 0.5, inlineData, jsonResponse = true } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const GEMINI_REST_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const requestBody = {
      system_instruction: {
        parts: [{ text: "You are a financial analysis AI. ONLY output raw JSON. Do NOT wrap in markdown fences. Do NOT include explanations." }],
      },
      contents: [
        {
          role: "user",
          parts: inlineData ? [
            { text: prompt },
            { inline_data: { mime_type: inlineData.mimeType, data: inlineData.data } }
          ] : [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        ...(jsonResponse ? { responseMimeType: "application/json" } : {}),
      },
    };

    const response = await fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const status = response.status;
      return res.status(status).json({ error: errorData?.error?.message || `API Error: ${status}` });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text?.trim()) {
      return res.status(500).json({ error: 'AI returned an empty response.' });
    }

    // Clean up markdown fences if necessary
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    }

    return res.status(200).json({ result: cleanText });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Internal server error processing AI request' });
  }
}
