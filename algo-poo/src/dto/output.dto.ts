import { Priority, UnscheduledReason } from "./enums";
import { DurationMinutes, TimeString } from "../types/primitives";

export interface ScheduleEntryDTO {
  readonly sampleId: string;
  readonly technicianId: string;
  readonly equipmentId: string;
  readonly startTime: TimeString;
  readonly endTime: TimeString;
  readonly priority: Priority;
}

/** Aggregated metrics for the computed schedule. */
export interface MetricsDTO {
  /** Total schedule span in minutes, from the earliest start to the latest end. */
  readonly totalTime: DurationMinutes;
  /** Resource utilization as a percentage (0-100). */
  readonly efficiency: number;
  /** Number of constraint violations detected (must be 0 for a valid schedule). */
  readonly conflicts: number;
}

export interface UnscheduledSampleDTO {
  readonly sampleId: string;
  readonly reason: UnscheduledReason;
}

export interface PlanifyLabOutputDTO {
  readonly schedule: ReadonlyArray<ScheduleEntryDTO>;
  readonly metrics: Readonly<MetricsDTO>;
  readonly unscheduledSamples: ReadonlyArray<UnscheduledSampleDTO>;
}
