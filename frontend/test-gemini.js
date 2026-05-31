import fs from 'fs';

const GEMINI_REST_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
const apiKey = "AIzaSyBiVbB0gi4UpsWRq1OvX3Dn53DvSN65Bfg"; // from .env.local

async function test() {
  const requestBody = {
    system_instruction: {
      parts: [{ text: "System prompt" }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}
test();
