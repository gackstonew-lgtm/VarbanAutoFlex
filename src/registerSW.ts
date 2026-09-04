export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Verban Auto PWA] ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((err) => {
          console.warn('[Verban Auto PWA] ServiceWorker registration failed: ', err);
        });
    });
  }
}
