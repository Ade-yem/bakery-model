import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AuthContext,
  requireAuthClient,
  validateSession,
  type AuthClient,
  type AuthState,
} from './auth';
export function AuthProvider({
  client = null,
  children,
}: {
  client?: AuthClient | null;
  children: ReactNode;
}) {
  const [state, setState] = useState<
    Pick<AuthState, 'status' | 'session' | 'error'> & { owner: AuthClient | null }
  >({ owner: client, status: client ? 'loading' : 'unavailable', session: null });
  const revision = useRef(0);
  async function refresh() {
    if (!client) return;
    const request = ++revision.current;
    setState({ owner: client, status: 'loading', session: null });
    try {
      const session = validateSession(await client.getSession());
      if (request === revision.current) setState({ owner: client, status: 'ready', session });
    } catch {
      if (request === revision.current)
        setState({
          owner: client,
          status: 'error',
          session: null,
          error: 'Your session could not be verified. Please retry.',
        });
    }
  }
  useEffect(() => {
    let active = true;
    const request = ++revision.current;
    if (client)
      void client
        .getSession()
        .then((session) => {
          if (active && request === revision.current)
            setState({ owner: client, status: 'ready', session: validateSession(session) });
        })
        .catch(() => {
          if (active && request === revision.current)
            setState({
              owner: client,
              status: 'error',
              session: null,
              error: 'Your session could not be verified. Please retry.',
            });
        });
    return () => {
      active = false;
      revision.current += 1;
    };
  }, [client]);
  return (
    <AuthContext.Provider
      value={{
        ...(state.owner === client
          ? state
          : { status: client ? ('loading' as const) : ('unavailable' as const), session: null }),
        client,
        refresh,
        signIn: async (identifier, password) => {
          const request = ++revision.current;
          const session = validateSession(
            await requireAuthClient(client).signIn(identifier, password)
          );
          if (!session || session.expiresAt <= Date.now())
            throw new Error('Your session could not be verified. Please sign in again.');
          if (request !== revision.current)
            throw new Error('Your session changed. Please sign in again.');
          setState({ owner: client, status: 'ready', session });
          return session;
        },
        selectWorkspace: client?.selectWorkspace
          ? async (branchId, departmentId) => {
              const request = ++revision.current;
              const session = validateSession(
                await client.selectWorkspace!(branchId, departmentId)
              );
              if (!session || !session.department)
                throw new Error('The workspace could not be verified.');
              if (request === revision.current)
                setState({ owner: client, status: 'ready', session });
            }
          : undefined,
        onboardBusiness: client?.onboardBusiness
          ? async (name) => {
              const request = ++revision.current;
              const session = validateSession(await client.onboardBusiness!(name));
              if (request === revision.current)
                setState({ owner: client, status: 'ready', session });
            }
          : undefined,
        signOut: async () => {
          const request = ++revision.current;
          await requireAuthClient(client).signOut();
          if (request !== revision.current) return;
          setState({ owner: client, status: 'ready', session: null });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
