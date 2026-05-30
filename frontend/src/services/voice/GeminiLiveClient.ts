type LiveClientState = "idle" | "connecting" | "connected" | "listening" | "thinking" | "speaking" | "error";

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private onStateChange: (state: LiveClientState) => void;
  private onAudioReceived: (base64Pcm: string) => void;
  private onTextReceived: (text: string, isFinal: boolean) => void;
  private onToolCall: (name: string, args: any) => Promise<any>;
  private setupComplete = false;

  constructor(
    apiKey: string,
    callbacks: {
      onStateChange: (state: LiveClientState) => void;
      onAudioReceived: (base64Pcm: string) => void;
      onTextReceived: (text: string, isFinal: boolean) => void;
      onToolCall: (name: string, args: any) => Promise<any>;
    }
  ) {
    this.apiKey = apiKey;
    this.onStateChange = callbacks.onStateChange;
    this.onAudioReceived = callbacks.onAudioReceived;
    this.onTextReceived = callbacks.onTextReceived;
    this.onToolCall = callbacks.onToolCall;
  }

  connect(systemInstruction: string) {
    this.onStateChange("connecting");
    this.setupComplete = false;
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[GeminiLive] WebSocket opened, sending setup...");
      
      // Send Setup Message
      // Use gemini-2.5-flash-native-audio-latest — the only model that currently
      // supports bidiGenerateContent on the v1alpha endpoint.
      // Native audio models only support responseModalities: ["AUDIO"].
      const setupMsg = {
        setup: {
          model: "models/gemini-2.5-flash-native-audio-latest",
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede"
                }
              }
            }
          },
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          tools: [{
            functionDeclarations: [
              {
                name: "createExpense",
                description: "Create a new expense transaction",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    amount: { type: "NUMBER" },
                    category: { type: "STRING" },
                    description: { type: "STRING" }
                  },
                  required: ["amount", "category"]
                }
              },
              {
                name: "createGoal",
                description: "Create a new savings goal",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    targetAmount: { type: "NUMBER" },
                    targetDate: { type: "STRING", description: "ISO date format" }
                  },
                  required: ["name", "targetAmount"]
                }
              },
              {
                name: "createBudget",
                description: "Create a new budget category limit",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    category: { type: "STRING" },
                    limit: { type: "NUMBER" }
                  },
                  required: ["category", "limit"]
                }
              }
            ]
          }]
        }
      };
      
      this.ws?.send(JSON.stringify(setupMsg));
    };

    this.ws.onmessage = async (event) => {
      let data;
      try {
        // The API returns data as a Blob or text JSON
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data);
        }
      } catch (e) {
        console.error("[GeminiLive] Failed to parse message", e);
        return;
      }

      this.handleServerMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error("[GeminiLive] WebSocket error", error);
      this.onStateChange("error");
    };

    this.ws.onclose = (event) => {
      console.warn("[GeminiLive] WebSocket closed", event.code, event.reason);
      // If the connection closed before setup completed, it's an error
      if (!this.setupComplete) {
        this.onStateChange("error");
      } else {
        this.onStateChange("idle");
      }
    };
  }

  private async handleServerMessage(data: any) {
    // Handle setupComplete acknowledgement
    if (data.setupComplete !== undefined) {
      console.log("[GeminiLive] Setup complete, session is live!");
      this.setupComplete = true;
      this.onStateChange("connected");
      return;
    }

    if (data.serverContent?.modelTurn) {
      const parts = data.serverContent.modelTurn.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
            this.onStateChange("speaking");
            this.onAudioReceived(part.inlineData.data);
          }
          if (part.text) {
            this.onTextReceived(part.text, false);
          }
          if (part.functionCall) {
            this.onStateChange("thinking");
            const result = await this.onToolCall(part.functionCall.name, part.functionCall.args);
            this.sendToolResponse(part.functionCall.name, part.functionCall.id, result);
          }
        }
      }
    }
    
    if (data.serverContent?.turnComplete) {
      this.onStateChange("listening");
      this.onTextReceived("", true); // Indicate turn is complete
    }
  }

  sendAudio(base64Pcm: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: "audio/pcm;rate=16000",
            data: base64Pcm
          }]
        }
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  sendToolResponse(name: string, id: string, response: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg = {
        toolResponse: {
          functionResponses: [{
            name,
            id,
            response
          }]
        }
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
