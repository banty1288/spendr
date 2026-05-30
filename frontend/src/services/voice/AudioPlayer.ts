export class AudioPlayer {
  private audioContext: AudioContext;
  private nextStartTime: number = 0;
  // Gemini Multimodal Live API returns 24kHz audio
  private sampleRate = 24000;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });
  }

  async playBase64Pcm(base64Pcm: string) {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert Int16 to Float32
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 32768 : 32767);
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    // Schedule seamlessly
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05; // 50ms buffer
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  stop() {
    this.nextStartTime = 0;
    // Fast way to stop everything is to suspend or close and recreate context
    // We can just recreate context for simplicity or wait for garbage collection
  }

  clearQueue() {
    this.nextStartTime = this.audioContext.currentTime;
  }

  close() {
    this.audioContext.close();
  }
}
