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
    // Check for hash route first, then fall back to current day
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
    // Update URL hash to reflect selection
    window.location.hash = `#/${day}`;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6 max-w-md">
            <DaySelector 
              selectedDay={currentDay}
              onDayChange={handleDayChange}
              availableDays={availableDays}
            />
            {workout ? (
              <WorkoutDay day={currentDay} workout={workout} />
            ) : (
              <RestDay day={currentDay} />
            )}
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
