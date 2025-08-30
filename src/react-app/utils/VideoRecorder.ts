export interface VideoExportOptions {
  duration: number; // in seconds
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  format: 'webm' | 'mp4';
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  constructor() {}

  public async startRecording(
    canvas: HTMLCanvasElement,
    options: VideoExportOptions = {
      duration: 10,
      quality: 'medium',
      fps: 30,
      format: 'webm'
    }
  ): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    
    this.recordedChunks = [];

    try {
      // Get stream from canvas
      this.stream = canvas.captureStream(options.fps);
      
      if (!this.stream) {
        throw new Error('Failed to capture canvas stream');
      }

      // Determine video bitrate based on quality
      const bitrates = {
        low: 1000000,    // 1 Mbps
        medium: 2500000, // 2.5 Mbps
        high: 5000000,   // 5 Mbps
        ultra: 10000000  // 10 Mbps
      };

      const mimeType = options.format === 'mp4' 
        ? 'video/mp4; codecs="avc1.42E01E"'
        : 'video/webm; codecs="vp9"';

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
        videoBitsPerSecond: bitrates[options.quality]
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finalizeRecording(options.format);
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      // Auto-stop after specified duration
      setTimeout(() => {
        this.stopRecording();
      }, options.duration * 1000);

    } catch (error) {
      console.error('Error starting video recording:', error);
      throw error;
    }
  }

  public stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }

    this.mediaRecorder.stop();
    this.isRecording = false;

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private finalizeRecording(format: string): void {
    if (this.recordedChunks.length === 0) {
      console.error('No recorded data available');
      return;
    }

    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    
    this.downloadVideo(blob, format);
    this.recordedChunks = [];
  }

  private downloadVideo(blob: Blob, format: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terraformer-planet-${Date.now()}.${format}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  public isRecordingActive(): boolean {
    return this.isRecording;
  }

  public static isSupported(): boolean {
    return !!(window.MediaRecorder &&
             HTMLCanvasElement.prototype.captureStream);
  }

  public static getSupportedFormats(): string[] {
    const formats: string[] = [];
    
    if (MediaRecorder.isTypeSupported('video/webm; codecs="vp9"')) {
      formats.push('webm');
    }
    if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"')) {
      formats.push('mp4');
    }
    
    return formats;
  }

  public async recordTimelapse(
    canvas: HTMLCanvasElement,
    rotationCallback: () => void,
    duration: number = 10,
    quality: VideoExportOptions['quality'] = 'medium'
  ): Promise<void> {
    // Record a full rotation timelapse
    const options: VideoExportOptions = {
      duration,
      quality,
      fps: 30,
      format: 'webm'
    };

    await this.startRecording(canvas, options);
    
    // Trigger rotation animation
    const rotationInterval = setInterval(() => {
      rotationCallback();
    }, 1000 / options.fps);

    // Clean up interval when recording stops
    setTimeout(() => {
      clearInterval(rotationInterval);
    }, duration * 1000);
  }
}
