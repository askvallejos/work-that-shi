import { useState, useEffect } from 'react';
import { MoreVertical, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { TimerBanner } from './TimerBanner';
import { useTimer } from '../hooks/useTimer';
import { generateDayColor } from '../utils/dateHelpers';
import { initializeAudio, testAudio } from '../utils/sound';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { WorkoutData } from '../types/workout';

interface WorkoutDayProps {
  day: string;
  workout: WorkoutData;
}

export const WorkoutDay = ({ day, workout }: WorkoutDayProps) => {
  const [completedSets, setCompletedSets] = useState<globalThis.Set<number>>(new globalThis.Set());
  const [openExercises, setOpenExercises] = useState<globalThis.Set<string>>(new globalThis.Set([workout.exercises[0]?.exercise]));
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const { timer, startTimer, stopTimer, adjustTimer } = useTimer();

  const dayColor = generateDayColor(day);

  useEffect(() => {
    const saved = localStorage.getItem(`workout-progress-${day}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedSets(new globalThis.Set(data.completedSets));
        setOpenExercises(new globalThis.Set(data.openExercises));
      } catch (error) {
        console.warn('Failed to load progress:', error);
      }
    }
  }, [day]);

  useEffect(() => {
    const data = {
      completedSets: Array.from(completedSets),
      openExercises: Array.from(openExercises)
    };
    localStorage.setItem(`workout-progress-${day}`, JSON.stringify(data));
  }, [completedSets, openExercises, day]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const initializeAudioOnInteraction = async () => {
      const success = await initializeAudio();
      setAudioInitialized(success);
      document.removeEventListener('click', initializeAudioOnInteraction);
      document.removeEventListener('touchstart', initializeAudioOnInteraction);
    };

    document.addEventListener('click', initializeAudioOnInteraction);
    document.addEventListener('touchstart', initializeAudioOnInteraction);

    return () => {
      document.removeEventListener('click', initializeAudioOnInteraction);
      document.removeEventListener('touchstart', initializeAudioOnInteraction);
    };
  }, []);

  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const completedCount = completedSets.size;
  const progress = (completedCount / totalSets) * 100;

  // Create deterministic keys from exercise names to avoid conflicts
  const createSetKey = (exerciseName: string, setNumber: number) => {
    let hash = 0;
    for (let i = 0; i < exerciseName.length; i++) {
      const char = exerciseName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) * 1000 + setNumber;
  };

  const handleSetToggle = (exerciseName: string, setNumber: number) => {
    const setKey = createSetKey(exerciseName, setNumber);
    const newCompletedSets = new globalThis.Set(completedSets);
    
    if (completedSets.has(setKey)) {
      newCompletedSets.delete(setKey);
    } else {
      newCompletedSets.add(setKey);
      
      const exercise = workout.exercises.find(ex => ex.exercise === exerciseName);
      if (exercise) {
        startTimer(exercise.rest_between_sets);
      }
      
      setTimeout(() => {
        const nextUnfinishedSet = findNextUnfinishedSet(newCompletedSets);
        if (nextUnfinishedSet) {
          const element = document.getElementById(`set-${nextUnfinishedSet.exercise}-${nextUnfinishedSet.set}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
    
    setCompletedSets(newCompletedSets);
  };

  const findNextUnfinishedSet = (completed: globalThis.Set<number>) => {
    for (const exercise of workout.exercises) {
      for (const workoutSet of exercise.sets) {
        const setKey = createSetKey(exercise.exercise, workoutSet.set);
        if (!completed.has(setKey)) {
          return { exercise: exercise.exercise, set: workoutSet.set };
        }
      }
    }
    return null;
  };

  const handleSetSkip = (exerciseName: string, setNumber: number) => {
    const setKey = createSetKey(exerciseName, setNumber);
    const newCompletedSets = new globalThis.Set(completedSets);
    newCompletedSets.add(setKey);
    setCompletedSets(newCompletedSets);
  };

  const handleExerciseToggle = (exerciseName: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenExercises(new globalThis.Set([exerciseName]));
    } else {
      setOpenExercises(new globalThis.Set());
    }
  };

  const resetDay = () => {
    setCompletedSets(new globalThis.Set());
    setOpenExercises(new globalThis.Set([workout.exercises[0]?.exercise]));
    stopTimer();
    localStorage.removeItem(`workout-progress-${day}`);
  };

  const testSound = async () => {
    const success = await testAudio();
    setAudioInitialized(success);
    if (!success) {
      console.warn('Sound test failed - audio may not work when timer ends');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {timer.isActive && (
        <TimerBanner
          timeLeft={timer.timeLeft}
          initialTime={timer.initialTime}
          onAdjust={adjustTimer}
          onStop={stopTimer}
        />
      )}
      
      <div 
        className={`sticky top-0 z-40 p-4 border-b border-border backdrop-blur-sm bg-background/80 transition-all duration-300 ${
          timer.isActive ? 'mt-24' : ''
        }`}
        style={{ '--day-color': dayColor } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold capitalize">{day}</h1>
              <p className="text-sm text-muted-foreground">{workout.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={testSound}
              className="h-8 w-8 p-0"
              title={audioInitialized ? "Test timer sound" : "Initialize and test sound"}
            >
              {audioInitialized ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 opacity-60" />
              )}
            </Button>
            
            <div className="relative">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke={dayColor}
                  strokeWidth="2"
                  strokeDasharray={`${88 * (progress / 100)} 88`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={resetDay} className="text-destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Day
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exercise}
            exercise={exercise}
            completedSets={completedSets}
            onSetToggle={handleSetToggle}
            onSetSkip={handleSetSkip}
            isOpen={openExercises.has(exercise.exercise)}
            onOpenChange={(isOpen) => handleExerciseToggle(exercise.exercise, isOpen)}
          />
        ))}
      </div>
    </div>
  );
};