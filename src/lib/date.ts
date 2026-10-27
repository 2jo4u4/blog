/**
 * Edge-Native Timezone Localization Utility
 * Converts UTC database timestamps (from SQLite CURRENT_TIMESTAMP)
 * to Asia/Taipei (UTC+8) local time for Edge SSR rendering.
 */

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

interface TaipeiDateParts {
  year: number;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/**
 * Parses a UTC date string into a Date object.
 * Handles SQLite "YYYY-MM-DD HH:MM:SS" format, ISO-8601 strings, and dates.
 */
export function parseUtcDate(raw: string): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If format is SQLite "YYYY-MM-DD HH:MM:SS" without timezone info, treat as UTC
  let iso = trimmed;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
    iso = trimmed.replace(" ", "T") + "Z";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    iso = trimmed + "T00:00:00Z";
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Extracts Asia/Taipei (UTC+8) date parts from a UTC date string.
 */
function getTaipeiParts(raw: string): TaipeiDateParts | null {
  const date = parseUtcDate(raw);
  if (!date) return null;

  const taipeiDate = new Date(date.getTime() + TAIPEI_OFFSET_MS);
  return {
    year: taipeiDate.getUTCFullYear(),
    month: String(taipeiDate.getUTCMonth() + 1).padStart(2, "0"),
    day: String(taipeiDate.getUTCDate()).padStart(2, "0"),
    hours: String(taipeiDate.getUTCHours()).padStart(2, "0"),
    minutes: String(taipeiDate.getUTCMinutes()).padStart(2, "0"),
    seconds: String(taipeiDate.getUTCSeconds()).padStart(2, "0"),
  };
}

/**
 * Formats a UTC timestamp into Asia/Taipei full date-time string:
 * "YYYY-MM-DD HH:mm:ss"
 * If input is invalid, returns the original string safely.
 */
export function formatTaipeiDateTime(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hours}:${parts.minutes}:${parts.seconds}`;
}

/**
 * Formats a UTC timestamp into Asia/Taipei date-only string:
 * "YYYY-MM-DD"
 * If input is invalid, returns the original string safely.
 */
export function formatTaipeiDate(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Formats a UTC timestamp into standard ISO-8601 with +08:00 offset:
 * "YYYY-MM-DDTHH:mm:ss+08:00"
 * Used for <time dateTime="..."> tags and JSON-LD structured data.
 */
export function toTaipeiISO(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hours}:${parts.minutes}:${parts.seconds}+08:00`;
}
