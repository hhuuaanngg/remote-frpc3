import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function proxyTypeColor(type: string): string {
  const colors: Record<string, string> = {
    tcp: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    udp: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    http: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    https: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    stcp: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    sudp: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    xtcp: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
    tcpmux: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  };
  return colors[type] || 'bg-muted text-muted-foreground';
}

export function visitorTypeColor(type: string): string {
  const colors: Record<string, string> = {
    stcp: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    xtcp: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
  };
  return colors[type] || 'bg-muted text-muted-foreground';
}
