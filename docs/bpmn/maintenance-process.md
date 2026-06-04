# BPMN — Maintenance process

```mermaid
flowchart LR
  T[Teacher: report failure] --> A[Failure REPORTED]
  A --> B[Technician takes case]
  B --> C[ASSIGNED -> IN_PROGRESS]
  C --> D{Severe?}
  D -->|no| R[Resolve -> RESOLVED]
  D -->|yes| S[Mark SEVERE]
  S --> TR[Write technical report]
  TR --> TRC[TECHNICAL_REPORT_CREATED]
  TRC --> RM{Resource manager decides}
  RM -->|warranty active: repair| RR[Send to supplier]
  RM -->|warranty active: replacement| RP[Replace]
  RM -->|warranty expired| INT[Internal handling — block]
```

## Failure state machine

```mermaid
stateDiagram-v2
  [*] --> REPORTED
  REPORTED --> ASSIGNED
  ASSIGNED --> IN_PROGRESS
  IN_PROGRESS --> RESOLVED
  IN_PROGRESS --> SEVERE
  SEVERE --> TECHNICAL_REPORT_CREATED
  TECHNICAL_REPORT_CREATED --> SENT_TO_SUPPLIER
  RESOLVED --> [*]
  SENT_TO_SUPPLIER --> RESOLVED
  SENT_TO_SUPPLIER --> [*]
```

## Business rules

- A teacher can only report failures on resources actively assigned to them or to their
  department.
- Printer failures must always have type `HARDWARE`.
- A technical report is required to escalate to the warranty path.
- The resource manager can request supplier repair or replacement only if the warranty end
  date has not passed.
