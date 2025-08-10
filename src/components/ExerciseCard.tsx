import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { SetRow } from './SetRow';

import { Exercise } from '../types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  completedSets: Set<number>;
  onSetToggle: (exerciseName: string, setNumber: number) => void;
  onSetSkip: (exerciseName: string, setNumber: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildSetKey = (exerciseName: string, setNumber: number): number => {
  let hash = 0;
  for (let i = 0; i < exerciseName.length; i++) {
    const char = exerciseName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) * 1000 + setNumber;
};

export const ExerciseCard = ({
  exercise,
  completedSets,
  onSetToggle,
  onSetSkip,
  isOpen,
  onOpenChange
}: ExerciseCardProps) => {
  const totalSets = exercise.sets.length;

  const completedCount = useMemo(
    () =>
      exercise.sets.filter((workoutSet) =>
        completedSets.has(buildSetKey(exercise.exercise, workoutSet.set))
      ).length,
    [exercise.exercise, exercise.sets, completedSets]
  );

  const progress = useMemo(
    () => (totalSets > 0 ? (completedCount / totalSets) * 100 : 0),
    [completedCount, totalSets]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="accordion-trigger w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{exercise.exercise}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-sm text-muted-foreground">
                {completedCount} / {totalSets} sets
              </div>
              <div className="flex-1 bg-muted rounded-full h-2 max-w-20">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="border-t border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
                  <th className="p-3 w-8"></th>
                  <th className="p-3 w-8 text-center">Set</th>
                  <th className="p-3 w-16 text-left">Type</th>
                  <th className="p-3 text-center">Reps</th>
                  <th className="p-3 text-center">Weight</th>
                </tr>
              </thead>
              
              <tbody>
                {exercise.sets.map((workoutSet) => (
                  <SetRow
                    key={workoutSet.set}
                    set={workoutSet}
                    exerciseName={exercise.exercise}
                    isCompleted={completedSets.has(buildSetKey(exercise.exercise, workoutSet.set))}
                    onToggle={(setNumber) => onSetToggle(exercise.exercise, setNumber)}
                    onSkip={(setNumber) => onSetSkip(exercise.exercise, setNumber)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};