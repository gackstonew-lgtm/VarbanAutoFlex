import fs from 'fs';
import path from 'path';

console.log('Generating PWA Manifest, Service Worker, and Icon Assets...');

const publicDir = path.resolve('public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate Web App Manifest (public/manifest.json)
const manifest = {
  name: "Varban Auto Flex — Find it. Buy it. Drive it.",
  short_name: "Varban Auto Flex",
  description: "Kenya's Premier Automotive Marketplace for Car Sales, Trade-Ins, and Duty-Paid Imports.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait-primary",
  background_color: "#0B1528",
  theme_color: "#1769E0",
  categories: ["automotive", "shopping", "business"],
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/icons/icon-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log('Created public/manifest.json');

// 2. Generate Service Worker (public/sw.js)
const swCode = `// Varban Auto Flex Service Worker v1.0.0
const CACHE_NAME = 'yardly-pwa-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.jpeg',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Varban Auto Flex SW] Pre-caching core app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Varban Auto Flex SW] Removing obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Network first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
`;

fs.writeFileSync(path.join(publicDir, 'sw.js'), swCode, 'utf-8');
console.log('Created public/sw.js');

// 3. Create SVG Icons
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <rect width="192" height="192" rx="36" fill="#0B1528"/>
  <rect x="12" y="12" width="168" height="168" rx="28" fill="none" stroke="#1769E0" stroke-width="4" stroke-dasharray="12 6"/>
  <path d="M40 130 L65 70 L95 130" stroke="#1769E0" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M152 130 L127 70 L97 130" stroke="#00C853" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="96" cy="72" r="14" fill="#FFD700"/>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#0B1528"/>
  <rect x="24" y="24" width="464" height="464" rx="72" fill="none" stroke="#1769E0" stroke-width="8" stroke-dasharray="24 12"/>
  <path d="M110 350 L180 180 L260 350" stroke="#1769E0" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M402 350 L332 180 L252 350" stroke="#00C853" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="256" cy="180" r="36" fill="#FFD700"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), svg192, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), svg512, 'utf-8');

console.log('Created PWA SVG icons in public/icons/');
