import { useState, useEffect, useRef } from 'react';
import { playAlarmSound, triggerHapticFeedback } from '../utils/sound';
import { useWakeLock } from './useWakeLock';

interface TimerState {
  isActive: boolean;
  timeLeft: number;
  initialTime: number;
}

export const useTimer = () => {
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    timeLeft: 0,
    initialTime: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const startTimer = (seconds: number) => {
    setTimer({
      isActive: true,
      timeLeft: seconds,
      initialTime: seconds
    });
    requestWakeLock();
  };

  const stopTimer = () => {
    setTimer(prev => ({ ...prev, isActive: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    releaseWakeLock();
  };

  const adjustTimer = (secondsToAdd: number) => {
    setTimer(prev => ({
      ...prev,
      timeLeft: Math.max(0, prev.timeLeft + secondsToAdd)
    }));
  };

  useEffect(() => {
    if (timer.isActive && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.timeLeft <= 1) {
            (async () => {
              try {
                await playAlarmSound();
              } catch (error) {
                console.warn('Failed to play timer sound:', error);
              }
            })();
            
            triggerHapticFeedback();
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Rest Timer Complete!', {
                body: 'Time for your next set!',
                icon: '/favicon.ico'
              });
            }
            
            return { ...prev, isActive: false, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (!timer.isActive) {
        releaseWakeLock();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.timeLeft, releaseWakeLock]);

  return {
    timer,
    startTimer,
    stopTimer,
    adjustTimer
  };
};