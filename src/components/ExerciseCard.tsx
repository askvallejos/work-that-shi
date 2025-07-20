import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { SetRow } from './SetRow';

import { WorkoutSet, Exercise } from '../types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  completedSets: globalThis.Set<number>;
  onSetToggle: (exerciseName: string, setNumber: number) => void;
  onSetSkip: (exerciseName: string, setNumber: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExerciseCard = ({
  exercise,
  completedSets,
  onSetToggle,
  onSetSkip,
  isOpen,
  onOpenChange
}: ExerciseCardProps) => {
  const completedCount = exercise.sets.filter(workoutSet => 
    completedSets.has(parseInt(`${exercise.exercise}-${workoutSet.set}`))
  ).length;
  
  const totalSets = exercise.sets.length;
  const progress = (completedCount / totalSets) * 100;

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
            {/* Table Header */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
              <div className="w-8"></div>
              <div className="w-8 text-center">Set</div>
              <div className="flex-shrink-0 w-16">Type</div>
              <div className="flex-1 text-center">Reps</div>
              <div className="flex-1 text-center">Weight</div>
              <div className="w-16 text-center">Rest</div>
            </div>
            
            {/* Sets */}
            {exercise.sets.map((workoutSet) => (
              <SetRow
                key={workoutSet.set}
                set={workoutSet}
                exerciseName={exercise.exercise}
                restTime={exercise.rest_between_sets}
                isCompleted={completedSets.has(parseInt(`${exercise.exercise}-${workoutSet.set}`))}
                onToggle={(setNumber) => onSetToggle(exercise.exercise, setNumber)}
                onSkip={(setNumber) => onSetSkip(exercise.exercise, setNumber)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};