import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { triggerHapticFeedback } from '../utils/sound';

import { WorkoutSet } from '../types/workout';

interface SetRowProps {
  set: WorkoutSet;
  exerciseName: string;
  restTime: number;
  isCompleted: boolean;
  onToggle: (setNumber: number) => void;
  onSkip: (setNumber: number) => void;
}

export const SetRow = ({ set, exerciseName, restTime, isCompleted, onToggle, onSkip }: SetRowProps) => {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSwipeStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleSwipeMove = (moveEvent: TouchEvent) => {
      const currentX = moveEvent.touches[0].clientX;
      const diffX = startX - currentX;
      
      if (diffX > 100) { // Swiped left more than 100px
        setIsSkipping(true);
        triggerHapticFeedback();
        document.removeEventListener('touchmove', handleSwipeMove);
        document.removeEventListener('touchend', handleSwipeEnd);
      }
    };
    
    const handleSwipeEnd = () => {
      document.removeEventListener('touchmove', handleSwipeMove);
      document.removeEventListener('touchend', handleSwipeEnd);
    };
    
    document.addEventListener('touchmove', handleSwipeMove);
    document.addEventListener('touchend', handleSwipeEnd);
  };

  const formatWeight = (weight: number) => {
    if (exerciseName.toLowerCase().includes('pull-up') && weight > 0) {
      return `+${weight} lbs`;
    }
    return weight > 0 ? `${weight} lbs` : 'Bodyweight';
  };

  const formatReps = (repsFrom: number, repsTo: number) => {
    return repsFrom === repsTo ? repsFrom.toString() : `${repsFrom}-${repsTo}`;
  };

  return (
    <div
      className={`
        swipe-hint relative transition-all duration-200
        ${isCompleted ? 'opacity-60 bg-success/10' : ''}
        ${isSkipping ? 'haptic-feedback' : ''}
      `}
      onTouchStart={handleSwipeStart}
    >
      <div className="flex items-center gap-3 p-3 border-b border-border/50">
        <div className="touch-target flex items-center justify-center">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(set.set)}
            className="h-5 w-5"
          />
        </div>
        
        <div className="w-8 text-center text-sm font-medium text-muted-foreground">
          {set.set}
        </div>
        
        <div className="flex-shrink-0">
          <span className={`set-chip ${set.type}`}>
            {set.type === 'warm_up' ? 'Warm-up' : 'Work'}
          </span>
        </div>
        
        <div className="flex-1 text-center text-sm font-medium">
          {formatReps(set.reps_from, set.reps_to)}
        </div>
        
        <div className="flex-1 text-center text-sm">
          {formatWeight(set.weight)}
        </div>
        
        <div className="w-16 text-center text-xs text-muted-foreground">
          {restTime}s
        </div>
      </div>
      
      {isSkipping && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-end pr-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onSkip(set.set);
              setIsSkipping(false);
            }}
            className="animate-fade-in"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
      )}
    </div>
  );
};