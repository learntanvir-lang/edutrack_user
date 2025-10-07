
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: string;
  isPastOrCompleted: boolean;
  variant?: 'default' | 'bordered';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft | null => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
};

const CountdownBox = ({ value, label, variant }: { value: string; label: string; variant?: 'default' | 'bordered' }) => (
    <div className={cn(
        "rounded-lg p-3 text-center w-full",
        variant === 'bordered' ? "bg-background/50 border" : "bg-background/20 dark:bg-background/50"
    )}>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
);

export function Countdown({ targetDate, isPastOrCompleted, variant = 'default' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (isPastOrCompleted) {
        setTimeLeft(null);
        return;
    }
    // This will only run on the client, after initial hydration
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isPastOrCompleted]);

  const format = (num: number) => num.toString().padStart(2, '0');
  
  if (!timeLeft || isPastOrCompleted) {
    return (
        <div className="grid grid-cols-4 gap-4" aria-label="Countdown timer has finished">
            <CountdownBox value="00" label="Days" variant={variant} />
            <CountdownBox value="00" label="Hours" variant={variant} />
            <CountdownBox value="00" label="Minutes" variant={variant} />
            <CountdownBox value="00" label="Seconds" variant={variant} />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4" aria-label="Countdown timer">
        <CountdownBox value={format(timeLeft.days)} label="Days" variant={variant} />
        <CountdownBox value={format(timeLeft.hours)} label="Hours" variant={variant} />
        <CountdownBox value={format(timeLeft.minutes)} label="Minutes" variant={variant} />
        <CountdownBox value={format(timeLeft.seconds)} label="Seconds" variant={variant} />
    </div>
  );
}
