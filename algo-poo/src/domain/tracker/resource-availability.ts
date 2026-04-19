import { DurationMinutes } from "../../types/primitives";
import { TimeOfDay } from "../value-object/time-of-day";

/**
 * Tracks the next available time for a single resource (technician or equipment).
 * Only mutable class of the domain: its state evolves as the planner assigns work.
 */
export class ResourceAvailability {
  public readonly resourceId: string;
  private nextFreeTime: TimeOfDay;

  constructor(resourceId: string, initialAvailability: TimeOfDay) {
    this.resourceId = resourceId;
    this.nextFreeTime = initialAvailability;
  }

  getNextFreeTime(): TimeOfDay {
    return this.nextFreeTime;
  }

  occupy(start: TimeOfDay, duration: DurationMinutes): void {
    this.nextFreeTime = start.addMinutes(duration);
  }
}
