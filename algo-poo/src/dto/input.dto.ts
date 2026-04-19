import { TimeString } from "../types/primitives";
import { EquipmentType, Priority, SampleType, TechnicianSpeciality } from "./enum";


export interface SampleDTO {
  readonly id: string;
  readonly type: SampleType;
  readonly priority: Priority;
  readonly analysisTime: number;
  readonly arrivalTime: TimeString;
  readonly patientId: string;
}

export interface TechnicianDTO {
  readonly id: string;
  readonly name: string;
  readonly speciality: TechnicianSpeciality;
  readonly startTime: TimeString;
  readonly endTime: TimeString;
}

export interface EquipmentDTO {
  readonly id: string;
  readonly name: string;
  readonly type: EquipmentType;
  readonly available: boolean;
}

export interface PlanifyLabInputDTO {
  readonly samples: ReadonlyArray<SampleDTO>;
  readonly technicians: ReadonlyArray<TechnicianDTO>;
  readonly equipment: ReadonlyArray<EquipmentDTO>;
}
