# Lab Scheduling Algorithm

Object-oriented TypeScript implementation of a medical lab scheduling system. Takes a list of samples, technicians, and equipment as input, and produces an optimized schedule respecting priority, compatibility, and availability constraints.

## Requirements

- Node.js 18+
- pnpm

## Installation

~~~bash
pnpm install
~~~

## Commands

| Command | Description |
|---|---|
| `pnpm test` | Run the algorithm against the 3 example cases (`src/test/regression-test.ts`) |
| `pnpm build` | Compile TypeScript to `dist/` via `tsc` |

## How it works

### Entry point: `planifyLab(input)`

The public function (in `src/planify-lab.ts`) does the following:

1. Filters out unavailable equipment (`available: false`)
2. Maps DTOs to domain objects (`Sample.fromDTO`, `Technician.fromDTO`, `Equipment.fromDTO`)
3. Instantiates a `LabPlanner` with the domain objects
4. Calls `.plan()` to compute the schedule
5. Sorts the final schedule by priority then start time
6. Computes the metrics (totalTime, efficiency, conflicts)
7. Returns the output DTO

### The LabPlanner

On instantiation, the planner creates availability trackers:

- One `ResourceAvailability` per technician (initialized at their `startTime`)
- One `ResourceAvailability` per equipment (initialized at `00:00`, since equipment is available 24/7)

The `plan()` method:

1. Sorts samples by priority (STAT > URGENT > ROUTINE), then by arrival time
2. Iterates over each sample in priority order
3. For each sample, calls `tryAssign(sample)`
4. Collects the result as either a `ScheduleEntry` (assigned) or an `UnscheduledSample` (with reason)

### The `tryAssign(sample)` method

For a given sample:

1. Filters technicians compatible with the sample type (matching speciality, or `GENERAL`)
   - If none → `NO_COMPATIBLE_TECHNICIAN`
2. Filters equipment compatible with the sample type
   - If none → `NO_COMPATIBLE_EQUIPMENT`
3. Searches the best `(technician, equipment)` pair via `findBestAssignment`:
   - For each tech × equip combination
   - Computes `candidateStart = max(sample.arrivalTime, tech.nextFree, equip.nextFree)`
   - Validates that the analysis fits within the technician's working hours (`canFitAnalysis`)
   - Keeps the pair yielding the earliest start time
4. If no viable pair → `NO_RESOURCE_AVAILABLE_IN_HOURS`
5. Otherwise:
   - Creates a `TimeSlot` (start + duration)
   - Creates a `ScheduleEntry` (sample + tech + equip + slot)
   - Updates trackers via `occupy()` (tech and equip are now busy until `start + duration`)

### Metrics

Once all assignments are done:

- **`totalTime`**: duration between the first start and the last end of the schedule (in minutes)
- **`efficiency`**: `(sum of analysisTime / totalTime) × 100` — can exceed 100% with parallel processing
- **`conflicts`**: `0` by construction (the greedy algorithm doesn't produce conflicts)

## Architecture

~~~
planifyLab(DTO)
    │
    ├─► DTO → Domain mapping
    │   └─► Sample, Technician, Equipment (entities)
    │       using TimeOfDay (value object)
    │
    ├─► new LabPlanner(samples, techs, equips)
    │   └─► Initializes Map<id, ResourceAvailability> (mutable trackers)
    │
    ├─► planner.plan()
    │   ├─► Sort samples (priority + arrivalTime)
    │   └─► For each sample:
    │       └─► tryAssign()
    │           ├─► getCompatibleTechnicians
    │           ├─► getCompatibleEquipments
    │           ├─► findBestAssignment (earliest free)
    │           └─► Build ScheduleEntry + occupy() trackers
    │
    ├─► Sort schedule (priority + startTime)
    ├─► computeMetrics
    │
    └─► Domain → DTO mapping
        └─► toDTO() on ScheduleEntry and UnscheduledSample
~~~

## Project Structure

~~~
src/
├── application/
│   └── lab-planner.ts          # Orchestrator
├── domain/
│   ├── entity/
│   │   ├── sample.ts
│   │   ├── technician.ts
│   │   └── equipment.ts
│   ├── result/
│   │   ├── schedule-entry.ts
│   │   └── unscheduled-sample.ts
│   ├── tracker/
│   │   └── resource-availability.ts
│   └── value-object/
│       ├── time-of-day.ts
│       └── time-slot.ts
├── dto/
│   ├── enums.ts
│   ├── input.dto.ts
│   └── output.dto.ts
├── types/
│   ├── index.ts                # AssignmentResult, BestAssignment, PlanResult
│   └── primitives.ts           # TimeString, DurationMinutes
├── planify-lab.ts              # Public entry point
└── test-manual.ts              # Manual test cases
~~~

## Design Decisions and Trade-offs

This implementation prioritizes **complete coverage of all required constraints** over **deep handling of edge cases**. Given the time budget, the goal is to deliver a working, deterministic algorithm across all 8 constraints rather than a perfect handling of any single one.

### Lunch Break — Inviolable Time Slot

The lunch break is treated as a **fixed, inviolable time slot** for each technician. No analysis can start during, overlap with, or partially cross the lunch break. If an analysis would conflict with the lunch break, the planner reschedules it after the break ends.

The following advanced behaviors mentioned in the spec are intentionally **not implemented**:

- **STAT interruption of lunch break.** A STAT sample arriving during a technician's lunch break does not interrupt the break in this implementation. The break is treated as a hard time slot, even for top-priority samples. If no other compatible technician is available, the STAT sample waits until the break ends.
- **Flexible lunch break duration** (e.g., reducing the break to 30 minutes if an analysis ends at 12:30). The break is consumed in full at its predefined slot.
- **Active rescheduling of ROUTINE samples** to free up a lunch break window when 12h–15h is saturated. The greedy algorithm does not perform any post-allocation reorganization.

### Why these trade-offs

These behaviors require either:

- Mutable state on the lunch break itself (interruption tracking, remaining time, rescheduling logic), which would break the immutability of the domain model
- Backtracking or reorganization after allocation, which is explicitly excluded from the intermediate-level scope (greedy + opportunistic parallelism)
- Complex state tracking with significant added testing surface

In a production system, these cases would be implemented as a follow-up iteration. For this technical assessment, the chosen approach maintains a clean, deterministic, and fully testable greedy scheduler across all 8 required constraints.

### What is Detected vs. Handled

When a sample cannot be scheduled within a technician's working hours (including being blocked by a lunch break with no rebound possible before end of shift), it is reported in `unscheduledSamples` with the reason `NO_RESOURCE_AVAILABLE_IN_HOURS`. The information is surfaced to the caller rather than silently dropped.