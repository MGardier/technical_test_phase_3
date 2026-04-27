import { planifyLab } from "../planify-lab";
import { PlanifyLabInputDTO } from "../dto/input.dto";
import { PlanifyLabOutputDTO } from "../dto/output.dto";

let passed = 0;
let failed = 0;

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    console.error(`     Expected: ${e}`);
    console.error(`     Actual:   ${a}`);
    failed++;
  }
}

function runTest(name: string, input: PlanifyLabInputDTO, expected: PlanifyLabOutputDTO): void {
  console.log(`\n📋 ${name}`);
  try {
    const actual = planifyLab(input);
    assertEqual(actual.schedule, expected.schedule, "schedule matches");
    assertEqual(actual.unscheduledSamples, expected.unscheduledSamples, "unscheduledSamples matches");
    assertEqual(actual.metrics.totalTime, expected.metrics.totalTime, "totalTime matches");
    assertEqual(actual.metrics.conflicts, expected.metrics.conflicts, "conflicts matches");
  } catch (err) {
    console.error(`  ❌ Threw an error: ${err}`);
    failed++;
  }
}

// ============================================================
// CASE 1 — Single sample, simple assignment
// ============================================================
runTest(
  "CASE 1 — Single URGENT sample",
  {
    samples: [
      { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 30, arrivalTime: "09:00", patientId: "P1" },
    ],
    technicians: [
      { id: "T1", name: "Alice",efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
    ],
    equipment: [
      { id: "E1", name: "Blood Analyzer", type: "BLOOD", available: true },
    ],
  },
  {
    schedule: [
      { sampleId: "S1", technicianId: "T1", equipmentId: "E1", startTime: "09:00", endTime: "09:30", priority: "URGENT" },
    ],
    unscheduledSamples: [],
    metrics: { totalTime: 30, efficiency: 100, conflicts: 0 },
  }
);

// ============================================================
// CASE 2 — STAT priority over URGENT (even if STAT arrives later)
// ============================================================
runTest(
  "CASE 2 — STAT priority overrides URGENT",
  {
    samples: [
      { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 45, arrivalTime: "09:00", patientId: "P1" },
      { id: "S2", type: "BLOOD", priority: "STAT", analysisTime: 30, arrivalTime: "09:30", patientId: "P2" },
    ],
    technicians: [
      { id: "T1", name: "Alice", efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
    ],
    equipment: [
      { id: "E1", name: "Blood Analyzer", type: "BLOOD", available: true },
    ],
  },
  {
    schedule: [
      { sampleId: "S2", technicianId: "T1", equipmentId: "E1", startTime: "09:30", endTime: "10:00", priority: "STAT" },
      { sampleId: "S1", technicianId: "T1", equipmentId: "E1", startTime: "10:00", endTime: "10:45", priority: "URGENT" },
    ],
    unscheduledSamples: [],
    metrics: { totalTime: 75, efficiency: 100, conflicts: 0 },
  }
);

// ============================================================
// CASE 3 — Parallel processing on distinct resources
// ============================================================
runTest(
  "CASE 3 — Parallel BLOOD and URINE on distinct resources",
  {
    samples: [
      { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 60, arrivalTime: "09:00", patientId: "P1" },
      { id: "S2", type: "URINE", priority: "URGENT", analysisTime: 30, arrivalTime: "09:00", patientId: "P2" },
    ],
    technicians: [
      { id: "T1", name: "Alice",efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
      { id: "T2", name: "Bob",efficiency: 1.0, speciality: "URINE", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "13:00", end: "14:00" } },
    ],
    equipment: [
      { id: "E1", name: "Blood Analyzer", type: "BLOOD", available: true },
      { id: "E2", name: "Urine Analyzer", type: "URINE", available: true },
    ],
  },
  {
    schedule: [
      { sampleId: "S1", technicianId: "T1", equipmentId: "E1", startTime: "09:00", endTime: "10:00", priority: "URGENT" },
      { sampleId: "S2", technicianId: "T2", equipmentId: "E2", startTime: "09:00", endTime: "09:30", priority: "URGENT" },
    ],
    unscheduledSamples: [],
    metrics: { totalTime: 60, efficiency: 150, conflicts: 0 },
  }
);

// ============================================================
// CASE 4 — Unavailable equipment is ignored
// ============================================================
runTest(
  "CASE 4 — Unavailable equipment is filtered out",
  {
    samples: [
      { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 30, arrivalTime: "09:00", patientId: "P1" },
    ],
    technicians: [
      { id: "T1", name: "Alice", efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
    ],
    equipment: [
      { id: "E1", name: "Broken", type: "BLOOD", available: false },
      { id: "E2", name: "Working", type: "BLOOD", available: true },
    ],
  },
  {
    schedule: [
      { sampleId: "S1", technicianId: "T1", equipmentId: "E2", startTime: "09:00", endTime: "09:30", priority: "URGENT" },
    ],
    unscheduledSamples: [],
    metrics: { totalTime: 30, efficiency: 100, conflicts: 0 },
  }
);

// ============================================================
// CASE 5 — No compatible technician
// ============================================================
runTest(
  "CASE 5 — Sample with no compatible technician",
  {
    samples: [
      { id: "S1", type: "TISSUE", priority: "URGENT", analysisTime: 30, arrivalTime: "09:00", patientId: "P1" },
    ],
    technicians: [
      { id: "T1", name: "Alice",efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
    ],
    equipment: [
      { id: "E1", name: "Tissue Analyzer", type: "TISSUE", available: true },
    ],
  },
  {
    schedule: [],
    unscheduledSamples: [
      { sampleId: "S1", reason: "NO_COMPATIBLE_TECHNICIAN" },
    ],
    metrics: { totalTime: 0, efficiency: 0, conflicts: 0 },
  }
);

// ============================================================
// CASE 6 — Analysis would exceed technician's working hours
// ============================================================
runTest(
  "CASE 6 — Analysis exceeding tech hours is unscheduled",
  {
    samples: [
      { id: "S1", type: "BLOOD", priority: "URGENT", analysisTime: 60, arrivalTime: "16:30", patientId: "P1" },
    ],
    technicians: [
      { id: "T1", name: "Alice", efficiency: 1.0, speciality: "BLOOD", startTime: "08:00", endTime: "17:00", lunchBreak: { start: "12:00", end: "13:00" } },
    ],
    equipment: [
      { id: "E1", name: "Blood Analyzer", type: "BLOOD", available: true },
    ],
  },
  {
    schedule: [],
    unscheduledSamples: [
      { sampleId: "S1", reason: "NO_RESOURCE_AVAILABLE_IN_HOURS" },
    ],
    metrics: { totalTime: 0, efficiency: 0, conflicts: 0 },
  }
);

// ============================================================
// SUMMARY
// ============================================================
console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(50));

if (failed > 0) {
  throw new Error(`${failed} regression test(s) failed`);
}