import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import type { Plugin } from 'vite';
/** Cache only the static shell. Auth/API responses and operational records never enter Cache Storage. */
export function offlineShell(): Plugin {
  return {
    name: 'tallybakery-offline-shell', apply: 'build', enforce: 'post',
    generateBundle(_options, bundle) {
      const fonts = readdirSync(new URL('../public/fonts/', import.meta.url)).filter((name) => /\.(ttf|woff2?)$/.test(name));
      const urls = [...new Set(['/index.html', '/favicon.svg', '/manifest.webmanifest', ...Object.keys(bundle).filter((name) => !name.endsWith('.map')).map((name) => `/${name}`), ...fonts.map((name) => `/fonts/${name}`)])];
      const version = createHash('sha256').update(JSON.stringify(urls)).update(fonts.map((name) => readFileSync(new URL(`../public/fonts/${name}`, import.meta.url))).map((buffer) => buffer.toString('base64')).join('')).digest('hex').slice(0, 16);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const CACHE = 'tallybakery-shell-${version}';
const SHELL = ${JSON.stringify(urls)};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('tallybakery-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname === '/api') return;
  if (event.request.mode === 'navigate' && (url.pathname.startsWith('/workspace') || ['/login', '/register', '/forgot-password', '/'].includes(url.pathname))) {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match('/index.html')))); return;
  }
  if (SHELL.includes(url.pathname)) event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
});
` });
    },
  };
}
