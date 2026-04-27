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
| `pnpm test` | Run the algorithm against the 3 example cases (`src/test-manual.ts`) |
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

