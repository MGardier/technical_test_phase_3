import { UnscheduledReason } from "../../dto/enums";
import { UnscheduledSampleDTO } from "../../dto/output.dto";
import { Sample } from "../entity/sample";

/**
 * A sample the planner could not assign, paired with the reason why.
 */
export class UnscheduledSample {
  public readonly sample: Sample;
  public readonly reason: UnscheduledReason;

  constructor(sample: Sample, reason: UnscheduledReason) {
    this.sample = sample;
    this.reason = reason;
  }

  toDTO(): UnscheduledSampleDTO {
    return {
      sampleId: this.sample.id,
      reason: this.reason,
    };
  }
}
