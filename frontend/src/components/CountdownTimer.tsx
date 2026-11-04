import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; isExpired: boolean }>({
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center space-x-1 text-xs text-rose-400 font-medium">
        <Clock className="h-3.5 w-3.5" />
        <span>Reservation Expired</span>
      </span>
    );
  }

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium">
      <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
      <span>
        Hold expires in: {format(timeLeft.minutes)}:{format(timeLeft.seconds)}
      </span>
    </div>
  );
};

