import { Checkbox } from './ui/checkbox';
import { WorkoutSet } from '../types/workout';

interface SetRowProps {
  set: WorkoutSet;
  exerciseName: string;
  isCompleted: boolean;
  onToggle: (setNumber: number) => void;
  onSkip: (setNumber: number) => void;
}

export const SetRow = ({ set, exerciseName: _exerciseName, isCompleted, onToggle, onSkip: _onSkip }: SetRowProps) => {

  const formatReps = (from: number, to: number) => {
    if (from === 1 && to === 99) return 'AMRAP';
    return from === to ? `${from}` : `${from}-${to}`;
  };  
  
  const formatWeight = (weight: number) => `${weight} lbs`;

  return (
    <tr
      className={`
        relative transition-all duration-200
        ${isCompleted ? 'opacity-60 bg-success/10' : ''}
      `}
    >
      <td className="p-3 border-b border-border/50 relative">
        <div className="touch-target flex items-center justify-center">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(set.set)}
            className="h-8 w-8"
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
      </td>
    </tr>
  );
};