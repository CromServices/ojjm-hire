import { loadCatalog, money, categoryImage, shellBoot, addToCart, parseAuDate } from './app.js';

shellBoot('equipment');
const catalog = await loadCatalog();
const handle = new URLSearchParams(location.search).get('h');
const product = catalog.products.find((p) => p.handle === handle);
const root = document.querySelector('[data-product]');
if (!product) {
  root.innerHTML = '<p class="lede">Equipment not found. <a href="equipment.html">Browse equipment</a>.</p>';
} else {
  document.title = `${product.title} – OJJM Hire`;
  const variants = product.variants.map((v, i) => `
    <label class="variant-opt">
      <input type="radio" name="period" value="${v.label}" data-price="${v.price}" ${i===0?'checked':''}>
      <span>${v.label} · ${money(v.price)}</span>
    </label>`).join('');
  root.innerHTML = `
  <div class="wrap product-layout">
    <div class="product-media"><div class="thumb large">
      <span class="tag">${product.badge}</span>
      <img class="thumb-img" src="${categoryImage(product)}" alt="${product.title}" width="1200" height="900">
    </div></div>
    <div class="product-info">
      <div class="eyebrow">${product.type}</div>
      <h1 class="h1 sm">${product.title}</h1>
      <div class="price-row" data-price-label>${money(product.variants[0].price)}</div>
      <p class="lede">${product.body}</p>
      <form class="hire-form" data-hire-form>
        <fieldset class="hire-period"><legend>Hire period</legend>
          <div class="variant-row">${variants}</div>
        </fieldset>
        <div class="hire-date">
          <label for="hire-start">Hire start date (dd/mm/yyyy)</label>
          <input id="hire-start" name="hireStart" type="text" inputmode="numeric" placeholder="dd/mm/yyyy" autocomplete="off" required>
          <p class="hint">Pick your start date. Availability is checked when online booking is connected.</p>
        </div>
        <button type="submit" class="btn btn-copper btn-block">Add hire to cart</button>
      </form>
      <div class="bond-card">
        <div class="eyebrow">Refundable bond</div>
        <p>A refundable $250 bond is added to each hire and returned once the gear is back in good order.</p>
        <button type="button" class="btn btn-ghost" data-add-bond>Add bond · ${money(catalog.bond.price)}</button>
      </div>
      <div class="fulfill-note"><strong>Fulfilment</strong> — Choose local pickup or local delivery when you send the request.</div>
    </div>
  </div>`;

  root.addEventListener('change', (e) => {
    if (e.target.matches('input[name="period"]')) {
      root.querySelector('[data-price-label]').textContent = money(+e.target.dataset.price);
    }
  });
  root.querySelector('[data-hire-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const period = root.querySelector('input[name="period"]:checked');
    const dateRaw = root.querySelector('#hire-start').value;
    const iso = parseAuDate(dateRaw);
    if (!iso) {
      let err = root.querySelector('[data-date-error]');
      if (!err) {
        err = document.createElement('p');
        err.className = 'hint';
        err.dataset.dateError = '1';
        err.style.color = 'var(--copper)';
        root.querySelector('.hire-date').appendChild(err);
      }
      err.textContent = 'Enter the hire start as dd/mm/yyyy.';
      return;
    }
    addToCart({
      kind: 'hire',
      handle: product.handle,
      title: product.title,
      variant: period.value,
      price: +period.dataset.price,
      hireStart: iso,
      image: product.image,
    });
    // Bond is added with each hire (same as product copy)
    const cartNow = JSON.parse(localStorage.getItem('ojjm-hire-cart-v1') || '[]');
    const hasBond = cartNow.some((c) => c.kind === 'bond');
    if (!hasBond) {
      addToCart({
        kind: 'bond',
        handle: catalog.bond.handle,
        title: catalog.bond.title,
        variant: 'Bond',
        price: catalog.bond.price,
        hireStart: '',
        image: catalog.bond.image,
      });
    }
    location.href = 'cart.html';
  });
  root.querySelector('[data-add-bond]').addEventListener('click', () => {
    addToCart({
      kind: 'bond',
      handle: catalog.bond.handle,
      title: catalog.bond.title,
      variant: 'Bond',
      price: catalog.bond.price,
      hireStart: '',
      image: catalog.bond.image,
    });
    location.href = 'cart.html';
  });
}
