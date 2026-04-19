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

/** Duration expressed in minutes.*/
export type DurationMinutes = number;

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


// ============================================
//            OUTPUT DTO 
// ============================================

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

export interface PlanifyLabOutputDTO {
  readonly schedule: ReadonlyArray<ScheduleEntryDTO>;
  readonly metrics: MetricsDTO;
}