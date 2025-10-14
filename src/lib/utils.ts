
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) return '0s';

    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    let parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }
    if (seconds > 0 && hours === 0 && minutes < 5) { // Only show seconds if duration is short
        parts.push(`${seconds}s`);
    }

    if (parts.length === 0) {
        if (milliseconds > 0) {
            return '< 1m';
        }
        return '0m';
    }

    return parts.join(' ');
}
