import { TechnicianSpeciality } from "../../dto/enums";
import {  TechnicianDTO } from "../../dto/input.dto";

import { DurationMinutes, EfficiencyCoefficient } from "../../types/primitives";
import { TimeOfDay } from "../value-object/time-of-day";


export class Technician {

  public readonly id: string;
  public readonly name: string;
  public readonly efficiency: EfficiencyCoefficient;
  public readonly speciality: TechnicianSpeciality;
  public readonly startTime: TimeOfDay;
  public readonly endTime: TimeOfDay;


  constructor(
    id: string,
    name: string,
    efficiency: EfficiencyCoefficient,
    speciality: TechnicianSpeciality,
    startTime: TimeOfDay,
    endTime: TimeOfDay,

  ) {
    this.id = id;
    this.name = name;
    this.efficiency = efficiency;
    this.speciality = speciality;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  static fromDTO(dto: TechnicianDTO): Technician {
    return new Technician(
      dto.id,
      dto.name,
      dto.efficiency,
      dto.speciality,
      TimeOfDay.fromString(dto.startTime),
      TimeOfDay.fromString(dto.endTime),
    );
  }

  canFitAnalysis(startTime: TimeOfDay, duration: DurationMinutes): boolean {
        // const effectiveDuration = Math.round(sample.analysisTime / bestAssignment.tech.efficiency);
        // const timeSlot = TimeSlot.fromStartAndDuration(bestAssignment.start, effectiveDuration);
    const endTime = startTime.addMinutes(duration);
    return !startTime.isBefore(this.startTime) && !endTime.isAfter(this.endTime);
  }

}
