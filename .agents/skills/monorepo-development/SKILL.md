---
name: monorepo-development
description: >-
  Apply this project's monorepo best practices whenever inspecting, changing,
  testing, building, or reviewing code across the pnpm workspace. Covers package
  boundaries, dependency management, shared contracts, React/Vite frontend,
  NestJS API, workspace scripts, and cross-package validation.
---

# Monorepo Development

Use this skill for all work in this repository, including changes confined to a
single app or package. Treat the workspace as one product with deployable
boundaries, not as one application directory.

## Understand the workspace before changing it

- Start at the repository root. Read the relevant root `AGENTS.md`, any
  package-level `AGENTS.md`, and the `package.json` files for the packages
  involved.
- Check `pnpm-workspace.yaml` to understand workspace membership. Use the
  current manifests and configuration as the source of truth; do not assume
  scripts documented elsewhere still exist.
- Trace imports and package exports before changing a contract or moving code.
  Distinguish implemented behavior from proposals in product or design
  documents.
- Keep changes within the smallest package boundary that owns the behavior.
  Coordinate changes across packages only when their public contracts or
  runtime behavior require it.

## Package boundaries and dependency direction

- Keep frontend, backend, and shared code separate:
  - `apps/app` owns the main operational browser UI and client-side interaction.
  - `apps/marketing` owns the public marketing website and landing pages.
  - `apps/api` owns server-side validation, authorization, and authoritative
    business rules.
  - `packages/shared` owns intentionally public, runtime-neutral contracts and
    utilities safe for both clients and server.
- Keep dependencies flowing from apps to shared packages. Shared packages must
  not depend on any app; the client applications must not import API implementation,
  persistence, or server-only code.
- Do not expose ORM entities, secrets, environment access, Node-only APIs, or
  other server internals through a client-facing shared package.
- Prefer explicit package exports and stable public interfaces over deep
  imports into another package's `src` or build output.
- Avoid circular dependencies, duplicated domain contracts, and moving code to
  `shared` merely to make an import work. Extract only genuinely reusable,
  platform-safe code.
- Use the `workspace:` protocol for dependencies on local packages. Add or
  update a dependency in the manifest of the package that imports it; do not
  rely on accidental hoisting or another package's transitive dependency.
- Avoid new libraries, workspace packages, or build-system changes unless the
  task needs them. Preserve the repository's existing package manager and
  tooling.

## Frontend: React and Vite

- Keep UI and browser interaction in client apps (`apps/app`, `apps/marketing`); call the API through its
  public HTTP contract rather than coupling the UI to NestJS internals.
- Keep components typed, focused, and accessible. Keep API calls, reusable
  presentation, and state handling in the established client-side locations
  instead of placing unrelated behavior in a component.
- Treat all client input and client-visible state as untrusted. Client-side
  validation may improve feedback, but it does not replace API validation or
  authorization.
- Import only client-safe modules. Never bundle server credentials, database
  code, private environment values, or server-only shared-package exports into
  the browser.
- Update the frontend when a public shared contract changes, and validate both
  TypeScript and the Vite production build using the existing package scripts.

## Backend: NestJS API

- Keep API transport concerns in controllers and DTOs, and keep authoritative
  application rules in services or the existing domain-focused layer. Do not
  implement security or business rules only in the client.
- Validate all request data at the API boundary. Authenticate and authorize on
  the server for every protected operation; never trust tenant, branch, role,
  ownership, or permission identifiers just because the client supplied them.
- Return explicit public response shapes rather than leaking persistence
  models, internal exceptions, or fields the caller must not see.
- Keep related state changes atomic and duplicate-safe where the domain
  requires it. Preserve append-only/audit history and other product invariants
  described in the root `AGENTS.md`.
- Follow API-specific instructions, including ESM import conventions and
  validation/test patterns. Run the existing API lint, tests, and build scripts
  relevant to the change.

## Shared contracts and cross-package changes

- Add client-safe types and contracts to `packages/shared` only when both sides
  need the same public definition. Keep server implementation and persistence
  types in the API.
- Prefer explicit, serializable request and response types. Avoid widening
  public contracts or making breaking changes without updating every consumer.
- For a shared contract change, inspect and update all affected packages, then
  build the shared package and the consuming API/client packages. Run relevant
  tests and lint as their manifests define.
- For API-only changes, run the API's focused tests and relevant lint/build.
  For client-only changes, run the client lint/build. Use root checks when the
  change crosses boundaries or affects root configuration.
- Do not claim a workspace-wide check passed if only one package was checked.
  Report any unrun checks and the reason.

## Workspace commands and change hygiene

- Use pnpm from the repository root and target packages with `pnpm --filter
<package-name> <script>` when appropriate.
- Verify a script exists in the target `package.json` before running it. Run
  prerequisite package builds when a consumer relies on generated output; do
  not assume the root build covers every workspace package.
- Make dependency changes only in the owning manifest and update the lockfile
  through pnpm when required. Do not hand-edit the lockfile.
- Keep generated files, build output, and local environment files out of
  unrelated changes. Never put secrets in source code or committed config.
- Make focused changes, preserve unrelated work, and summarize which packages
  changed plus the validation performed.
