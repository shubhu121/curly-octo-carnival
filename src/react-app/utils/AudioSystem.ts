export interface AudioTrack {
  name: string;
  description: string;
  url: string;
  volume: number;
}

export class AudioSystem {
  private static audioTracks: AudioTrack[] = [
    {
      name: "Deep Space Ambient",
      description: "Mysterious cosmic sounds with distant echoes",
      url: "https://www.soundjay.com/misc/sounds-823.mp3", // Placeholder - would use actual space ambient tracks
      volume: 0.3
    },
    {
      name: "Stellar Winds",
      description: "Ethereal winds and solar particles",
      url: "https://www.soundjay.com/misc/sounds-824.mp3",
      volume: 0.4
    },
    {
      name: "Cosmic Harmony",
      description: "Peaceful interstellar meditation",
      url: "https://www.soundjay.com/misc/sounds-825.mp3",
      volume: 0.35
    },
    {
      name: "Nebula Dreams",
      description: "Dreamy cosmic soundscape",
      url: "https://www.soundjay.com/misc/sounds-826.mp3",
      volume: 0.3
    },
    {
      name: "Solar System",
      description: "Rhythmic planetary movements",
      url: "https://www.soundjay.com/misc/sounds-827.mp3",
      volume: 0.4
    }
  ];

  private currentAudio: HTMLAudioElement | null = null;
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private masterVolume: number = 0.5;
  private isMuted: boolean = false;

  constructor() {
    // Use Web Audio API compatible sounds or create procedural audio
    this.initializeProceeduralAudio();
  }

  private initializeProceeduralAudio() {
    // Since we can't rely on external audio files, we'll create procedural ambient sounds
    // using Web Audio API for a better user experience
  }

  public static getTrackNames(): string[] {
    return this.audioTracks.map(track => track.name);
  }

  public static getTrackDescriptions(): string[] {
    return this.audioTracks.map(track => track.description);
  }

  public playTrack(trackIndex: number): void {
    if (trackIndex < 0 || trackIndex >= AudioSystem.audioTracks.length) return;
    
    this.stopCurrentTrack();
    this.currentTrackIndex = trackIndex;
    
    // Create procedural ambient audio based on track type
    this.createProceduralAmbient(trackIndex);
    this.isPlaying = true;
  }

  public stopCurrentTrack(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  public togglePlayPause(): boolean {
    if (this.isPlaying) {
      this.stopCurrentTrack();
      return false;
    } else {
      this.playTrack(this.currentTrackIndex);
      return true;
    }
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.isMuted ? 0 : this.masterVolume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.currentAudio) {
      this.currentAudio.volume = this.isMuted ? 0 : this.masterVolume;
    }
    return this.isMuted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public isMutedStatus(): boolean {
    return this.isMuted;
  }

  public isPlayingStatus(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  private createProceduralAmbient(trackIndex: number): void {
    // Create ambient sounds using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create different ambient sounds based on track
      switch (trackIndex) {
        case 0: // Deep Space Ambient
          this.createDeepSpaceAmbient(audioContext);
          break;
        case 1: // Stellar Winds
          this.createStellarWindsAmbient(audioContext);
          break;
        case 2: // Cosmic Harmony
          this.createCosmicHarmonyAmbient(audioContext);
          break;
        case 3: // Nebula Dreams
          this.createNebulaDreamsAmbient(audioContext);
          break;
        case 4: // Solar System
          this.createSolarSystemAmbient(audioContext);
          break;
      }
    } catch (error) {
      console.log('Web Audio API not supported, using fallback');
      this.createFallbackAmbient();
    }
  }

  private createDeepSpaceAmbient(audioContext: AudioContext): void {
    // Low frequency rumble with occasional high-pitched tones
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime);
    
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(120, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.3, audioContext.currentTime);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    
    // Add some variation
    setInterval(() => {
      if (this.isPlaying && !this.isMuted) {
        oscillator1.frequency.setValueAtTime(60 + Math.random() * 20, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(120 + Math.random() * 40, audioContext.currentTime);
      }
    }, 2000);
  }

  private createStellarWindsAmbient(audioContext: AudioContext): void {
    // White noise filtered to create wind-like sounds
    const bufferSize = 4096;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.2, audioContext.currentTime);
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    whiteNoise.start();
  }

  private createCosmicHarmonyAmbient(audioContext: AudioContext): void {
    // Harmonic tones creating a peaceful atmosphere
    const frequencies = [220, 330, 440, 660]; // Harmonious frequencies
    const oscillators: OscillatorNode[] = [];
    const gainNode = audioContext.createGain();
    
    gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.25, audioContext.currentTime);
    
    frequencies.forEach((freq) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscGain.gain.setValueAtTime(0.1 / frequencies.length, audioContext.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start();
      oscillators.push(osc);
    });
  }

  private createNebulaDreamsAmbient(audioContext: AudioContext): void {
    // Soft, dreamy pad sounds
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.15, audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
  }

  private createSolarSystemAmbient(audioContext: AudioContext): void {
    // Rhythmic pulses representing planetary movements
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    // Create rhythmic pulses
    setInterval(() => {
      if (this.isPlaying && !this.isMuted) {
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      }
    }, 1500);
  }

  private createFallbackAmbient(): void {
    // Fallback for browsers that don't support Web Audio API
    console.log('Playing ambient audio track:', AudioSystem.audioTracks[this.currentTrackIndex].name);
  }
}
