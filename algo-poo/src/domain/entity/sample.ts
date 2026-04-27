import { EquipmentType, Priority, PriorityRank, SampleType, TechnicianSpeciality } from "../../dto/enums";
import { SampleDTO } from "../../dto/input.dto";
import { DurationMinutes } from "../../types/primitives";
import { TimeOfDay } from "../value-object/time-of-day";
import { Technician } from "./technician";

export class Sample {

  public readonly id: string;
  private readonly type: SampleType;
  public readonly priority: Priority;
  public readonly analysisTime: DurationMinutes;
  public readonly arrivalTime: TimeOfDay;
  public readonly patientId: string;

  constructor(
    id: string,
    type: SampleType,
    priority: Priority,
    analysisTime: DurationMinutes,
    arrivalTime: TimeOfDay,
    patientId: string,
  ) {
    this.id = id;
    this.type = type;
    this.priority = priority;
    this.analysisTime = analysisTime;
    this.arrivalTime = arrivalTime;
    this.patientId = patientId;
  }

  static fromDTO(dto: SampleDTO): Sample {
    return new Sample(
      dto.id,
      dto.type,
      dto.priority,
      dto.analysisTime,
      TimeOfDay.fromString(dto.arrivalTime),
      dto.patientId,
    );
  }

  isCompatibleWithTechnician(technician: { speciality: TechnicianSpeciality }): boolean {
    return technician.speciality === this.type || technician.speciality === TechnicianSpeciality.GENERAL
  }

  isCompatibleWithEquipment(equipment: { type: EquipmentType }): boolean {
    return equipment.type === this.type
  }

  compareForProcessing(other: Sample): number {
    const priorityDiff = PriorityRank[this.priority] - PriorityRank[other.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (this.arrivalTime.isBefore(other.arrivalTime)) return -1;
    if (this.arrivalTime.isAfter(other.arrivalTime)) return 1;
    return 0;

  }

   effectiveDurationFor(technician: Technician): DurationMinutes {
    return Math.round(this.analysisTime / technician.efficiency);
  }
}
