import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LogLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getLevelBadgeVariant(
  level: LogLevel
): "default" | "destructive" | "outline" | "secondary" {
  switch (level) {
    case "ERROR":
      return "destructive";
    case "WARN":
      return "secondary";
    case "INFO":
      return "default";
    case "DEBUG":
      return "outline";
    case "UNKNOWN":
      return "outline";
    default:
      return "default";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
