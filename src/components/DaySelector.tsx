import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DaySelectorProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  availableDays: string[];
}

export const DaySelector = ({ selectedDay, onDayChange, availableDays }: DaySelectorProps) => {
  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };

  return (
    <div className="flex justify-center items-center gap-2 mb-4">
      <Select value={selectedDay} onValueChange={onDayChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select day" />
        </SelectTrigger>
        <SelectContent>
          {availableDays.map((day) => (
            <SelectItem key={day} value={day}>
              {dayNames[day]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};