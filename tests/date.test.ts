import { describe, it, expect } from "vitest";
import {
  formatTaipeiDateTime,
  formatTaipeiDate,
  toTaipeiISO,
} from "../src/lib/date";

describe("Timezone Localization (Asia/Taipei, UTC+8)", () => {
  it("converts normal UTC daytime string to Taipei time (+8 hours)", () => {
    // 05:00:19 UTC should be 13:00:19 Taipei
    const utcStr = "2026-10-27 05:00:19";
    expect(formatTaipeiDateTime(utcStr)).toBe("2026-10-27 13:00:19");
    expect(formatTaipeiDate(utcStr)).toBe("2026-10-27");
  });

  it("handles day-boundary crossing correctly", () => {
    // 20:30 UTC on Oct 26 should cross into Oct 27 at 04:30 Taipei
    const utcStr = "2026-10-26 20:30:00";
    expect(formatTaipeiDateTime(utcStr)).toBe("2026-10-27 04:30:00");
    expect(formatTaipeiDate(utcStr)).toBe("2026-10-27");
  });

  it("handles month-boundary crossing correctly", () => {
    // Oct 31 22:00 UTC should cross into Nov 01 06:00 Taipei
    const utcStr = "2026-10-31 22:00:00";
    expect(formatTaipeiDateTime(utcStr)).toBe("2026-11-01 06:00:00");
    expect(formatTaipeiDate(utcStr)).toBe("2026-11-01");
  });

  it("handles year-boundary crossing correctly", () => {
    // Dec 31 20:00 UTC should cross into next year Jan 01 04:00 Taipei
    const utcStr = "2026-12-31 20:00:00";
    expect(formatTaipeiDateTime(utcStr)).toBe("2027-01-01 04:00:00");
    expect(formatTaipeiDate(utcStr)).toBe("2027-01-01");
  });

  it("handles ISO-8601 UTC input with T and Z", () => {
    const isoUtc = "2026-10-27T05:00:19Z";
    expect(formatTaipeiDateTime(isoUtc)).toBe("2026-10-27 13:00:19");
    expect(formatTaipeiDate(isoUtc)).toBe("2026-10-27");
  });

  it("generates correct ISO string with +08:00 offset for HTML time and SEO metadata", () => {
    const utcStr = "2026-10-27 05:00:19";
    expect(toTaipeiISO(utcStr)).toBe("2026-10-27T13:00:19+08:00");
  });

  it("handles empty or invalid date strings gracefully without throwing", () => {
    expect(formatTaipeiDateTime("")).toBe("");
    expect(formatTaipeiDate("")).toBe("");
    expect(toTaipeiISO("")).toBe("");

    expect(formatTaipeiDateTime("invalid-date")).toBe("invalid-date");
    expect(formatTaipeiDate("invalid-date")).toBe("invalid-date");
    expect(toTaipeiISO("invalid-date")).toBe("invalid-date");
  });
});
