import { Equipment } from "../domain/entity/equipment";
import { Sample } from "../domain/entity/sample";
import { Technician } from '../domain/entity/technician';
import { ScheduleEntry } from "../domain/result/schedule-entry";
import { UnscheduledSample } from "../domain/result/unscheduled-sample";
import { ResourceAvailability } from "../domain/tracker/resource-availability";
import { TimeOfDay } from "../domain/value-object/time-of-day";
import { TimeSlot } from "../domain/value-object/time-slot";
import { UnscheduledReason } from "../dto/enums";
import { AssignmentResult, BestAssignment, PlanResult } from "../types";

export class LabPlanner {
  private static readonly DAY_START = TimeOfDay.fromString("00:00");
  private readonly technicianAvailability: Map<string, ResourceAvailability>;
  private readonly equipmentAvailability: Map<string, ResourceAvailability>;

  constructor(
    private readonly samples: Sample[],
    private readonly technicians: Technician[],
    private readonly equipments: Equipment[],
  ) {

    this.technicianAvailability = new Map(
      technicians.map(t => [t.id, new ResourceAvailability(t.id, t.startTime)])
    );
    this.equipmentAvailability = new Map(
      equipments.map(e => [e.id, new ResourceAvailability(e.id, LabPlanner.DAY_START)])
    );
  }



  plan(): PlanResult{

    //Sorted samples 
    const sortedSamples = [...this.samples].sort((a, b) => a.compareForProcessing(b));


    const scheduleEntries: ScheduleEntry[] = [];
    const unscheduledSamples: UnscheduledSample[] = [];

    for (const sample of sortedSamples) {
      const result = this.tryAssign(sample);
      if (result.kind === "assigned") {
        scheduleEntries.push(result.entry);
      } else {
        unscheduledSamples.push(new UnscheduledSample(sample, result.reason));
      }
    }

    return {scheduleEntries,unscheduledSamples}
  }

  private getCompatibleTechnicians(sample: Sample): Technician[]  {
    return this.technicians.filter(t =>
      sample.isCompatibleWithTechnician(t)
    );
  }

  private getCompatibleEquipments(sample: Sample): Equipment[] {
    return this.equipments.filter(e =>
      sample.isCompatibleWithEquipment(e)
    );
  }


  private findBestAssignment(sample: Sample, technicians: Technician[], equipments: Equipment[]): BestAssignment | null {

    let bestAssignment: { tech: Technician; equip: Equipment; start: TimeOfDay } | null = null;

    for (const tech of technicians) {
      for (const equip of equipments) {

        //Get availability for tech & equip
        const techAvail = this.technicianAvailability.get(tech.id)!;
        const equipAvail = this.equipmentAvailability.get(equip.id)!;

        //Get candidate start based on max value between sample , tech & equip
        const candidateStart = TimeOfDay.max(
          sample.arrivalTime,
          techAvail.getNextFreeTime(),
          equipAvail.getNextFreeTime(),
        );

        //If tech can't handle it we search another one
        if (!tech.canFitAnalysis(candidateStart, sample.analysisTime))
          continue;

        //We check if an new assignement can be better than the current
        if (bestAssignment === null || candidateStart.isBefore(bestAssignment.start))
          bestAssignment = { tech, equip, start: candidateStart };

      }
    }

    return bestAssignment;
  }

  private tryAssign(sample: Sample): AssignmentResult {

    
    const compatibleTechnicians = this.getCompatibleTechnicians(sample)
    if (compatibleTechnicians.length === 0)
      return { kind: "unassigned", reason: UnscheduledReason.NO_COMPATIBLE_TECHNICIAN };



    const compatibleEquipments = this.getCompatibleEquipments(sample)
    if (compatibleEquipments.length === 0)
      return { kind: "unassigned", reason: UnscheduledReason.NO_COMPATIBLE_EQUIPMENT };


    const  bestAssignment = this.findBestAssignment(sample,compatibleTechnicians,compatibleEquipments);
    if (bestAssignment === null)
      return { kind: "unassigned", reason: UnscheduledReason.NO_RESOURCE_AVAILABLE_IN_HOURS };


    const timeSlot = TimeSlot.fromStartAndDuration(bestAssignment.start, sample.analysisTime);
    const entry = new ScheduleEntry(sample, bestAssignment.tech, bestAssignment.equip, timeSlot);

    this.technicianAvailability.get(bestAssignment.tech.id)!.occupy(
      bestAssignment.start,
      sample.analysisTime,
    );
    this.equipmentAvailability.get(bestAssignment.equip.id)!.occupy(
      bestAssignment.start,
      sample.analysisTime,
    );

    return { kind: "assigned", entry };
  }
}