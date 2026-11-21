import { describe, expect, it, vi } from 'vitest';
import { assertCanSubmit, MutationQueue } from './mutations';
import { dataFor, sessionFor } from '../staff-workspace/__tests__/fixtures/data';
import { submitOutgoing } from '../staff-workspace/handover/model';
const command = { type: 'orders:push' as const, orderId: 'test-order' };
describe('workspace mutations', () => {
  it('retains stable IDs across a timeout and resolves only after an acknowledged result', async () => {
    const queue = new MutationQueue();
    const ids: string[] = [];
    await expect(
      queue.run('intent', async (id) => {
        ids.push(id);
        throw new Error('timeout');
      })
    ).rejects.toThrow('timeout');
    await expect(
      queue.run('intent', async (id) => {
        ids.push(id);
        return 'acknowledged';
      })
    ).resolves.toBe('acknowledged');
    expect(ids[0]).toBe(ids[1]);
  });
  it('rejects concurrent posts without sending a second operation', async () => {
    const queue = new MutationQueue();
    let finish!: () => void;
    const first = queue.run(
      'first',
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const second = vi.fn();
    await expect(queue.run('second', second)).rejects.toThrow('already being saved');
    expect(second).not.toHaveBeenCalled();
    finish();
    await first;
  });
  it('checks assignments, active session and plan permissions before sending', () => {
    const data = dataFor('reception');
    expect(() => assertCanSubmit(sessionFor('reception'), data, command)).not.toThrow();
    for (const patch of [
      { permissions: [] },
      { enabledModules: [] },
      { planModules: [] },
      { expiresAt: 0 },
      { accountStatus: 'SUSPENDED' as const },
    ])
      expect(() => assertCanSubmit(sessionFor('reception', patch), data, command)).toThrow();
    expect(() =>
      assertCanSubmit(sessionFor('production'), dataFor('production'), command)
    ).toThrow();
  });
  it('freezes postings at handover and requires a distinct incoming signer', () => {
    const session = sessionFor('reception');
    const data = dataFor('reception');
    data.handover = submitOutgoing(
      [{ id: 'cash', label: 'Cash', expected: 0, scale: 100 }],
      { cash: '0' },
      '',
      session.userId
    );
    expect(() => assertCanSubmit(session, data, command)).toThrow(/handover/);
    expect(() =>
      assertCanSubmit(session, data, { type: 'handover:sign', counts: { cash: '0' }, note: '' })
    ).toThrow(/distinct/);
    expect(() =>
      assertCanSubmit(sessionFor('reception', { userId: 'incoming-user' }), data, {
        type: 'handover:sign',
        counts: { cash: '0' },
        note: '',
      })
    ).not.toThrow();
    expect(() =>
      assertCanSubmit(session, { ...data, shift: null, handover: null }, command)
    ).toThrow(/open assigned shift/);
  });
});
