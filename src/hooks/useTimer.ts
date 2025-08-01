import { useState, useEffect, useRef, useCallback } from 'react';
import { playAlarmSound, triggerHapticFeedback } from '../utils/sound';

interface TimerState {
  isActive: boolean;
  timeLeft: number;
  initialTime: number;
}

interface TimerPersistentData {
  startTime: number;
  endTime: number;
  initialTime: number;
  isActive: boolean;
}

const TIMER_STORAGE_KEY = 'workout-timer-persistent';

export const useTimer = () => {
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    timeLeft: 0,
    initialTime: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  const calculateTimeLeft = useCallback((persistentData: TimerPersistentData): number => {
    if (!persistentData.isActive) return 0;
    
    const now = Date.now();
    const timeLeft = Math.max(0, Math.ceil((persistentData.endTime - now) / 1000));
    return timeLeft;
  }, []);

  const saveTimerState = useCallback((isActive: boolean, timeLeft: number, initialTime: number) => {
    if (isActive && timeLeft > 0) {
      const now = Date.now();
      const persistentData: TimerPersistentData = {
        startTime: now,
        endTime: now + (timeLeft * 1000),
        initialTime,
        isActive: true
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persistentData));
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TIMER_START',
          endTime: persistentData.endTime,
          initialTime
        });
      }
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY);
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TIMER_STOP'
        });
      }
    }
  }, []);

  const loadTimerState = useCallback(() => {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!stored) return null;
      
      const persistentData: TimerPersistentData = JSON.parse(stored);
      const timeLeft = calculateTimeLeft(persistentData);
      
      if (timeLeft <= 0 && persistentData.isActive) {
        localStorage.removeItem(TIMER_STORAGE_KEY);
        return { isActive: false, timeLeft: 0, initialTime: 0, wasCompleted: true };
      }
      
      return {
        isActive: persistentData.isActive,
        timeLeft,
        initialTime: persistentData.initialTime,
        wasCompleted: false
      };
    } catch (error) {
      console.warn('Failed to load timer state:', error);
      localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }
  }, [calculateTimeLeft]);

  const handleTimerComplete = useCallback(async () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    try {
      await playAlarmSound();
    } catch (error) {
      console.warn('Failed to play timer sound:', error);
    }
    
    triggerHapticFeedback();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Rest Timer Complete!', {
        body: 'Time for your next set!',
        icon: '/favicon.ico',
        tag: 'workout-timer'
      });
    }
    
    setTimer(prev => ({ ...prev, isActive: false, timeLeft: 0 }));
    saveTimerState(false, 0, 0);
  }, [saveTimerState]);

  const startTimer = useCallback((seconds: number) => {
    hasCompletedRef.current = false;
    const newTimer = {
      isActive: true,
      timeLeft: seconds,
      initialTime: seconds
    };
    setTimer(newTimer);
    saveTimerState(true, seconds, seconds);
  }, [saveTimerState]);

  const stopTimer = useCallback(() => {
    hasCompletedRef.current = false;
    setTimer(prev => ({ ...prev, isActive: false }));
    saveTimerState(false, 0, 0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [saveTimerState]);

  const adjustTimer = useCallback((secondsToAdd: number) => {
    setTimer(prev => {
      const newTimeLeft = Math.max(0, prev.timeLeft + secondsToAdd);
      if (prev.isActive && newTimeLeft > 0) {
        saveTimerState(true, newTimeLeft, prev.initialTime);
      } else if (newTimeLeft <= 0) {
        saveTimerState(false, 0, 0);
      }
      return {
        ...prev,
        timeLeft: newTimeLeft,
        isActive: newTimeLeft > 0 ? prev.isActive : false
      };
    });
  }, [saveTimerState]);

  const syncTimerState = useCallback(() => {
    const loadedState = loadTimerState();
    if (loadedState) {
      if (loadedState.wasCompleted && !hasCompletedRef.current) {
        handleTimerComplete();
      } else {
        setTimer({
          isActive: loadedState.isActive,
          timeLeft: loadedState.timeLeft,
          initialTime: loadedState.initialTime
        });
      }
    }
  }, [loadTimerState, handleTimerComplete]);

  useEffect(() => {
    syncTimerState();
  }, [syncTimerState]);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SERVICE_WORKER_READY') {
        const stored = localStorage.getItem(TIMER_STORAGE_KEY);
        if (stored) {
          try {
            const persistentData: TimerPersistentData = JSON.parse(stored);
            if (persistentData.isActive && Date.now() < persistentData.endTime) {
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: 'TIMER_START',
                  endTime: persistentData.endTime,
                  initialTime: persistentData.initialTime
                });
              }
            }
          } catch (error) {
            console.warn('Failed to sync timer with service worker:', error);
          }
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncTimerState();
      }
    };

    const handleFocus = () => {
      syncTimerState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncTimerState]);

  useEffect(() => {
    if (timer.isActive && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const stored = localStorage.getItem(TIMER_STORAGE_KEY);
          if (stored) {
            try {
              const persistentData: TimerPersistentData = JSON.parse(stored);
              const actualTimeLeft = calculateTimeLeft(persistentData);
              
              if (actualTimeLeft <= 0) {
                handleTimerComplete();
                return { ...prev, isActive: false, timeLeft: 0 };
              }
              
              return { ...prev, timeLeft: actualTimeLeft };
            } catch (error) {
              console.warn('Failed to sync timer with storage:', error);
            }
          }
          
          if (prev.timeLeft <= 1) {
            handleTimerComplete();
            return { ...prev, isActive: false, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.timeLeft, calculateTimeLeft, handleTimerComplete]);

  return {
    timer,
    startTimer,
    stopTimer,
    adjustTimer
  };
};