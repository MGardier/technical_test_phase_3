import { Equipment } from "../domain/entity/equipment";
import { Technician } from "../domain/entity/technician";
import { ScheduleEntry } from "../domain/result/schedule-entry";
import { UnscheduledSample } from "../domain/result/unscheduled-sample";
import { TimeOfDay } from "../domain/value-object/time-of-day";
import { UnscheduledReason } from "../dto/enums";


export type AssignmentResult =
  | { kind: "assigned"; entry: ScheduleEntry }
  | { kind: "unassigned"; reason: UnscheduledReason };

export type BestAssignment = { tech: Technician; equip: Equipment; start: TimeOfDay }

export type PlanResult = { scheduleEntries: ScheduleEntry[]; unscheduledSamples: UnscheduledSample[] } 


