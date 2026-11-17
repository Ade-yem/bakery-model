# Design Document

## Module: [Feature / Module Name]

### [Project Name / Subsystem]

---

## Overview

[Architectural narrative: High-level overview of the technical strategy, what gaps it bridges, and how it aligns with overall system architecture and standards.]

## Current Architecture and Evidence

| Concern | Existing implementation | Design implication |
|---|---|---|
| [Concern 1 (e.g. State, Data, Auth, Storage)] | [Current state / existing file, service, or interface] | [Architectural rule / implication] |
| [Concern 2 (e.g. API Boundary, Performance)] | [Current state / existing file, service, or interface] | [Architectural rule / implication] |
| [Concern 3 (e.g. UI / Client Layer)] | [Current state / existing file, component, or store] | [Architectural rule / implication] |

## Architecture

```text
[Architecture Diagram showing request flows, client/server boundaries, services, database/storage, and external integrations]
```

### [Core Workflow / Lifecycle / State Machine]

- [Step-by-step description of process, data lifecycle, or state transitions]
- [Edge case handling, compensation, idempotency, retries]

### Data and Identity Contracts

- [Entities, primary keys, relational anchors, unique constraints]
- [Schema definitions, migrations, serialization, and indexing requirements]
- [Immutability, data scoping, multi-tenancy, and audit trail rules]

### API and Service Boundaries

- [API endpoints, RPC procedures, or server actions with typed input/output validation]
- [Authentication and authorization checks at each boundary]
- [Safe DTO structures: isolation of internal database records and secrets]

### UI and Interaction Design

- [Layout, viewports, drawers, dialogs, and responsive behaviors]
- [Design system tokens: typography, color palette, spacing, elevation]
- [Accessibility (a11y), keyboard navigation, focus management, sentence case]
