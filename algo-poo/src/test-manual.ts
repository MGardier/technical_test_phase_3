import { planifyLab } from "./planify-lab";
import { PlanifyLabInputDTO } from "./dto/input.dto";

function runTest(name: string, input: PlanifyLabInputDTO) {
  console.log(`\n========== ${name} ==========`);
  try {
    const output = planifyLab(input);
    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

// ==================== EXAMPLE 1 ====================
const example1: PlanifyLabInputDTO = {
  samples: [
    {
      id: "S001",
      type: "BLOOD",
      priority: "URGENT",
      analysisTime: 30,
      arrivalTime: "09:00",
      patientId: "P001",
    },
  ],
  technicians: [
    {
      id: "T001",
      name: "Alice Martin",
      efficiency: 1.0, //Add for retro compatibility
      speciality: "BLOOD",
      startTime: "08:00",
      endTime: "17:00",
      lunchBreak: { start: "12:00", end: "13:00" },
    },
  ],
  equipment: [
    {
      id: "E001",
      name: "Analyseur Sang A",
      type: "BLOOD",
      available: true,
    },
  ],
};

// ==================== EXAMPLE 2 ====================
const example2: PlanifyLabInputDTO = {
  samples: [
    {
      id: "S001",
      type: "BLOOD",
      priority: "URGENT",
      analysisTime: 45,
      arrivalTime: "09:00",
      patientId: "P001",
    },
    {
      id: "S002",
      type: "BLOOD",
      priority: "STAT",
      analysisTime: 30,
      arrivalTime: "09:30",
      patientId: "P002",
    },
  ],
  technicians: [
    {
      id: "T001",
      name: "Tech 1",
      speciality: "BLOOD",
      efficiency: 1.0, //Add for retro compatibility
      startTime: "08:00",
      endTime: "17:00",
      lunchBreak: { start: "12:00", end: "13:00" },
    },
  ],
  equipment: [
    {
      id: "E001",
      name: "Equip 1",
      type: "BLOOD",
      available: true,
    },
  ],
};

// ==================== EXAMPLE 3 ====================
const example3: PlanifyLabInputDTO = {
  samples: [
    {
      id: "S001",
      type: "BLOOD",
      priority: "URGENT",
      analysisTime: 60,
      arrivalTime: "09:00",
      patientId: "P001",
    },
    {
      id: "S002",
      type: "URINE",
      priority: "URGENT",
      analysisTime: 30,
      arrivalTime: "09:15",
      patientId: "P002",
    },
    {
      id: "S003",
      type: "BLOOD",
      priority: "ROUTINE",
      analysisTime: 45,
      arrivalTime: "09:00",
      patientId: "P003",
    },
  ],
  technicians: [
    {
      id: "T001",
      name: "Tech 1",
      efficiency: 1.0, //Add for retro compatibility
      speciality: "BLOOD",
      startTime: "08:00",
      endTime: "17:00",
      lunchBreak: { start: "12:00", end: "13:00" },
    },
    {
      id: "T002",
      name: "Tech 2",
      efficiency: 1.0, //Add for retro compatibility
      speciality: "GENERAL",
      startTime: "08:00",
      endTime: "17:00",
      lunchBreak: { start: "13:00", end: "14:00" },
    },
  ],
  equipment: [
    {
      id: "E001",
      name: "Equip Blood",
      type: "BLOOD",
      available: true,
    },
    {
      id: "E002",
      name: "Equip Urine",
      type: "URINE",
      available: true,
    },
  ],
};

// ==================== CASE V2-1 ====================
// Sample blocked by lunch break, rescheduled after
// Expected: S1 starts at 13:00, ends at 14:00 (rebound after lunch break)
const caseV2_1: PlanifyLabInputDTO = {
  samples: [
    { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 60, arrivalTime: "11:30", patientId: "P1" },
  ],
  technicians: [
    {
      id: "T1",
      name: "Alice",
      speciality: "BLOOD",
      efficiency: 1.0,
      startTime: "08:00",
      endTime: "17:00",
      lunchBreak: { start: "12:00", end: "13:00" },
    },
  ],
  equipment: [
    { id: "E1", name: "Equip", type: "BLOOD", available: true },
  ],
};

runTest("EXAMPLE 1 - Single URGENT sample", example1);
runTest("EXAMPLE 2 - STAT priority over URGENT", example2);
runTest("EXAMPLE 3 - Parallel processing", example3);
runTest("CASE V2-1 - Sample blocked by lunch break, rescheduled after", caseV2_1);