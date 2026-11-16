---
trigger: always_on
---

# BIM-KMS AI Agent Implementation Rules

## 1. Architecture & Rendering

* Default to React Server Components. Use `"use client"` only for state, effects, browser APIs, or required interactivity.
* Keep client boundaries as low as possible.
* Use App Router conventions: `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`.
* Keep UI, business logic, database access, AI services, and infrastructure separate.
* Do not put database queries or business rules directly inside UI components.

## 2. Performance

* Use `next/image`, `next/link`, and `next/font` where appropriate.
* Fetch server-side data directly on the server.
* Run independent async operations in parallel with `Promise.all()`.
* Dynamically import heavy client components and libraries.
* Paginate or virtualize large BIM, document, knowledge, and search result sets.
* Never load an entire BIM model when only a subset is required.

## 3. Security

* Treat Server Actions and oRPC procedures as public API boundaries.
* Authenticate and authorize every server-side operation.
* Never trust client-provided IDs, permissions, roles, or ownership.
* Enforce project/organization access on every protected resource.
* Validate all external input at the server boundary.
* Never expose secrets through `NEXT_PUBLIC_*`.
* Never send unauthorized project data, documents, or BIM data to OpenAI.
* Never log secrets, tokens, or sensitive project data.

## 4. Database & Prisma

* Use Prisma as the database access layer.
* Keep database queries inside repositories/services, not UI components.
* Use transactions for related mutations that must succeed or fail together.
* Enforce important integrity rules with PostgreSQL constraints and indexes.
* Avoid unbounded queries.
* Preserve project and organization ownership relationships.
* Use migrations for all schema changes.
* Never bypass Prisma migrations to modify production data.

## 5. BIM Data

* Preserve stable BIM identifiers such as IFC GUIDs where available.
* Never use element names as unique identifiers.
* Track BIM model/file versions; never silently overwrite previous versions.
* Preserve the relationship between BIM elements, models, projects, documents, and knowledge objects.
* Keep BIM geometry separate from BIM metadata.
* Never assume imported BIM data is complete or valid.

## 6. Knowledge Management

* Treat requirements, decisions, problems, risks, lessons, issues, and solutions as explicit domain objects.
* Record provenance: author, timestamp, source, project, and relevant BIM/document context.
* Distinguish AI-generated content from human-authored or human-approved content.
* Preserve important knowledge history and avoid silent overwrites.
* Respect permissions during keyword, vector, and AI retrieval.
* Use explicit relationships between knowledge objects and BIM elements where applicable.

## 7. AI & OpenAI

* AI output is not automatically trusted or authoritative.
* Use structured outputs and validate all AI-generated data before persistence.
* Never allow AI to bypass authorization, validation, or domain rules.
* Ground responses in project documents, BIM data, and approved knowledge where applicable.
* Never invent BIM element IDs, measurements, decisions, requirements, or project facts.
* Use human approval for critical project actions.
* Record relevant AI provenance when required: model, sources, timestamp, and operation.
* Keep AI orchestration separate from core business logic.

## 8. Files & Cloudinary

* Store large files in Cloudinary and metadata/references in PostgreSQL.
* Validate file type, size, ownership, and purpose server-side.
* Preserve document version and provenance information.
* Never expose private files without authorization.

## 9. API & Type Safety

* Use oRPC and zod as the typed API boundary.
* Keep API procedures thin and delegate business logic to services.
* Validate inputs at API boundaries.
* Do not expose Prisma models directly to clients.
* Use strict TypeScript. Avoid `any`, `@ts-ignore`, and unsafe type casts.

## 10. Code Quality

* Keep components and functions focused and cohesive.
* Prefer readable code over clever abstractions.
* Not more than 500 lines of code per file
* Not more than 200 lines of code per component
* Reuse existing components, utilities, services, and schemas before creating new ones.
* Avoid unnecessary dependencies.
* Do not modify unrelated code.
* Comments should explain why, not what.
* Fix root causes instead of suppressing errors.

## 11. Agent Behavior

* Inspect the existing architecture before making changes.
* Follow established project conventions unless there is a strong reason to change them.
* Make small, incremental changes.
* Do not invent domain rules when requirements are unclear.
* Run relevant type checks, linting, tests, and build validation after meaningful changes.
* Do not rewrite working code merely for stylistic preference.
* Prioritize correctness, traceability, security, and maintainability over speed.

## 12. Error Handling

* Use a centralized error-handling strategy for server and oRPC operations.
* Define typed application errors with stable error codes.
* Validate and map Prisma, OpenAI, Cloudinary, authentication, and validation errors to safe application errors.
* Never expose raw database, API, stack-trace, or infrastructure errors to clients.
* Log unexpected errors server-side with sufficient context for debugging, without logging secrets or sensitive data.
* Do not catch errors unless they can be handled, transformed, or enriched.

## 13. Test-Driven Development (TDD) & User Confirmation Protocol

* **Strict TDD Workflow**: Every feature, service, repository, utility, and domain function must follow a test-first discipline:
  1. **Write Unit/Integration Tests First**: Tests must be written before any implementation code.
  2. **Present Tests to User for Confirmation**: Explicitly present the written tests, assertions, and edge-case coverage to the user for confirmation and alignment before proceeding with implementation.
  3. **Implement Feature / Service**: Write the minimal, clean implementation code that fulfills the test suite.
  4. **Run & Verify Passing Tests**: Execute test commands and ensure 100% of the tests pass with zero failures or skipped critical checks before moving on.
* **Test Verification Before Next Step**: Never declare a task complete or move to subsequent functions/modules until test execution output confirms that all tests pass.
* **No Untested Functions**: Every public function, service method, validation boundary, and helper must have automated test coverage covering happy paths, edge cases, and expected error codes.

## 14. Comprehensive JSDoc Documentation Standard

* **Mandatory JSDoc on Every Function & Service**: Every exported function, class method, service, hook, and procedure must have a comprehensive JSDoc block.
* **Required JSDoc Tags**:
  - `@description` / Overview summary explaining *why* the function exists, its architectural role, and its operational context.
  - `@param` with accurate type annotations and clear description for each parameter.
  - `@returns` documenting return type, shape, and resolve behavior.
  - `@throws` documenting explicit error types or `ErrorCode` values thrown (e.g., `@throws {AppError} with code ERROR_CODES.NOT_FOUND`).
  - `@example` where non-trivial input/output patterns or contracts are involved.
* **Maintain Documentation Freshness**: JSDocs must be kept up to date during any code refactoring. Stale documentation is considered a lint error.