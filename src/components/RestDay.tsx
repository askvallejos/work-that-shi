import { Calendar, Coffee, Moon } from 'lucide-react';
import { generateDayColor } from '../utils/dateHelpers';

interface RestDayProps {
  day: string;
}

export const RestDay = ({ day }: RestDayProps) => {
  const dayColor = generateDayColor(day);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Rest Day Icon */}
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${dayColor}20`, border: `2px solid ${dayColor}` }}
        >
          <Moon 
            className="h-12 w-12" 
            style={{ color: dayColor }}
          />
        </div>

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

        {/* Motivational GIF Placeholder */}
        <div 
          className="w-full h-48 rounded-lg border border-border flex items-center justify-center"
          style={{ backgroundColor: `${dayColor}10` }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${dayColor}30` }}
            >
              <Calendar 
                className="h-8 w-8" 
                style={{ color: dayColor }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Rest & Recovery Zone
            </p>
          </div>
        </div>

        {/* Recovery Tips */}
        <div className="mt-8 space-y-3 text-left">
          <h3 className="font-semibold text-center mb-4">Recovery Tips</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Stay hydrated throughout the day</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Get 7-9 hours of quality sleep</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Light stretching or walking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};