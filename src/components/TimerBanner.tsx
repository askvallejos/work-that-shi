import { Clock, Plus, Minus, X } from 'lucide-react';
import { formatTime } from '../utils/dateHelpers';
import { Button } from './ui/button';

interface TimerBannerProps {
  timeLeft: number;
  initialTime: number;
  onAdjust: (seconds: number) => void;
  onStop: () => void;
}

export const TimerBanner = ({ timeLeft, initialTime, onAdjust, onStop }: TimerBannerProps) => {
  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 timer-banner p-4 animate-slide-up mt-12">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-white" />
          <span className="text-white font-semibold">Rest Timer</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl font-mono font-bold text-white">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAdjust(-15)}
            className="text-white hover:bg-white/20 h-8 px-2 text-xs"
          >
            <Minus className="h-3 w-3 mr-1" />
            15s
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAdjust(30)}
            className="text-white hover:bg-white/20 h-8 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            30s
          </Button>
        </div>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};