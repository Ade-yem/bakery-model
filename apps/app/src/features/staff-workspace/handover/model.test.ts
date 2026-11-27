import { describe, expect, it } from 'vitest';
import { submitOutgoing, signIncoming, parseHandover } from './model';
const lines = [{ id: 'loaf', label: 'Family loaf', expected: 80, scale: 1 as const }];
describe('two-person handover evidence', () => {
  it('preserves numeric-leading catalogue UUIDs through both signatures and storage', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const products = [{ ...lines[0], id }];
    const counts = { [id]: '80' };
    const outgoing = submitOutgoing(products, counts, '', 'outgoing');
    expect(outgoing.outgoing.counts[id]).toBe(80);
    expect(parseHandover(JSON.stringify(outgoing))).toEqual(outgoing);
    const signed = signIncoming(outgoing, counts, '', 'incoming', products);
    expect(signed.incoming?.counts[id]).toBe(80);
    expect(signed.result).toBe('BALANCED');
    expect(parseHandover(JSON.stringify(signed))).toEqual(signed);
  });
  it.each(['', '_loaf', 'loaf count', 'loaf.count', '__proto__'])(
    'rejects an invalid count identifier %j',
    (id) => {
      expect(() => submitOutgoing([{ ...lines[0], id }], { [id]: '80' }, '', 'outgoing')).toThrow(
        'Invalid count context.'
      );
    }
  );
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
