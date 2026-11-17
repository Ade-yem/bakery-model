---
trigger: always_on
---

# Implementation Rules

## 9. API & Type Safety

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

* Use a centralized error-handling strategy for server.
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