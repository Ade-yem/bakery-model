# Connection and synchronization UI

The shared controller tracks network availability separately from service
reachability. Unknown counts are never treated as acknowledged work. Failed,
aborted, obsolete or malformed responses preserve pending counts and evidence.

Without a supplied `SyncAdapter`, the UI reads real department-filtered counts
from the local staff journal and disables manual sync with an explanation. With
an authenticated adapter, the controller uses its actual status and per-request
outcomes. There is no simulated service acknowledgement.

See `../staff-workspace/journal/README.md` for the durable local adapter, retained
conflict evidence and the boundary to the approved operational API protocol.
