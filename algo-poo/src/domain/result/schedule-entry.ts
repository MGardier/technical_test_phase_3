import { PriorityRank } from "../../dto/enums";
import { ScheduleEntryDTO } from "../../dto/output.dto";
import { Equipment } from "../entity/equipment";
import { Sample } from "../entity/sample";
import { Technician } from "../entity/technician";
import { TimeSlot } from "../value-object/time-slot";

/**
 * Successful assignment of a sample to a technician and an equipment over a time slot.
 * Created by the planner, never built from a DTO.
 */
export class ScheduleEntry {
  public readonly sample: Sample;
  public readonly technician: Technician;
  public readonly equipment: Equipment;
  public readonly timeSlot: TimeSlot;

  constructor(sample: Sample, technician: Technician, equipment: Equipment, timeSlot: TimeSlot) {
    this.sample = sample;
    this.technician = technician;
    this.equipment = equipment;
    this.timeSlot = timeSlot;
  }

  toDTO(): ScheduleEntryDTO {
    return {
      sampleId: this.sample.id,
      technicianId: this.technician.id,
      equipmentId: this.equipment.id,
      startTime: this.timeSlot.start.toString(),
      endTime: this.timeSlot.end.toString(),
      priority: this.sample.priority,
    };
  }

  compareForOutput(other: ScheduleEntry): number {
    const priorityDiff = PriorityRank[this.sample.priority] - PriorityRank[other.sample.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (this.timeSlot.start.isBefore(other.timeSlot.start)) return -1;
    if (this.timeSlot.start.isAfter(other.timeSlot.start)) return 1;
    return 0;
  }
}
