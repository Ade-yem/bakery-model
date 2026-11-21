import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth, type StaffSession } from './auth';
import {
  WorkspaceContext,
  validateWorkspaceScope,
  type WorkspaceAdapter,
  type WorkspaceSnapshot,
} from './workspace';
import { MutationQueue, assertCanSubmit } from './mutations';
import { StaffState } from '../staff-workspace/StaffState';
export function WorkspaceProvider({
  adapter,
  children,
}: {
  adapter?: WorkspaceAdapter;
  children: ReactNode;
}) {
  const { session } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    owner: StaffSession;
    adapter: WorkspaceAdapter;
    attempt: number;
    data: WorkspaceSnapshot;
  } | null>(null);
  const [error, setError] = useState<{
    owner: StaffSession;
    adapter: WorkspaceAdapter;
    attempt: number;
    message: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const queue = useRef(new MutationQueue());
  const currentSession = useRef(session);
  const revision = useRef(0);
  useEffect(() => {
    let active = true;
    const request = ++revision.current;
    currentSession.current = session;
    queue.current = new MutationQueue();
    if (session && adapter)
      void adapter
        .load(session)
        .then((data) => {
          if (active && request === revision.current)
            setSnapshot({
              owner: session,
              adapter,
              attempt,
              data: validateWorkspaceScope(data, session),
            });
        })
        .catch(() => {
          if (active && request === revision.current)
            setError({
              owner: session!,
              adapter: adapter!,
              attempt,
              message: 'Your workspace could not be loaded. Please retry.',
            });
        });
    return () => {
      active = false;
      revision.current += 1;
      currentSession.current = null;
    };
  }, [session, adapter, attempt]);
  if (!adapter)
    return (
      <StaffState
        title="Workspace unavailable"
        description="Your workspace is currently unavailable. Please try again later."
      />
    );
  if (!session) return null;
  if (error && error.owner === session && error.adapter === adapter && error.attempt === attempt)
    return (
      <section className="sw-root sw-session">
        <h1>Workspace unavailable</h1>
        <p role="alert">{error.message}</p>
        <button className="sw-primary" onClick={() => setAttempt((value) => value + 1)}>
          Retry loading workspace
        </button>
      </section>
    );
  if (
    !snapshot ||
    snapshot.owner !== session ||
    snapshot.adapter !== adapter ||
    snapshot.attempt !== attempt
  )
    return (
      <StaffState
        title="Loading your workspace"
        description="Please wait while your assigned records are loaded."
      />
    );
  return (
    <WorkspaceContext.Provider
      value={{
        data: snapshot.data,
        busy,
        reload: async () => {
          if (queue.current.pending)
            throw new Error('Wait for the current change to finish saving.');
          const request = ++revision.current;
          const data = validateWorkspaceScope(await adapter.load(session), session);
          if (currentSession.current === session && request === revision.current)
            setSnapshot({ owner: session, adapter, attempt, data });
        },
        submit: async (command) => {
          if (queue.current.pending)
            throw new Error('A change is already being saved. Please wait.');
          assertCanSubmit(session, snapshot.data, command);
          const request = ++revision.current;
          const fingerprint = JSON.stringify([snapshot.data.version, command]);
          setBusy(true);
          try {
            const data = await queue.current.run(fingerprint, async (eventId) =>
              validateWorkspaceScope(
                await adapter.mutate(session, {
                  eventId,
                  expectedVersion: snapshot.data.version,
                  command,
                }),
                session
              )
            );
            if (currentSession.current !== session || request !== revision.current)
              throw new Error('Your session changed. Reload your workspace before continuing.');
            setSnapshot({ owner: session, adapter, attempt, data });
          } finally {
            setBusy(false);
          }
        },
      }}
    >
      <div aria-busy={busy}>{children}</div>
    </WorkspaceContext.Provider>
  );
}
