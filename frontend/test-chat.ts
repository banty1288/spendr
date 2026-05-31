import { sendChatMessage } from "./src/services/ai/chatService";

async function test() {
  try {
    const res = await sendChatMessage("Hello", null, [], []);
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
