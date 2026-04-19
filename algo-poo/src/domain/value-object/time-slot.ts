import { DurationMinutes } from "../../types/primitives";
import { TimeOfDay } from "./time-of-day";

/**
 * Interval [start, end) within a day.
 * Immutable value object: the constraint start < end is checked at construction.
 */
export class TimeSlot {
  readonly start: TimeOfDay;
  readonly end: TimeOfDay;

  constructor(start: TimeOfDay, end: TimeOfDay) {
    if (!start.isBefore(end))
      throw new Error(`Invalid TimeSlot: start (${start.toString()}) must be strictly before end (${end.toString()}).`);
    
    this.start = start;
    this.end = end;
  }

  static fromStartAndDuration(start: TimeOfDay, duration: DurationMinutes): TimeSlot {
    if (duration <= 0) 
      throw new Error(`Invalid TimeSlot duration: expected > 0, got ${duration}.`);
    
    return new TimeSlot(start, start.addMinutes(duration));
  }

  duration(): DurationMinutes {
    return this.start.minutesUntil(this.end);
  }

  overlaps(other: TimeSlot): boolean {
    return this.start.isBefore(other.end) && other.start.isBefore(this.end);
  }

  contains(time: TimeOfDay): boolean {
    return !time.isBefore(this.start) && time.isBefore(this.end);
  }
}
