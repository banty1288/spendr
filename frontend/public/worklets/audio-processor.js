class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.offset = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    
    // We expect the AudioContext to be running at 16000Hz, 
    // so we don't need to downsample manually.
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.offset] = channelData[i];
      this.offset++;

      if (this.offset >= this.bufferSize) {
        this.flush();
      }
    }

    return true;
  }

  flush() {
    // Convert Float32 [-1.0, 1.0] to Int16 [-32768, 32767]
    const pcm16 = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      let s = Math.max(-1, Math.min(1, this.buffer[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    this.buffer = new Float32Array(this.bufferSize);
    this.offset = 0;
  }
}

registerProcessor("audio-processor", AudioProcessor);
