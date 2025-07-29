import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

import { WorkoutSet } from '../types/workout';

interface SetRowProps {
  set: WorkoutSet;
  exerciseName: string;
  isCompleted: boolean;
  onToggle: (setNumber: number) => void;
  onSkip: (setNumber: number) => void;
}

export const SetRow = ({ set, exerciseName, isCompleted, onToggle, onSkip }: SetRowProps) => {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSwipeStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    
    const handleSwipeMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const diffX = startX - currentX;
      
      if (diffX > 100) {
        setIsSkipping(true);
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

  const formatReps = (from: number, to: number) => {
    return from === to ? `${from}` : `${from}-${to}`;
  };

  const formatWeight = (weight: number) => {
    return `${weight} lbs`;
  };

  return (
    <tr
      className={`
        swipe-hint relative transition-all duration-200
        ${isCompleted ? 'opacity-60 bg-success/10' : ''}
        ${isSkipping ? 'haptic-feedback' : ''}
      `}
      onTouchStart={handleSwipeStart}
    >
      <td className="p-3 border-b border-border/50 relative">
        <div className="touch-target flex items-center justify-center">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(set.set)}
            className="h-5 w-5"
          />
        </div>
      </td>
      
      <td className="p-3 w-8 text-center text-sm font-medium text-muted-foreground border-b border-border/50 relative">
        {set.set}
      </td>
      
      <td className="p-3 w-16 border-b border-border/50 relative">
        <span className={`set-chip ${set.type === 'warm_up' ? 'warm-up' : 'work'} w-full text-center`}>
          {set.type === 'warm_up' ? 'Warm-up' : 'Work'}
        </span>
      </td>
      
      <td className="p-3 text-center text-sm font-medium border-b border-border/50 relative">
        {formatReps(set.reps_from, set.reps_to)}
      </td>
      
      <td className="p-3 text-center text-sm border-b border-border/50 relative">
        {formatWeight(set.weight)}
        
        {isSkipping && (
          <div className="absolute inset-0 left-[-100%] right-[-100%] top-0 bottom-0 bg-destructive/20 flex items-center justify-end pr-4">
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
      </td>
    </tr>
  );
};