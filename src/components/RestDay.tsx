import { Calendar, Coffee, Moon } from 'lucide-react';
import { generateDayColor } from '../utils/dateHelpers';

interface RestDayProps {
  day: string;
}

export const RestDay = ({ day }: RestDayProps) => {
  const dayColor = generateDayColor(day);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="text-center max-w-md flex flex-col items-center justify-center mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-2 capitalize">
          {day}
        </h1>
        <h2 className="text-xl text-muted-foreground mb-6">
          Rest Day
        </h2>

        {/* Message */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <Coffee className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-2">Time to recover!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your body grows stronger during rest. Use this time to stretch, 
            hydrate, and prepare for your next workout session.
          </p>
        </div>
      </div>
    </div>
  );
};
