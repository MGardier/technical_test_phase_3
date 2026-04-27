

import { EfficiencyCoefficient, TimeString } from "../types/primitives";
import { EquipmentType, Priority, SampleType, TechnicianSpeciality } from "./enums";


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
  readonly efficiency: EfficiencyCoefficient
  readonly speciality: TechnicianSpeciality;
  readonly lunchBreak: {
    readonly start: TimeString;
    readonly end: TimeString;
  };
  readonly startTime: TimeString;
  readonly endTime: TimeString;
}

export interface EquipmentDTO {
  readonly id: string;
  readonly name: string;
  readonly type: EquipmentType;
  readonly available: boolean;
  readonly maintenanceWindow: {
    readonly start: TimeString;
    readonly end: TimeString;
  };
}

export interface PlanifyLabInputDTO {
  readonly samples: ReadonlyArray<SampleDTO>;
  readonly technicians: ReadonlyArray<TechnicianDTO>;
  readonly equipment: ReadonlyArray<EquipmentDTO>;
}
