import { useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { useAssistantStore } from "../store/assistantStore";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

const SUPPORTED_MODEL = "models/gemini-2.5-flash-native-audio-latest";

function buildVoiceSystemPrompt(
  userName: string,
  balance: number,
  currency: string
): string {
  return `You are Aoede, a friendly voice AI financial assistant inside Spendr.
You are speaking to ${userName}. Balance: ${currency}${balance.toFixed(0)}.
Speak concisely — 1-3 short sentences per response.
Help with: spending analysis, budget advice, expense tracking, saving tips.
Be warm, proactive, and conversational.`;
}

export function useAIVoice(onFallbackToText: (reason: string) => void) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const { user } = useAuthStore();
  const { data: userData } = useUserData();
  const { addMessage } = useAssistantStore();

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const setupCompleteRef = useRef(false);
  const isMountedRef = useRef(true);

  const stopVoice = useCallback(() => {
    try {
      recorderRef.current?.stop?.();
      playerRef.current?.stop?.();
      playerRef.current?.close?.();
    } catch {
      // ignore cleanup errors
    }
    recorderRef.current = null;
    playerRef.current = null;

    if (wsRef.current) {
      try { wsRef.current.close(1000); } catch {}
      wsRef.current = null;
    }

    if (isMountedRef.current) {
      setVoiceState("idle");
    }
    setupCompleteRef.current = false;
  }, []);

  const startVoice = useCallback(async () => {
    if (!user) {
      onFallbackToText("Please sign in to use voice mode.");
      return;
    }

    // Use env key directly — most reliable approach
    const apiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY;

    setVoiceState("connecting");
    setupCompleteRef.current = false;

    try {
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (!setupCompleteRef.current) {
          console.warn("[Voice] Setup timed out after 8s");
          stopVoice();
          onFallbackToText("Voice connection timed out. Using chat mode.");
        }
      }, 8000);

      ws.onopen = () => {
        console.log("[Voice] WebSocket open, sending setup...");

        const systemPrompt = buildVoiceSystemPrompt(
          userData?.displayName || "there",
          userData?.balance || 0,
          userData?.preferences?.currency || "₹"
        );

        ws.send(
          JSON.stringify({
            setup: {
              model: SUPPORTED_MODEL,
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Aoede" },
                  },
                },
              },
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
            },
          })
        );
      };

      ws.onmessage = async (event) => {
        let data: any;
        try {
          const text =
            event.data instanceof Blob
              ? await event.data.text()
              : (event.data as string);
          data = JSON.parse(text);
        } catch {
          return;
        }

        // Setup acknowledged — start mic
        if (data.setupComplete !== undefined) {
          clearTimeout(connectionTimeout);
          setupCompleteRef.current = true;
          console.log("[Voice] Setup complete, starting mic...");
          setVoiceState("listening");

          try {
            // Lazy-load audio modules to avoid blocking UI
            const [{ AudioRecorder }, { AudioPlayer }] = await Promise.all([
              import("../services/voice/AudioRecorder"),
              import("../services/voice/AudioPlayer"),
            ]);

            playerRef.current = new AudioPlayer();

            const recorder = new AudioRecorder((base64Pcm: string) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    realtimeInput: {
                      mediaChunks: [
                        {
                          mimeType: "audio/pcm;rate=16000",
                          data: base64Pcm,
                        },
                      ],
                    },
                  })
                );
              }
            });
            recorderRef.current = recorder;
            await recorder.start();
          } catch (micErr: any) {
            console.error("[Voice] Mic start failed:", micErr);
            stopVoice();
            if (micErr.name === "NotAllowedError") {
              onFallbackToText(
                "Microphone permission denied. Please allow mic access and try again."
              );
            } else {
              onFallbackToText(
                "Could not access microphone. Using chat mode."
              );
            }
          }
          return;
        }

        // Audio response
        if (data.serverContent?.modelTurn?.parts) {
          for (const part of data.serverContent.modelTurn.parts) {
            if (
              part.inlineData?.mimeType?.startsWith("audio/pcm") &&
              playerRef.current
            ) {
              setVoiceState("speaking");
              try {
                await playerRef.current.playBase64Pcm(part.inlineData.data);
              } catch {
                // ignore playback errors
              }
            }
            if (part.text) {
              addMessage({ role: "assistant", content: part.text });
            }
          }
        }

        if (data.serverContent?.turnComplete) {
          if (setupCompleteRef.current) {
            setVoiceState("listening");
          }
        }
      };

      ws.onerror = (e) => {
        console.error("[Voice] WebSocket error:", e);
        clearTimeout(connectionTimeout);
      };

      ws.onclose = (e) => {
        clearTimeout(connectionTimeout);
        console.log("[Voice] WebSocket closed:", e.code, e.reason);

        if (!setupCompleteRef.current) {
          // Failed before setup — fall back to text
          if (isMountedRef.current) {
            setVoiceState("error");
          }
          const reason =
            e.code === 1008
              ? `Voice model unavailable (${e.reason?.slice(0, 80) || "unknown error"}). Using chat mode.`
              : "Voice connection failed. Using chat mode.";
          onFallbackToText(reason);
        } else if (e.code !== 1000) {
          // Unexpected closure after session was live
          if (isMountedRef.current) {
            setVoiceState("idle");
          }
        }
        wsRef.current = null;
      };
    } catch (err: any) {
      console.error("[Voice] startVoice failed:", err);
      setVoiceState("error");
      onFallbackToText(
        err.message || "Voice unavailable. Using chat mode."
      );
    }
  }, [user, userData, addMessage, onFallbackToText, stopVoice]);

  return { voiceState, startVoice, stopVoice };
}
