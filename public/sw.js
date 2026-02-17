self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now. 
  // Next.js handles caching well, we just need this for "Add to Home Screen" eligibility.
});
