# Staff shift handover

Reception reconciles cash using opening float + cash tenders + cash repayments -
approved expenses. Transfers and debt remain outside the drawer. Disbursement
reconciles accepted stock movements against both independent physical counts.

Outgoing counts are immutable once submitted. The incoming lead records an
independent count, authenticates separately and acknowledges differences. Both
counts and explanations are preserved. Unbalanced handovers are permitted with
explanations. Changed ledger snapshots or another submitted handover produce an
explicit error without overwriting evidence. Corrupt saved evidence blocks writes.

The current mock verifier accepts `reception.incoming@demo.tallybakery.test` and
`disbursement.incoming@demo.tallybakery.test` with `TallyDemo2026!` for the matching
department. These credentials verify mock incoming identity only; they do not
replace the signed-in session. No password is persisted. The real API must verify
both actors and authorization; this UI verifier is not a security control.

Dual signatures produce `SEALED_PENDING_SYNC`, with a balanced/unbalanced result.
Only backend acknowledgement can finalize the shift or generate canonical
incidents/alerts. There is no fabricated sync transport or server acceptance.
Current persistence supports one handover per seeded shift/department. Moving to
a new real shift requires API-assigned shift IDs, versions and authorized scopes.
