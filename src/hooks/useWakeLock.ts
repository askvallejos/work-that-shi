import { useEffect, useRef } from 'react';

interface WakeLockSentinel {
  release(): Promise<void>;
}

export const useWakeLock = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake lock activated');
      }
    } catch (error) {
      console.warn('Wake lock failed:', error);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake lock released');
      }
    } catch (error) {
      console.warn('Wake lock release failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  return { requestWakeLock, releaseWakeLock };
};