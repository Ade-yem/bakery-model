/** Atomic browser journal for the current local workspace adapter. No events are discarded on failed sync. */
import { DEMO_SESSION_KEY, readDemoSession } from '../../mock-auth/session';
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
export function readRecord(key: string): string | null {
  const journal = readJournal();
  return Object.hasOwn(journal.records, key) ? journal.records[key] : localStorage.getItem(key);
}
export function commitRecord(key: string, payload: string): void {
  const session = readDemoSession(sessionStorage.getItem(DEMO_SESSION_KEY));
  if (
    !session ||
    session.accountStatus === 'SUSPENDED' ||
    session.accountStatus === 'INACTIVE' ||
    session.subscriptionStatus === 'EXPIRED'
  )
    throw new Error(
      'Your session cannot post this change. Sign in with an active account; your input is retained.'
    );
  const department = session.department;
  if (!key.startsWith(`tallybakery:${department}`))
    throw new Error('This record belongs to another department.');
  const journal = readJournal();
  if (journal.records[key] === payload) return;
  if (!key.includes('dual-handover')) {
    const handoverKey = `tallybakery:${department}:dual-handover:v1`;
    const saved = journal.records[handoverKey] ?? localStorage.getItem(handoverKey);
    if (saved) {
      const handover = JSON.parse(saved);
      if (!['AWAITING_INCOMING_SIGNOFF', 'SEALED_PENDING_SYNC'].includes(handover?.status))
        throw new Error('Shift handover evidence needs review before posting can continue.');
      throw new Error(
        handover.status === 'SEALED_PENDING_SYNC'
          ? 'This shift is signed and awaiting acknowledgement. New postings require the next authorized shift.'
          : 'This shift is awaiting incoming verification. Complete the handover before posting to a new shift.'
      );
    }
  }

  if (journal.events.length >= 20000)
    throw new Error(
      'Local queue capacity reached. Keep this form open and contact your administrator before continuing.'
    );
  const event: JournalEvent = {
    id: crypto.randomUUID(),
    department,
    actor: `${department}@demo.tallybakery.test`,
    recordKey: key,
    sequence: journal.events.length + 1,
    at: new Date().toISOString(),
    payload,
    state: 'PENDING',
  };
  // The new projection and its event are one localStorage write: both commit, or neither does.
  localStorage.setItem(
    journalKey,
    JSON.stringify({
      version: 1,
      records: { ...journal.records, [key]: payload },
      events: [...journal.events, event],
    })
  );
  window.dispatchEvent(new Event('staff-journal-change'));
}
export type TransportResult = { id: string; status: 'ACKNOWLEDGED' | 'CONFLICT'; message?: string };
export function recordOutcomes(results: TransportResult[], allowedIds: readonly string[]): void {
  const journal = readJournal();
  if (
    new Set(results.map((result) => result.id)).size !== results.length ||
    results.some(
      (result) =>
        !allowedIds.includes(result.id) ||
        !journal.events.some((event) => event.id === result.id && event.state === 'PENDING') ||
        !['ACKNOWLEDGED', 'CONFLICT'].includes(result.status) ||
        (result.message !== undefined && typeof result.message !== 'string')
    )
  )
    throw new Error('Invalid synchronization response. Pending evidence has been retained.');
  const events = journal.events.map((event) => {
    const result = results.find((r) => r.id === event.id);
    return result ? { ...event, state: result.status, message: result.message } : event;
  });
  localStorage.setItem(journalKey, JSON.stringify({ ...journal, events }));
  window.dispatchEvent(new Event('staff-journal-change'));
}

export function localQueueStatus(department: string) {
  const journal = readJournal();
  const entries = journal.events.filter((event) => event.department === department);
  const keys = [
    `tallybakery:${department}-records:v1`,
    `tallybakery:${department}-repayments:v1`,
    `tallybakery:${department}:dual-handover:v1`,
  ];
  const untracked = keys.some(
    (key) => !Object.hasOwn(journal.records, key) && localStorage.getItem(key) !== null
  );
  return {
    pending: untracked ? null : entries.filter((event) => event.state === 'PENDING').length,
    conflicts: entries.filter((event) => event.state === 'CONFLICT').length,
    untracked,
  };
}
