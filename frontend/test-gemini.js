const GEMINI_REST_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
const apiKey = "AIzaSyBiVbB0gi4UpsWRq1OvX3Dn53DvSN65Bfg";

const requestBody = {
  contents: [{ role: "user", parts: [{ text: "Hello" }] }],
};

fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody),
})
  .then((r) => r.json().then(j => ({ ok: r.ok, status: r.status, json: j })))
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
