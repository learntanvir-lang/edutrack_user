
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(milliseconds: number): string {
    if (milliseconds < 0) return '0h 0m 0s';

    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    const parts: string[] = [];
    parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);

    return parts.join(' ');
}
