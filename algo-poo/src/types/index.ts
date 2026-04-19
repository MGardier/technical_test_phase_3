// ============================================
//                ENUMS
// ============================================

export const Priority = {
  STAT: "STAT",
  URGENT: "URGENT",
  ROUTINE: "ROUTINE",
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

export const SampleType = {
  BLOOD: "BLOOD",
  URINE: "URINE",
  TISSUE: "TISSUE",
} as const;
export type SampleType = typeof SampleType[keyof typeof SampleType];

export const TechnicianSpeciality = {
  ...SampleType,
  GENERAL: "GENERAL",
} as const;
export type TechnicianSpeciality =
  typeof TechnicianSpeciality[keyof typeof TechnicianSpeciality];

export const EquipmentType = {
  ...SampleType,
} as const;
export type EquipmentType =
  typeof EquipmentType[keyof typeof EquipmentType];

// ============================================
//                 UTILS
// ============================================

/** Time of day in 24-hour format, ex: "09:30". */
export type TimeString = `${number}:${number}`;


// ============================================
//            INPUT DTO 
// ============================================

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