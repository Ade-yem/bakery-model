import type { ReactNode } from 'react';
import { AuthContext, type Department } from '../../../integration/auth';
import { WorkspaceContext, type WorkspaceSnapshot } from '../../../integration/workspace';
import { AssignedAccess } from '../../policy';
import { dataFor, sessionFor, authState } from './data';
export function TestWorkspace({
  department,
  children,
  data = dataFor(department),
}: {
  department: Department;
  children: ReactNode;
  data?: WorkspaceSnapshot;
}) {
  const session = sessionFor(department);
  return (
    <AuthContext.Provider value={authState(session)}>
      <AssignedAccess.Provider value={session}>
        <WorkspaceContext.Provider
          value={{
            data,
            busy: false,
            submit: async () => {
              throw new Error('No test mutation handler');
            },
            reload: async () => {},
          }}
        >
          {children}
        </WorkspaceContext.Provider>
      </AssignedAccess.Provider>
    </AuthContext.Provider>
  );
}
