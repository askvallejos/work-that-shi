import moment from 'moment';

export const getCurrentDay = (): string => {
  return moment().format('dddd').toLowerCase();
};

export const getDayFromHash = (): string | null => {
  const hash = window.location.hash;
  const match = hash.match(/^#\/(\w+)$/);
  return match ? match[1].toLowerCase() : null;
};

export const generateDayColor = (day: string): string => {
  let hash = 0;
  for (let i = 0; i < day.length; i++) {
    const char = day.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};