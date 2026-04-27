import { TechnicianSpeciality } from "../../dto/enums";
import { TechnicianDTO } from "../../dto/input.dto";

import { DurationMinutes, EfficiencyCoefficient } from "../../types/primitives";
import { TimeOfDay } from "../value-object/time-of-day";
import { TimeSlot } from "../value-object/time-slot";


export class Technician {

  public readonly id: string;
  public readonly name: string;
  public readonly efficiency: EfficiencyCoefficient;
  public readonly speciality: TechnicianSpeciality;
  public readonly startTime: TimeOfDay;
  public readonly endTime: TimeOfDay;
  public readonly lunchBreak: TimeSlot;


  constructor(
    id: string,
    name: string,
    efficiency: EfficiencyCoefficient,
    speciality: TechnicianSpeciality,
    startTime: TimeOfDay,
    endTime: TimeOfDay,
    lunchBreak: TimeSlot,

  ) {
    this.id = id;
    this.name = name;
    this.efficiency = efficiency;
    this.speciality = speciality;
    this.startTime = startTime;
    this.endTime = endTime;
    this.lunchBreak = lunchBreak;

  }

  static fromDTO(dto: TechnicianDTO): Technician {
    return new Technician(
      dto.id,
      dto.name,
      dto.efficiency,
      dto.speciality,
      TimeOfDay.fromString(dto.startTime),
      TimeOfDay.fromString(dto.endTime),
      new TimeSlot(
              TimeOfDay.fromString(dto.lunchBreak.start),
              TimeOfDay.fromString(dto.lunchBreak.end),
      ),
    );
  }

  canFitAnalysis(startTime: TimeOfDay, duration: DurationMinutes): boolean {

    // Constraint 1: within shift hours 
    const endTime = startTime.addMinutes(duration);
    if (startTime.isBefore(this.startTime)) return false;
    if (endTime.isAfter(this.endTime)) return false;

    // Constraint 2: do not overlap the break
    const analysisSlot = new TimeSlot(startTime, endTime);
    if (analysisSlot.overlaps(this.lunchBreak)) return false;

    return true;
  }

  earliestValidStartFrom(earliestStart: TimeOfDay, duration: DurationMinutes): TimeOfDay | null {

    // 1 : Try earliestStart
    if (this.canFitAnalysis(earliestStart, duration)) 
      return earliestStart;
    
 
    const endIfStartedNow = earliestStart.addMinutes(duration);
    const analysisSlot = new TimeSlot(earliestStart, endIfStartedNow);

    // 2: If it's during lunch try after lunch in fallback
    if (analysisSlot.overlaps(this.lunchBreak)) {
      const afterLunch = this.lunchBreak.end;
      if (this.canFitAnalysis(afterLunch, duration)) 
        return afterLunch;
      
    }
    return null;
  }

}
