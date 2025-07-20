import moment from 'moment';

export const getCurrentDay = (): string => {
  return moment().format('dddd').toLowerCase();
};

export const getDayFromHash = (): string | null => {
  const hash = window.location.hash.replace('#/', '');
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return validDays.includes(hash) ? hash : null;
};

export const generateDayColor = (dayName: string): string => {
  // Hash-based color generation
  let hash = 0;
  for (let i = 0; i < dayName.length; i++) {
    const char = dayName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 86%, 56%)`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};