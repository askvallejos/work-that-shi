import { Calendar, Coffee } from "lucide-react";
import { generateDayColor } from "../utils/dateHelpers";

interface RestDayProps {
  day: string;
}

export const RestDay = ({ day }: RestDayProps) => {
  const dayColor = generateDayColor(day);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold capitalize mb-2">{day}</h1>
        <p className="text-xl text-muted-foreground">Rest Day</p>
      </div>
      
      <div className="max-w-md space-y-4">
        <p className="text-lg text-muted-foreground">
          Take a well-deserved break! Recovery is just as important as training.
        </p>
        <p className="text-sm text-muted-foreground">
          Stay hydrated, get good sleep, and prepare for your next workout.
        </p>
      </div>
    </div>
  );
};
