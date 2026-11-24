import { offlineShell } from './tooling/offline-shell.ts';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { API_ORIGIN } from './src/features/api/http.ts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
  const proxy = {
    '/api': { target: env.CADENCE_API_ORIGIN || API_ORIGIN, changeOrigin: true, secure: true },
  };
  return {
    plugins: [react(), tailwindcss(), offlineShell()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    server: { proxy },
    preview: { proxy },
  };
});
