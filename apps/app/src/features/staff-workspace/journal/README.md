# Pending work and retained device evidence

The pending-work screen reads scoped queue metadata from the workspace adapter. Unknown metadata stays unavailable rather than appearing as zero pending changes. Conflicts remain read-only evidence; staff cannot discard them here.

Old unscoped browser records are not loaded into a live workspace. They remain untouched on the device. `legacy.ts` retains a read-only parser for deliberate recovery, including validation that record projections match their event evidence. It is not imported by the application entrypoint.

The removed local simulation is not the production event protocol. Future adapters must implement durable event IDs, atomic local writes, authenticated synchronization, idempotent server outcomes, tenant/branch/shift attribution, conflict handling and shared-device/logout policy. See `../../integration/README.md`.
