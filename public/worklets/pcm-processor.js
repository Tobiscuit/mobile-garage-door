class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0]; // Mono
    
    // Fill buffer
    for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];

        // When buffer is full, flush
        if (this.bufferIndex >= this.bufferSize) {
            this.flush();
        }
    }

    return true;
  }

  flush() {
      // Convert Float32 to Int16
      const pcmData = new Int16Array(this.bufferSize);
      for (let i = 0; i < this.bufferSize; i++) {
          // Clamp and scale
          const s = Math.max(-1, Math.min(1, this.buffer[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Send to Main Thread
      this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
      
      this.bufferIndex = 0;
  }
}

registerProcessor('pcm-processor', PcmProcessor);
