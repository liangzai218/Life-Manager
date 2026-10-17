const CACHE_NAME = 'life-manager-v3.4.1';
// 如果有本地化的 lucide.js、css 等，可以加在这里
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-icon.png'
];

// 安装时缓存文件
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

// 清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});