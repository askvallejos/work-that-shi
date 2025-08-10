import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutDay } from "./components/WorkoutDay";
import { RestDay } from "./components/RestDay";
import { DaySelector } from "./components/DaySelector";
import { getCurrentDay, getDayFromHash } from "./utils/dateHelpers";
import { WorkoutPlan } from "./types/workout";

import workoutData from "./data/workout.json";

const queryClient = new QueryClient();

const App = () => {
  const [currentDay, setCurrentDay] = useState<string>(() => {
    return getDayFromHash() || getCurrentDay();
  });
  
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      const dayFromHash = getDayFromHash();
      if (dayFromHash) {
        setCurrentDay(dayFromHash);
        setIsManualSelection(true);
      } else if (!isManualSelection) {
        setCurrentDay(getCurrentDay());
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isManualSelection]);

  const workoutPlan = workoutData as WorkoutPlan;
  const availableDays = Object.keys(workoutPlan.workout_plan);
  const workout = workoutPlan.workout_plan[currentDay as keyof typeof workoutPlan.workout_plan];

  const handleDayChange = (day: string) => {
    setCurrentDay(day);
    setIsManualSelection(true);
    window.location.hash = `#/${day}`;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="h-screen bg-background overflow-hidden">
          <div className="container mx-auto px-4 py-6 w-lg h-full flex flex-col overflow-hidden">
            <DaySelector 
              selectedDay={currentDay}
              onDayChange={handleDayChange}
              availableDays={availableDays}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              {workout && workout.exercises ? (
                <WorkoutDay day={currentDay} workout={workout} />
              ) : (
                <RestDay day={currentDay} />
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
