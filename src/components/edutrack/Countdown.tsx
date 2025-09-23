'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
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

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Set initial value on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
        <div className="grid grid-cols-4 gap-2 text-center">
            <div>
                <div className="text-2xl font-bold">00</div>
                <div className="text-xs text-muted-foreground">Days</div>
            </div>
            <div>
                <div className="text-2xl font-bold">00</div>
                <div className="text-xs text-muted-foreground">Hours</div>
            </div>
            <div>
                <div className="text-2xl font-bold">00</div>
                <div className="text-xs text-muted-foreground">Mins</div>
            </div>
            <div>
                <div className="text-2xl font-bold">00</div>
                <div className="text-xs text-muted-foreground">Secs</div>
            </div>
        </div>
    );
  }

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="grid grid-cols-4 gap-2 text-center" aria-label="Countdown timer">
      <div>
        <div className="text-2xl font-bold" aria-label={`${timeLeft.days} days`}>{format(timeLeft.days)}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div>
        <div className="text-2xl font-bold" aria-label={`${timeLeft.hours} hours`}>{format(timeLeft.hours)}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div>
        <div className="text-2xl font-bold" aria-label={`${timeLeft.minutes} minutes`}>{format(timeLeft.minutes)}</div>
        <div className="text-xs text-muted-foreground">Mins</div>
      </div>
      <div>
        <div className="text-2xl font-bold" aria-label={`${timeLeft.seconds} seconds`}>{format(timeLeft.seconds)}</div>
        <div className="text-xs text-muted-foreground">Secs</div>
      </div>
    </div>
  );
}
