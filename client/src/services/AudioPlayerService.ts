// Audio Player Service for managing audio playback
export class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isPlaying = false;
  private currentUrl: string | null = null;
  private onEndCallbacks: Array<() => void> = [];
  
  constructor() {
    // Initialize audio element when service is created
    this.initialize();
  }
  
  // Initialize the audio element
  private initialize(): void {
    if (typeof window === 'undefined') return;
    
    if (!this.isInitialized) {
      try {
        this.audio = new Audio();
        this.audio.addEventListener('ended', this.handleAudioEnded.bind(this));
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize audio player:', error);
      }
    }
  }
  
  // Play audio from a given URL
  public play(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.audio) {
        this.initialize();
        if (!this.audio) {
          reject(new Error('Audio player initialization failed'));
          return;
        }
      }
      
      // If already playing, pause first
      if (this.isPlaying) {
        this.pause();
      }
      
      // If it's a new audio file, load it
      if (this.currentUrl !== url) {
        this.audio.src = url;
        this.currentUrl = url;
      }
      
      // Play the audio
      const playPromise = this.audio.play();
      
      if (playPromise) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            resolve();
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            reject(error);
          });
      } else {
        this.isPlaying = true;
        resolve();
      }
    });
  }
  
  // Pause the currently playing audio
  public pause(): void {
    if (this.isPlaying && this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }
  
  // Resume a paused audio
  public resume(): Promise<void> {
    if (!this.isPlaying && this.audio && this.currentUrl) {
      return this.play(this.currentUrl);
    }
    return Promise.resolve();
  }
  
  // Stop the audio completely
  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
  
  // Check if audio is currently playing
  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }
  
  // Get the URL of the currently loaded audio
  public getCurrentAudioUrl(): string | null {
    return this.currentUrl;
  }
  
  // Set volume (0.0 to 1.0)
  public setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
  
  // Register a callback to be called when audio finishes playing
  public onEnd(callback: () => void): () => void {
    this.onEndCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.onEndCallbacks = this.onEndCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Handle the audio ended event
  private handleAudioEnded(): void {
    this.isPlaying = false;
    this.onEndCallbacks.forEach(callback => callback());
  }
  
  // Clean up resources
  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('ended', this.handleAudioEnded.bind(this));
      this.audio = null;
    }
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentUrl = null;
    this.onEndCallbacks = [];
  }
}

// Singleton instance
export const audioPlayer = new AudioPlayerService();