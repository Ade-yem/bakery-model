---
name: spec-creator
description: >-
  Author and maintain comprehensive feature specifications matching the ./specs format:
  requirements.md (EARS criteria), design.md (architecture & data contracts),
  tasks.md (incremental TDD task list), and test-spec.md (detailed test suite plan).
  Use whenever planning a new feature, running /plan or /grill-me for specification creation,
  or drafting architectural specs in any project.
---

# Specification Authoring Skill (`spec-creator`)

This skill enables AI agents and developers to systematically design, specify, plan, and verify features using the `.specs/<feature-name>/` bundle pattern.

A complete spec bundle consists of 5 files:
1. `.config`: Machine-readable metadata (`specId`, `workflowType`, `specType`).
2. `requirements.md`: EARS-syntax functional and non-functional requirements, glossary, boundaries.
3. `design.md`: Current architecture evidence, ASCII architectural diagram, data contracts, API boundaries, UI/UX specs.
4. `tasks.md`: Phased, checkbox-tracked TDD task list linking to requirements and test specs.
5. `test-spec.md`: Detailed test strategy, proposed test file locations, and numbered test scenarios (`TEST-[PREFIX]-###`).

---

## 1. Specification Generation Workflow

When planning a new feature (e.g. via `/plan` or `/grill-me`):

```text
Discovery & Clarification (/grill-me)
  │ (Interview user, resolve ambiguities, inspect existing codebase)
  ▼
Create Spec Directory & Config (.config)
  │ (Generate UUID v4, set workflowType: "requirements-first", specType: "feature")
  ▼
Author Requirements Document (requirements.md)
  │ (EARS syntax: WHEN [condition], THE System SHALL [action])
  ▼
Author Design Document (design.md)
  │ (Evidence table, ASCII diagram, data contracts, security/API boundaries, UI tokens)
  ▼
Author Test Specification (test-spec.md)
  │ (Test-first strategy, file paths, numbered TEST-[PREFIX]-### scenarios)
  ▼
Author Task List (tasks.md)
  │ (Phased checkboxes, TDD test confirmation gates, acceptance loop)
  ▼
Align & Confirm with User
```

---

## 2. File Specifications & Generic Templates

Generic, reusable templates are provided in [.agents/skills/spec-creator/templates/](./templates/):
- [requirements.md template](./templates/requirements.md)
- [design.md template](./templates/design.md)
- [tasks.md template](./templates/tasks.md)
- [test-spec.md template](./templates/test-spec.md)

### File 1: `.config`
Generate a new UUID v4 for `specId`:
```json
{
  "specId": "<generated-uuid-v4>",
  "workflowType": "requirements-first",
  "specType": "feature"
}
```

### File 2: `requirements.md`
- **Module & Context**: Title, module, and relation to product specifications or architecture goals.
- **Existing Capabilities and Boundaries**: What the system already supports, existing codebase anchors, and what is explicitly out of scope.
- **Glossary**: Domain terms defined strictly in project context.
- **Requirements Structure**:
  - Each numbered requirement: `### Requirement N: [Title] ([PREFIX]-0N)`
  - User story: `**User Story:** As a [role], I want to [action] so that [goal].`
  - Acceptance Criteria using **EARS** (Easy Approach to Requirements Syntax):
    - *Ubiquitous*: `THE System SHALL [action].`
    - *Event-driven*: `WHEN [trigger/condition], THE System SHALL [action].`
    - *State-driven*: `WHILE [state], THE System SHALL [action].`
    - *Unwanted event*: `IF [error/failure], THEN THE System SHALL [safe recovery].`

### File 3: `design.md`
- **Overview**: High-level engineering strategy.
- **Current Architecture and Evidence Table**:
  Columns: `Concern | Existing implementation | Design implication`
  Maps codebase reality directly to design requirements.
- **ASCII Architecture Diagram**: Illustrates client surfaces, typed API boundaries, services, database/storage, and external integrations.
- **Data & Identity Contracts**:
  - Entity structures, primary keys, relational anchors, unique constraints.
  - Schema definitions, migrations, serialization, and immutability rules.
- **API & Security Boundaries**:
  - Typed input/output contracts (e.g. Zod, OpenAPI, JSON Schema).
  - Authentication and multi-tenancy / scope verification.
  - Safe DTOs (no internal database leakages or exposed secrets).
- **UI & Interaction Design**:
  - Design tokens, responsive layouts, accessibility (a11y), keyboard navigation, focus management.

### File 4: `test-spec.md`
- **Strategy**: Unit, integration, component, and performance tests adhering to the project's test-first discipline.
- **Proposed Test Locations**: Exact planned test file paths.
- **Numbered Test Cases**: Format `TEST-[PREFIX]-[CATEGORY]-[001..N]`
  - Explicit scenario name, input precondition, expected output, or error code.

### File 5: `tasks.md`
- **Phased Implementation Checklist**:
  1. Baseline and Architecture Decisions (including user test confirmation gate)
  2. Contracts and Data Models (schemas, types, migrations)
  3. Service Layer and Business Logic (test-first, modular limits, JSDocs)
  4. API & Integration Boundary (typed endpoints/procedures)
  5. UI Components & User Flow (design tokens, accessibility, state handling)
  6. End-to-End Verification & Documentation
- **Acceptance Gate**: Explicit summary flow diagram or checklist showing when the feature is ready to ship.

---

## 3. Best Practices for Agents

1. **Conduct Clarification First (`grill-me` skill)**: Resolve architectural questions, schema migrations, and user UX choices before writing the spec.
2. **Ground in Existing Codebase**: Fill out the Evidence table in `design.md` by inspecting real repository files, existing models, and current APIs.
3. **Enforce Test-First TDD**: The `test-spec.md` and `tasks.md` files must clearly state that tests are written and verified with the user before feature implementation begins.
