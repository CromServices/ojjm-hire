import { loadCatalog, money, categoryImage, shellBoot } from './app.js';

shellBoot('home');
const catalog = await loadCatalog();
const ready = catalog.products.filter((p) => p.ready).slice(0, 3);
const readyEl = document.querySelector('[data-ready]');
readyEl.innerHTML = ready.map((p) => `
  <a class="product-card" href="product.html?h=${encodeURIComponent(p.handle)}">
    <div class="thumb"><span class="tag">${p.badge}</span>
      <img class="thumb-img" src="${categoryImage(p)}" alt="${p.title}" width="800" height="600" loading="lazy">
    </div>
    <div class="body"><h3>${p.title}</h3><div class="price">${money(p.variants[0]?.price || 0)} / day</div></div>
  </a>`).join('');

const catImg = {
  earthmoving: 'img/cat-earthmoving.jpg',
  'access-height': 'img/cat-access-height.jpg',
  'concrete-compaction': 'img/cat-concrete-compaction.jpg',
  'survey-levels': 'img/cat-survey-levels.jpg',
  'power-lighting': 'img/cat-power-lighting.jpg',
  'cranes-lifting': 'img/cat-cranes-lifting.jpg',
};
const cats = document.querySelector('[data-cats]');
cats.innerHTML = catalog.categories.map((c) => `
  <a class="cat-card cat-card-photo" href="equipment.html?cat=${c.key}">
    <div class="thumb"><img class="thumb-img" src="${catImg[c.key]}" alt="" width="800" height="600" loading="lazy"></div>
    <div class="body"><h3>${c.label}</h3></div>
  </a>`).join('');
