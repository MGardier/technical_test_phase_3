import { LabPlanner } from "./application/lab-planner";
import { Equipment } from "./domain/entity/equipment";
import { Sample } from "./domain/entity/sample";
import { Technician } from "./domain/entity/technician";
import { ScheduleEntry } from "./domain/result/schedule-entry";
import { TimeOfDay } from "./domain/value-object/time-of-day";
import { PlanifyLabInputDTO } from "./dto/input.dto";
import { MetricsDTO, PlanifyLabOutputDTO } from "./dto/output.dto";

export function planifyLab(input: PlanifyLabInputDTO): PlanifyLabOutputDTO {

  // Mapping DTO → Domain entities 
  const samples = input.samples.map(Sample.fromDTO);
  const technicians = input.technicians.map(Technician.fromDTO);
  const equipments = input.equipment
    .filter(e => e.available)
    .map(Equipment.fromDTO);

  // Execute Planner
  const { scheduleEntries, unscheduledSamples } = new LabPlanner(
    samples,
    technicians,
    equipments,
  ).plan();

  // Final sort on output first by priority and second by startTime 
  const sortedEntries = [...scheduleEntries].sort((a, b) => a.compareForOutput(b));


  const metrics = computeMetrics(sortedEntries);

  // Mapping Domain  → to DTO
  return {
    schedule: sortedEntries.map(e => e.toDTO()),
    unscheduledSamples: unscheduledSamples.map(u => u.toDTO()),
    metrics,
  };
}


 function computeMetrics(entries: ScheduleEntry[]): MetricsDTO {
  if (entries.length === 0) 
    return { totalTime: 0, efficiency: 0, conflicts: 0 };
  

  const firstStart = TimeOfDay.min(...entries.map(e => e.timeSlot.start));
  const lastEnd = TimeOfDay.max(...entries.map(e => e.timeSlot.end));
  const totalTime = firstStart.minutesUntil(lastEnd);

  const totalAnalysisTime = entries.reduce(
    (sum, e) => sum + e.sample.analysisTime,
    0,
  );

  const efficiency = totalTime === 0 
    ? 0 
    : Math.round((totalAnalysisTime / totalTime) * 1000) / 10; // arrondi à 1 décimale


  const conflicts = 0;

  return { totalTime, efficiency, conflicts };
}