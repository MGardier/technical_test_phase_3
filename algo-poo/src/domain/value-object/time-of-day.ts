import { DurationMinutes, TimeString } from "../../types/primitives";

/**
 * A specific time of day (‘09:30’), expressed in minutes since midnight.
 * Immutable value object: any operation returns a new instance.
 */
export class TimeOfDay {
  private static readonly FORMAT = /^(\d{2}):(\d{2})$/;
  private static readonly MINUTES_PER_HOUR = 60;


  private readonly minutes: number;

  private constructor(minutes: number) {
    this.minutes = minutes;
  }

  static fromString(hhmm: TimeString): TimeOfDay {
    
    const match = TimeOfDay.FORMAT.exec(hhmm);
    if (!match) throw new Error(`Invalid time format "${hhmm}": expected "HH:MM".`);

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
      throw new Error(`Invalid time "${hhmm}": hours must be 0-23, minutes 0-59.`);
    }

    return new TimeOfDay(hours * TimeOfDay.MINUTES_PER_HOUR + minutes);
  }

  toString(): TimeString {
    const hours = Math.floor(this.minutes / TimeOfDay.MINUTES_PER_HOUR);
    const minutes = this.minutes % TimeOfDay.MINUTES_PER_HOUR;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}` as TimeString;
  }

  isBefore(other: TimeOfDay): boolean {
    return this.minutes < other.minutes;
  }

  isAfter(other: TimeOfDay): boolean {
    return this.minutes > other.minutes;
  }

  isEqual(other: TimeOfDay): boolean {
    return this.minutes === other.minutes;
  }

  addMinutes(n: DurationMinutes): TimeOfDay {
    const total = this.minutes + n;

    if (total < 0)
      throw new Error(`addMinutes overflow: ${this.toString()} + ${n}min can't be less than 0 minutes .`);

    return new TimeOfDay(total);
  }

  minutesUntil(other: TimeOfDay): DurationMinutes {
    return Math.abs(other.minutes - this.minutes);
  }

  static max(...times: TimeOfDay[]): TimeOfDay {
    if (times.length === 0)
      throw new Error("TimeOfDay.max requires at least one argument.");

    return times.reduce((acc, t) => (t.isAfter(acc) ? t : acc));
  }

  static min(...times: TimeOfDay[]): TimeOfDay {
    if (times.length === 0)
      throw new Error("TimeOfDay.min requires at least one argument.");

    return times.reduce((acc, t) => (t.isBefore(acc) ? t : acc));
  }
}
