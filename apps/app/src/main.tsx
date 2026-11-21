import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { createApiClient } from './features/api/http';
import { createAuthClient } from './features/api/auth-client';
const api = createApiClient();
let selectors: Storage | null = null;
try {
  selectors = sessionStorage;
} catch {
  /* Context can still be selected for this visit. */
}
const authClient = createAuthClient(api, selectors);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App authClient={authClient} api={api} />
  </StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // The online app remains available if static-shell caching is blocked.
      window.dispatchEvent(new Event('staff-offline-shell-unavailable'));
    });
  });
}
