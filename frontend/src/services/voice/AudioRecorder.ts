export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private onData: ((base64Pcm: string) => void) | null = null;
  private isRecording = false;

  constructor(onData: (base64Pcm: string) => void) {
    this.onData = onData;
  }

  async start() {
    if (this.isRecording) return;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Gemini expects 16kHz
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      await this.audioContext.audioWorklet.addModule("/worklets/audio-processor.js");

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = new AudioWorkletNode(this.audioContext, "audio-processor");

      this.processor.port.onmessage = (event) => {
        if (!this.isRecording) return;
        
        // Receive Int16Array ArrayBuffer
        const buffer = event.data as ArrayBuffer;
        const base64 = this.arrayBufferToBase64(buffer);
        if (this.onData) {
          this.onData(base64);
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      this.isRecording = true;
    } catch (err) {
      console.error("Failed to start audio recorder", err);
      throw err;
    }
  }

  stop() {
    this.isRecording = false;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
