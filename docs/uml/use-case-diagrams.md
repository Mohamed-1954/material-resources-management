# UML — Use case diagrams

See `docs/requirements/use-cases.md` for the master list. Per-actor diagrams:

## Teacher

```mermaid
flowchart LR
  T[Teacher]
  T --> N1[Submit need]
  T --> N2[View own needs]
  T --> R1[View own resources]
  T --> F1[Report failure]
  T --> F2[View own failures]
```

## Department head

```mermaid
flowchart LR
  H[Department Head]
  H --> N1[View department needs]
  H --> N2[Review need]
  H --> N3[Request changes]
  H --> N4[Approve / reject]
  H --> N5[Send approved needs to manager]
  H --> R1[View department resources]
  H --> F1[View department failures]
```

## Resource manager

```mermaid
flowchart LR
  M[Resource Manager]
  M --> T1[Draft / publish / close / award tender]
  M --> T2[Include needs in tender]
  M --> O1[View / eliminate / accept / reject offers]
  M --> S1[Manage suppliers]
  M --> S2[Blacklist supplier]
  M --> R1[Register delivered resources]
  M --> R2[Assign / unassign resources]
  M --> Mn[Decide warranty action]
```

## Supplier

```mermaid
flowchart LR
  S[Supplier]
  S --> P1[Update profile]
  S --> T1[View active tenders]
  S --> O1[Submit / withdraw offer]
  S --> O2[View own offers]
```

## Maintenance technician

```mermaid
flowchart LR
  Tech[Maintenance Technician]
  Tech --> F1[Take case]
  Tech --> F2[Start intervention]
  Tech --> F3[Resolve]
  Tech --> F4[Mark severe]
  Tech --> F5[Write technical report]
```

## Admin

```mermaid
flowchart LR
  A[Admin]
  A --> U1[Manage users]
  A --> U2[Assign roles]
  A --> D1[Manage departments]
  A --> AL[View audit logs]
```
