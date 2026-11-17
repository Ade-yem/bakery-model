import { describe, expect, it } from 'vitest';
import { submitOutgoing, signIncoming, parseHandover } from './model';
const lines = [{ id: 'loaf', label: 'Family loaf', expected: 80, scale: 1 as const }];
describe('two-person handover evidence', () => {
  it('requires an explanation for any outgoing or incoming variance', () => {
    expect(() => submitOutgoing(lines, { loaf: '79' }, '', 'outgoing')).toThrow();
    const outgoing = submitOutgoing(lines, { loaf: '79' }, 'One damaged unit', 'outgoing');
    expect(() => signIncoming(outgoing, { loaf: '78' }, '', 'incoming', lines)).toThrow();
  });
  it('requires distinct actors and an unchanged ledger snapshot', () => {
    const outgoing = submitOutgoing(lines, { loaf: '80' }, '', 'outgoing');
    expect(() => signIncoming(outgoing, { loaf: '80' }, '', 'outgoing', lines)).toThrow();
    expect(() =>
      signIncoming(outgoing, { loaf: '80' }, '', 'incoming', [{ ...lines[0], expected: 81 }])
    ).toThrow(/changed/);
  });
  it('retains both physical counts and never claims a server seal', () => {
    const outgoing = submitOutgoing(lines, { loaf: '79' }, 'One damaged unit', 'outgoing');
    const signed = signIncoming(outgoing, { loaf: '79' }, 'Deficiency verified', 'incoming', lines);
    expect(signed.status).toBe('SEALED_PENDING_SYNC');
    expect(signed.result).toBe('UNBALANCED');
    expect(parseHandover(JSON.stringify(signed))).toEqual(signed);
    expect(() => signIncoming(signed, { loaf: '79' }, '', 'another', lines)).toThrow();
  });
  it('rejects invalid, incomplete or tampered stored evidence', () => {
    expect(parseHandover('{')).toBeNull();
    expect(() => submitOutgoing(lines, { loaf: '-1' }, '', 'outgoing')).toThrow();
    expect(() => submitOutgoing(lines, { loaf: '1.2' }, '', 'outgoing')).toThrow();
    const record = submitOutgoing(lines, { loaf: '80' }, '', 'outgoing');
    expect(parseHandover(JSON.stringify({ ...record, status: 'BALANCED' }))).toBeNull();
  });
});
