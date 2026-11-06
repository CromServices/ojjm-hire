const DATA_URL = new URL('../data/products.json', import.meta.url);
// fallback for non-module use
const DATA_PATH = 'data/products.json';
const CART_KEY = 'ojjm-hire-cart-v1';

export async function loadCatalog() {
  const res = await fetch(DATA_PATH);
  if (!res.ok) throw new Error('Could not load catalogue');
  return res.json();
}

export function money(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);
}

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

export function cartCount() {
  return getCart().reduce((s, i) => s + (i.qty || 1), 0);
}

export function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    const n = cartCount();
    el.textContent = n > 0 ? `Cart (${n})` : 'Cart';
  });
}

export function addToCart(item) {
  const cart = getCart();
  const key = `${item.handle}|${item.variant}|${item.hireStart || ''}|${item.kind || 'hire'}`;
  const existing = cart.find((c) => c.key === key);
  if (existing) existing.qty += item.qty || 1;
  else cart.push({ ...item, key, qty: item.qty || 1 });
  saveCart(cart);
}

export function removeFromCart(key) {
  saveCart(getCart().filter((c) => c.key !== key));
}

export function clearCart() {
  saveCart([]);
}

export function parseAuDate(str) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((str || '').trim());
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export function formatAuDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function categoryImage(p) {
  return `img/${p.image || 'cat-bond-general.jpg'}`;
}

export function productByHandle(catalog, handle) {
  return catalog.products.find((p) => p.handle === handle);
}

export function applyThemeToggle() {
  const root = document.documentElement;
  const key = 'ojjm-theme';
  const saved = localStorage.getItem(key) || 'system';
  function resolveScheme(mode) {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(mode) {
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = resolveScheme(mode);
    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-btn') === mode));
    });
  }
  apply(saved);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-btn]');
    if (btn) {
      const mode = btn.getAttribute('data-theme-btn');
      localStorage.setItem(key, mode);
      apply(mode);
    }
    const tog = e.target.closest('[data-nav-toggle]');
    if (tog) document.querySelector('[data-nav]')?.classList.toggle('is-open');
  });
}

export function renderHeader(active = '') {
  return `
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html">
      <div class="brand-mark">OJJM HIRE</div>
      <div class="brand-sub">HIRE · FREMANTLE &amp; SOUTH METRO</div>
    </a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Menu">Menu</button>
    <nav class="nav" data-nav>
      <a href="equipment.html"${active==='equipment'?' aria-current="page"':''}>Equipment</a>
      <a href="equipment.html?cat=survey-levels">Survey</a>
      <a href="equipment.html?cat=access-height">Access</a>
      <a class="btn btn-copper" href="cart.html" data-cart-count>Cart</a>
      <div class="theme-toggle" role="group" aria-label="Colour theme">
        <button type="button" data-theme-btn="system" aria-pressed="true">System</button>
        <button type="button" data-theme-btn="light" aria-pressed="false">Light</button>
        <button type="button" data-theme-btn="dark" aria-pressed="false">Dark</button>
      </div>
    </nav>
  </div>
</header>`;
}

export function renderFooter() {
  return `
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <strong>OJJM Hire</strong><br>
      Fremantle &amp; south metro · WA
    </div>
  </div>
</footer>`;
}

export function shellBoot(active) {
  const header = document.querySelector('[data-header]');
  const footer = document.querySelector('[data-footer]');
  if (header) header.outerHTML = renderHeader(active);
  if (footer) footer.outerHTML = renderFooter();
  applyThemeToggle();
  updateCartBadge();
  document.documentElement.style.setProperty('--ink', '#1A1C1E');
  document.documentElement.style.setProperty('--panel', '#F4F1EA');
  document.documentElement.style.setProperty('--copper', '#C45C26');
  document.documentElement.style.setProperty('--moss', '#2F4F3E');
  document.documentElement.style.setProperty('--hivis', '#C8FF00');
}
