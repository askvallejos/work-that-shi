import { useEffect, useRef, useCallback } from 'react';

interface WakeLockSentinel {
  release(): Promise<void>;
}

export const useWakeLock = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isRequestedRef = useRef<boolean>(false);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
        }
        
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        isRequestedRef.current = true;
        console.log('Wake lock activated');
        return true;
      } else {
        console.warn('Wake lock not supported');
        return false;
      }
    } catch (error) {
      console.warn('Wake lock failed:', error);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        isRequestedRef.current = false;
        console.log('Wake lock released');
      }
    } catch (error) {
      console.warn('Wake lock release failed:', error);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isRequestedRef.current && !wakeLockRef.current) {
        setTimeout(() => {
          requestWakeLock();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return { 
    requestWakeLock, 
    releaseWakeLock,
    isActive: wakeLockRef.current !== null 
  };
};