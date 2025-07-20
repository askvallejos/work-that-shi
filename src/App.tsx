import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutDay } from "./components/WorkoutDay";
import { RestDay } from "./components/RestDay";
import { getCurrentDay, getDayFromHash } from "./utils/dateHelpers";
import { WorkoutPlan } from "./types/workout";
import workoutData from "./data/workout.json";

const queryClient = new QueryClient();

const App = () => {
  const [currentDay, setCurrentDay] = useState<string>(() => {
    // Check for hash route first, then fall back to current day
    return getDayFromHash() || getCurrentDay();
  });

  useEffect(() => {
    const handleHashChange = () => {
      const dayFromHash = getDayFromHash();
      if (dayFromHash) {
        setCurrentDay(dayFromHash);
      } else {
        setCurrentDay(getCurrentDay());
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const workoutPlan = workoutData as WorkoutPlan;
  const workout = workoutPlan.workout_plan[currentDay as keyof typeof workoutPlan.workout_plan];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {workout ? (
          <WorkoutDay day={currentDay} workout={workout} />
        ) : (
          <RestDay day={currentDay} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
