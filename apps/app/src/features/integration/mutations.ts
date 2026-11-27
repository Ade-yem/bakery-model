import type { StaffSession } from './auth';
import type { WorkspaceCommand, WorkspaceSnapshot } from './workspace';

export function assertCanSubmit(
  session: StaffSession,
  data: WorkspaceSnapshot,
  command: WorkspaceCommand
) {
  const module = session.department === 'reception' ? 'orders' : session.department;
  const actions = {
    production: ['production:create'],
    reception: [
      'orders:create',
      'payments:create',
      'orders:push',
      'repayments:create',
      'handover:submit',
      'handover:sign',
    ],
    disbursement: [
      'transfer:accept',
      'orders:fulfill',
      'stock:count',
      'handover:submit',
      'handover:sign',
    ],
    procurement: ['procurement:create'],
  };
  if (
    session.expiresAt <= Date.now() ||
    session.accountStatus !== 'ACTIVE' ||
    session.subscriptionStatus === 'EXPIRED' ||
    !session.planModules.includes(module) ||
    !session.enabledModules.includes(module) ||
    !session.permissions.includes(command.type) ||
    !actions[session.department].includes(command.type)
  )
    throw new Error('Your session cannot post this change. Sign in with the required access.');
  if ((!data.shift || data.shift.status !== 'OPEN') && command.type !== 'handover:sign')
    throw new Error('An open assigned shift is required before posting.');
  if (
    data.handover &&
    (command.type !== 'handover:sign' || data.handover.status === 'SEALED_PENDING_SYNC')
  )
    throw new Error(
      'This shift handover is already submitted. Further postings require the next authorized shift.'
    );
  if (
    command.type === 'handover:sign' &&
    (!data.shift || !data.handover || data.handover.outgoing.actor === session.userId)
  )
    throw new Error('A distinct authorized incoming lead must verify the submitted handover.');
}
/** Keep an idempotency ID after uncertain failures; a repeated intent must not create a duplicate. */
export class MutationQueue {
  private inFlight = false;
  get pending() {
    return this.inFlight;
  }
  private ids = new Map<string, string>();
  async run<T>(fingerprint: string, operation: (eventId: string) => Promise<T>): Promise<T> {
    if (this.inFlight) throw new Error('A change is already being saved. Please wait.');
    const id = this.ids.get(fingerprint) ?? crypto.randomUUID();
    this.ids.set(fingerprint, id);
    this.inFlight = true;
    try {
      const result = await operation(id);
      this.ids.delete(fingerprint);
      return result;
    } finally {
      this.inFlight = false;
    }
  }
}
