import { EquipmentType } from "../../dto/enums";
import { EquipmentDTO } from "../../dto/input.dto";
import { DurationMinutes } from "../../types/primitives";
import { TimeOfDay } from "../value-object/time-of-day";
import { TimeSlot } from "../value-object/time-slot";


export class Equipment {

  public readonly id: string;
  public readonly name: string;
  public readonly type: EquipmentType;
  public readonly maintenanceWindow: TimeSlot;



  constructor(
    id: string,
    name: string,
    type: EquipmentType,
    maintenanceWindow: TimeSlot

  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.maintenanceWindow = maintenanceWindow;
  }

  static fromDTO(dto: EquipmentDTO): Equipment {
    return new Equipment(
      dto.id,
      dto.name,
      dto.type,
      new TimeSlot(
        TimeOfDay.fromString(dto.maintenanceWindow.start),
        TimeOfDay.fromString(dto.maintenanceWindow.end),
      ),
    );
  }


  canHandleAt(startTime: TimeOfDay, duration: DurationMinutes): boolean{

    // Constraint 1: do not overlap the maintenance
    const endTime = startTime.addMinutes(duration);
    const analysisSlot = new TimeSlot(startTime, endTime);
    if (analysisSlot.overlaps(this.maintenanceWindow)) return false;

    return true;
  }

   earliestValidStartFrom(earliestStart: TimeOfDay, duration: DurationMinutes): TimeOfDay | null {

    // 1 : Try earliestStart
    if (this.canHandleAt(earliestStart, duration)) 
      return earliestStart;
    
    // 2 : Fallback after the maintenance
      const afterMaintenance = this.maintenanceWindow.end;
      if (this.canHandleAt(afterMaintenance, duration)) 
        return afterMaintenance;
  
    return null;
  }

}
