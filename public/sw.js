const CACHE_VERSION = 'v2';
const STATIC_CACHE_NAME = `riq-static-${CACHE_VERSION}`;
const PAGE_CACHE_NAME = `riq-pages-${CACHE_VERSION}`;
const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'image', 'font', 'manifest']);
const EXCLUDED_PATH_PREFIXES = ['/checkout'];
const EXCLUDED_PATHS = new Set(['/checkout/mobile']);
const SHELL_ASSETS = [
  '/',
  '/site.webmanifest',
  '/icons/app-icon-192.png',
  '/icons/app-icon-512.png',
  '/icons/apple-touch-icon.png',
];

function getScopeUrl() {
  return new URL(self.registration.scope);
}

function toScopedUrl(path) {
  const scopeUrl = getScopeUrl();
  if (path === '/') {
    return scopeUrl.toString();
  }

  return new URL(path.replace(/^\/+/, ''), scopeUrl).toString();
}

function normalizeScopedPath(pathname) {
  const scopePath = getScopeUrl().pathname.replace(/\/$/, '');

  if (!scopePath) {
    return pathname || '/';
  }

  if (pathname === scopePath) {
    return '/';
  }

  if (pathname.startsWith(`${scopePath}/`)) {
    return pathname.slice(scopePath.length) || '/';
  }

  return pathname || '/';
}

function isExcludedPath(pathname) {
  const normalizedPath = normalizeScopedPath(pathname);

  if (EXCLUDED_PATHS.has(normalizedPath)) {
    return true;
  }

  return EXCLUDED_PATH_PREFIXES.some((prefix) => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}

function canCacheResponse(response) {
  return response.ok && response.type !== 'opaqueredirect';
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE_NAME);

    await Promise.all(SHELL_ASSETS.map(async (path) => {
      try {
        await cache.add(toScopedUrl(path));
      } catch (error) {
        console.warn(`Failed to precache ${path}`, error);
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys();

    await Promise.all(cacheKeys.map((cacheKey) => {
      if (cacheKey === STATIC_CACHE_NAME || cacheKey === PAGE_CACHE_NAME) {
        return Promise.resolve();
      }

      return caches.delete(cacheKey);
    }));

    await self.clients.claim();
  })());
});

async function handleNavigationRequest(request) {
  const cache = await caches.open(PAGE_CACHE_NAME);

  try {
    const response = await fetch(request);

    if (canCacheResponse(response)) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return (await cache.match(request)) || (await cache.match(toScopedUrl('/'))) || Promise.reject(error);
  }
}

async function handleStaticAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (canCacheResponse(response)) {
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || isExcludedPath(url.pathname)) {
    if (isExcludedPath(url.pathname)) {
      event.respondWith(fetch(request));
    }

    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (CACHEABLE_DESTINATIONS.has(request.destination)) {
    event.respondWith(handleStaticAssetRequest(request));
  }
});
