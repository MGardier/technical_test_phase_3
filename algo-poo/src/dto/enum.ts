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
