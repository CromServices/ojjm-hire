import { loadCatalog, money, categoryImage, shellBoot } from './app.js';

shellBoot('equipment');
const catalog = await loadCatalog();
const params = new URLSearchParams(location.search);
let cat = params.get('cat') || '';
let readyOnly = params.get('ready') === '1';

const chips = document.querySelector('[data-chips]');
function chipClass(key) {
  return (!cat && !readyOnly && key === 'all') || (key === cat) || (key === 'ready' && readyOnly) ? 'chip is-active' : 'chip';
}
function renderChips() {
  const items = [{ key: 'all', label: 'All', href: 'equipment.html' }]
    .concat(catalog.categories.map((c) => ({ key: c.key, label: c.label, href: `equipment.html?cat=${c.key}` })))
    .concat([{ key: 'ready', label: 'Ready this week', href: 'equipment.html?ready=1' }]);
  chips.innerHTML = items.map((c) => `<a class="${chipClass(c.key)}" href="${c.href}">${c.label}</a>`).join('');
}

function filtered() {
  return catalog.products.filter((p) => {
    if (readyOnly) return p.ready;
    if (!cat) return true;
    return p.category === cat;
  });
}

function renderGrid() {
  const list = filtered();
  const title = readyOnly ? 'Ready this week'
    : (catalog.categories.find((c) => c.key === cat)?.label || 'All equipment');
  document.querySelector('[data-page-title]').textContent = title;
  const grid = document.querySelector('[data-grid]');
  if (!list.length) {
    grid.innerHTML = '<p class="lede">No equipment in this filter.</p>';
    return;
  }
  grid.innerHTML = list.map((p) => `
    <a class="product-card" href="product.html?h=${encodeURIComponent(p.handle)}">
      <div class="thumb"><span class="tag">${p.badge}</span>
        <img class="thumb-img" src="${categoryImage(p)}" alt="${p.title}" width="800" height="600" loading="lazy">
      </div>
      <div class="body"><h3>${p.title}</h3><div class="price">${money(p.variants[0]?.price || 0)} / day</div></div>
    </a>`).join('');
}

renderChips();
renderGrid();
