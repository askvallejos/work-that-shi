// Audio management with proper browser autoplay policy handling
class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      // Pre-create the audio element
      this.audio = new Audio('/sound/censor-beep-1-372459.mp3');
      this.audio.preload = 'auto';
      this.audio.volume = 0.8;
      
      // Set up audio event listeners
      this.audio.addEventListener('canplaythrough', () => {
        console.log('Audio pre-loaded successfully');
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio failed to load:', e);
      });

    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // Initialize audio context on first user interaction
  async initializeAudioContext() {
    if (this.isInitialized) return true;

    try {
      // Create or resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Load and prepare the audio
      if (this.audio) {
        await this.audio.load();
        this.isInitialized = true;
        console.log('Audio context initialized successfully');
        return true;
      }
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }

    return false;
  }

  async playAlarm(): Promise<boolean> {
    try {
      if (!this.audio) {
        console.warn('Audio not available');
        return false;
      }

      // Ensure audio context is initialized
      if (!this.isInitialized) {
        const initialized = await this.initializeAudioContext();
        if (!initialized) {
          console.warn('Audio context not initialized');
          return false;
        }
      }

      // Reset audio to beginning
      this.audio.currentTime = 0;
      
      // Play the audio
      await this.audio.play();
      console.log('Alarm sound played successfully');
      return true;

    } catch (error) {
      console.warn('Failed to play alarm sound:', error);
      return false;
    }
  }

  // Test if audio can be played (useful for debugging)
  async testAudio(): Promise<boolean> {
    const success = await this.playAlarm();
    if (success) {
      console.log('Audio test passed');
    } else {
      console.warn('Audio test failed - check browser autoplay policy');
    }
    return success;
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// Main API functions
export const playAlarmSound = async (): Promise<boolean> => {
  console.log('Playing alarm sound...');
  return await audioManager.playAlarm();
};

export const initializeAudio = async (): Promise<boolean> => {
  return await audioManager.initializeAudioContext();
};

export const testAudio = async (): Promise<boolean> => {
  return await audioManager.testAudio();
};

export const triggerHapticFeedback = () => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};