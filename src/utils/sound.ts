// Simple audio utilities for playing sound files
export const playAlarmSound = async () => {
  try {
    console.log('Playing alarm sound...');
    const audio = new Audio('/sound/censor-beep-1-372459.mp3');
    await audio.play();
  } catch (error) {
    console.warn('Failed to play alarm sound:', error);
  }
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