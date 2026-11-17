import { afterEach, describe, expect, it, vi } from 'vitest';
import { commitRecord, journalKey, readJournal, readRecord, recordOutcomes } from './store';
import { DEMO_SESSION_KEY } from '../../mock-auth/session';
afterEach(() => vi.unstubAllGlobals());
function setup() {
  const data = new Map<string, string>();
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  });
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) =>
      key === DEMO_SESSION_KEY
        ? JSON.stringify({ department: 'production', expiresAt: Date.now() + 100000 })
        : null,
  });
  return data;
}
describe('durable local operational journal', () => {
  it('commits projection and event in one write, persists stable IDs and deduplicates identical retries', () => {
    setup();
    commitRecord('tallybakery:production-records:v1', '[1]');
    const event = readJournal().events[0];
    expect(readRecord('tallybakery:production-records:v1')).toBe('[1]');
    commitRecord('tallybakery:production-records:v1', '[1]');
    expect(readJournal().events).toHaveLength(1);
    expect(readJournal().events[0].id).toBe(event.id);
  });
  it('keeps pending evidence on partial outcomes and rejects unknown acknowledgements', () => {
    setup();
    commitRecord('tallybakery:production-records:v1', '[1]');
    commitRecord('tallybakery:production-records:v1', '[1,2]');
    const first = readJournal().events[0].id;
    expect(() => recordOutcomes([{ id: 'unknown', status: 'ACKNOWLEDGED' }], [first])).toThrow();
    recordOutcomes([{ id: first, status: 'CONFLICT', message: 'Version changed' }], [first]);
    expect(readJournal().events.map((e) => e.state)).toEqual(['CONFLICT', 'PENDING']);
    expect(readJournal().events[0].payload).toBe('[1]');
  });
  it('preserves corrupted data and rejects cross-department posting', () => {
    const data = setup();
    expect(() => commitRecord('tallybakery:reception-records:v1', '[]')).toThrow();
    data.set(journalKey, '{broken');
    expect(() => commitRecord('tallybakery:production-records:v1', '[]')).toThrow();
    expect(data.get(journalKey)).toBe('{broken');
  });
  it('does not expose success or partially write on storage failure', () => {
    setup();
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(() => commitRecord('tallybakery:production-records:v1', '[]')).toThrow('quota');
    expect(readJournal().events).toHaveLength(0);
  });
});

it('freezes further postings once a shift handover has been submitted', () => {
  setup();
  commitRecord(
    'tallybakery:production:dual-handover:v1',
    JSON.stringify({ status: 'AWAITING_INCOMING_SIGNOFF' })
  );
  expect(() => commitRecord('tallybakery:production-records:v1', '[1]')).toThrow(
    /awaiting incoming/
  );
  expect(readJournal().events).toHaveLength(1);
  commitRecord(
    'tallybakery:production:dual-handover:v1',
    JSON.stringify({ status: 'SEALED_PENDING_SYNC' })
  );
  expect(() => commitRecord('tallybakery:production-records:v1', '[1]')).toThrow(
    /next authorized shift/
  );
});
