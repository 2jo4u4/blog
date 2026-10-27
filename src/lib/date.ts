/**
 * Edge-Native Timezone Localization Utility
 * Converts UTC database timestamps (from SQLite CURRENT_TIMESTAMP)
 * to Asia/Taipei (UTC+8) local time for Edge SSR rendering.
 */

interface TaipeiDateParts {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const taipeiFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * Parses a UTC date string into a Date object.
 * Handles SQLite "YYYY-MM-DD HH:MM:SS" format, ISO-8601 strings, and dates with offsets.
 */
export function parseUtcDate(raw: string): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let iso = trimmed;

  // If SQLite "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SS" without timezone info, treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
    iso = trimmed.replace(" ", "T") + "Z";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    iso = trimmed + "T00:00:00Z";
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Extracts Asia/Taipei (UTC+8) date parts from a UTC date string using V8's Intl.DateTimeFormat.
 */
function getTaipeiParts(raw: string): TaipeiDateParts | null {
  const date = parseUtcDate(raw);
  if (!date) return null;

  const parts = taipeiFormatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return {
    year: map.year || "1970",
    month: map.month || "01",
    day: map.day || "01",
    hours: map.hour || "00",
    minutes: map.minute || "00",
    seconds: map.second || "00",
  };
}

/**
 * Formats a UTC timestamp into Asia/Taipei date-only string:
 * "YYYY-MM-DD"
 */
export function formatTaipeiDate(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Formats a UTC timestamp into Asia/Taipei full date-time string:
 * "YYYY-MM-DD HH:mm:ss"
 */
export function formatTaipeiDateTime(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${formatTaipeiDate(raw)} ${parts.hours}:${parts.minutes}:${parts.seconds}`;
}

/**
 * Formats a UTC timestamp into standard ISO-8601 with +08:00 offset:
 * "YYYY-MM-DDTHH:mm:ss+08:00"
 */
export function toTaipeiISO(raw: string): string {
  const parts = getTaipeiParts(raw);
  if (!parts) return raw;
  return `${formatTaipeiDate(raw)}T${parts.hours}:${parts.minutes}:${parts.seconds}+08:00`;
}
