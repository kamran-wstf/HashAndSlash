import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { formatTime } from '../utils/timeFormat';
import { Clock } from 'lucide-react';

const GameTimer: React.FC = () => {
  const { status, elapsedTime, updateTimer } = useGameStore();
  const [displayTime, setDisplayTime] = useState(elapsedTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'playing') {
      // Update every second for display
      interval = setInterval(() => {
        const currentElapsed = useGameStore.getState().elapsedTime;
        const startTime = useGameStore.getState().startTime;
        
        if (startTime) {
          const currentTime = Date.now();
          const newElapsed = currentElapsed + (currentTime - startTime);
          setDisplayTime(newElapsed);
        }
      }, 1000);
      
      // Update the actual timer in store every 10 seconds
      const timerUpdate = setInterval(() => {
        updateTimer();
      }, 10000);
      
      return () => {
        if (interval) clearInterval(interval);
        clearInterval(timerUpdate);
      };
    } else {
      // When not playing, just display the current elapsed time
      setDisplayTime(elapsedTime);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, elapsedTime, updateTimer]);

  return (
    <div className="flex items-center justify-center gap-2 bg-paper-200 px-4 py-2 rounded-md shadow">
      <Clock size={18} className="text-indigo-700" />
      <span className="font-mono text-lg">{formatTime(displayTime)}</span>
    </div>
  );
};

export default GameTimer;