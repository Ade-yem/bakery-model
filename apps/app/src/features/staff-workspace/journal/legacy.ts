/** Read-only recovery of legacy device evidence. Never load these records into a signed-in workspace. */
export const journalKey = 'tallybakery:staff-journal:v1';
export interface JournalEvent {
  id: string;
  department: string;
  actor: string;
  recordKey: string;
  sequence: number;
  at: string;
  payload: string;
  state: 'PENDING' | 'CONFLICT' | 'ACKNOWLEDGED';
  message?: string;
}
interface Journal {
  version: 1;
  records: Record<string, string>;
  events: JournalEvent[];
}
function empty(): Journal {
  return { version: 1, records: {}, events: [] };
}
export function readJournal(): Journal {
  if (typeof window === 'undefined') return empty();
  const raw = localStorage.getItem(journalKey);
  if (raw === null) return empty();
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !value.records ||
    typeof value.records !== 'object' ||
    Array.isArray(value.records) ||
    !Object.values(value.records).every((v) => typeof v === 'string') ||
    !Array.isArray(value.events) ||
    value.events.length > 20000
  )
    throw new Error('Pending work could not be read. Stored evidence has not been overwritten.');
  const ids = new Set<string>();
  const latest = new Map<string, string>();
  for (const [index, event] of value.events.entries()) {
    if (
      !event ||
      typeof event.id !== 'string' ||
      ids.has(event.id) ||
      !['production', 'reception', 'disbursement', 'procurement'].includes(event.department) ||
      typeof event.actor !== 'string' ||
      typeof event.recordKey !== 'string' ||
      !Number.isSafeInteger(event.sequence) ||
      event.sequence !== index + 1 ||
      !Number.isFinite(Date.parse(event.at)) ||
      typeof event.payload !== 'string' ||
      !['PENDING', 'CONFLICT', 'ACKNOWLEDGED'].includes(event.state) ||
      (event.message !== undefined && typeof event.message !== 'string')
    )
      throw new Error('Pending work is invalid. Evidence has not been overwritten.');
    ids.add(event.id);
    latest.set(event.recordKey, event.payload);
  }
  if (
    [...latest].some(([key, payload]) => value.records[key] !== payload) ||
    Object.keys(value.records).some((key) => !latest.has(key))
  )
    throw new Error(
      'Saved records do not match their event evidence. Nothing has been overwritten.'
    );
  return value;
}
