
'use client';

import { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: string;
  isPastOrCompleted: boolean;
  variant?: 'default' | 'bordered';
  boxClassName?: string;
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

const CountdownBox = ({ value, label, variant, className }: { value: string; label: string | { short: string; long: string }; variant?: 'default' | 'bordered'; className?: string }) => (
    <div className={cn(
        "rounded-lg p-3 text-center w-full",
        variant === 'bordered' ? "bg-background/50 border" : "bg-background/20 dark:bg-background/50",
        className
    )}>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {typeof label === 'string' ? (
                <span>{label}</span>
            ) : (
                <>
                    <span className="md:hidden">{label.short}</span>
                    <span className="hidden md:inline">{label.long}</span>
                </>
            )}
        </div>
    </div>
);

const MemoizedCountdownBox = memo(CountdownBox);

export function Countdown({ targetDate, isPastOrCompleted, variant = 'default', boxClassName }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate));

  useEffect(() => {
    if (isPastOrCompleted) {
        setTimeLeft(null);
        return;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isPastOrCompleted]);

  const format = (num: number) => num.toString().padStart(2, '0');

  const labels = {
    days: { short: 'Days', long: 'Days' },
    hours: { short: 'Hrs', long: 'Hours' },
    minutes: { short: 'Mins', long: 'Minutes' },
    seconds: { short: 'Secs', long: 'Seconds' },
  }
  
  if (!timeLeft || isPastOrCompleted) {
    return (
        <div className="grid grid-cols-4 gap-2 md:gap-4" aria-label="Countdown timer has finished">
            <MemoizedCountdownBox value="00" label={labels.days} variant={variant} className={boxClassName} />
            <MemoizedCountdownBox value="00" label={labels.hours} variant={variant} className={boxClassName} />
            <MemoizedCountdownBox value="00" label={labels.minutes} variant={variant} className={boxClassName} />
            <MemoizedCountdownBox value="00" label={labels.seconds} variant={variant} className={boxClassName} />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap.4" aria-label="Countdown timer">
        <MemoizedCountdownBox value={format(timeLeft.days)} label={labels.days} variant={variant} className={boxClassName} />
        <MemoizedCountdownBox value={format(timeLeft.hours)} label={labels.hours} variant={variant} className={boxClassName} />
        <MemoizedCountdownBox value={format(timeLeft.minutes)} label={labels.minutes} variant={variant} className={boxClassName} />
        <MemoizedCountdownBox value={format(timeLeft.seconds)} label={labels.seconds} variant={variant} className={boxClassName} />
    </div>
  );
}
