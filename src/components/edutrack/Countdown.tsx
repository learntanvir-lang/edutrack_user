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

const CountdownBox = ({ value, label }: { value: string; label: string }) => (
    <div className="bg-primary-foreground/10 rounded-lg p-3 text-center w-full">
        <div className="text-4xl font-bold text-primary-foreground">{value}</div>
        <div className="text-xs text-primary-foreground/70 uppercase tracking-widest">{label}</div>
    </div>
);

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const format = (num: number) => num.toString().padStart(2, '0');
  
  if (!timeLeft) {
    return (
        <div className="grid grid-cols-4 gap-4" aria-label="Countdown timer has finished">
            <CountdownBox value="00" label="Days" />
            <CountdownBox value="00" label="Hours" />
            <CountdownBox value="00" label="Minutes" />
            <CountdownBox value="00" label="Seconds" />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4" aria-label="Countdown timer">
        <CountdownBox value={format(timeLeft.days)} label="Days" />
        <CountdownBox value={format(timeLeft.hours)} label="Hours" />
        <CountdownBox value={format(timeLeft.minutes)} label="Minutes" />
        <CountdownBox value={format(timeLeft.seconds)} label="Seconds" />
    </div>
  );
}
