import { loadCatalog, money, categoryImage, shellBoot, addToCart, formatAuDate } from './app.js';

shellBoot('equipment');
const catalog = await loadCatalog();
const handle = new URLSearchParams(location.search).get('h');
const product = catalog.products.find((p) => p.handle === handle);
const root = document.querySelector('[data-product]');

function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function weekdayShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', { weekday: 'short' });
}

function updateReadout(input) {
  const out = root.querySelector('[data-date-readout]');
  if (!out) return;
  const v = input.value;
  if (!v) {
    out.textContent = '';
    return;
  }
  out.textContent = `Starts ${weekdayShort(v)} ${formatAuDate(v)}`;
}

function showDateError(msg) {
  let err = root.querySelector('[data-date-error]');
  if (!err) {
    err = document.createElement('p');
    err.className = 'date-error';
    err.dataset.dateError = '1';
    root.querySelector('.hire-date').appendChild(err);
  }
  err.textContent = msg;
  err.hidden = !msg;
}

function openPicker(input) {
  try {
    if (typeof input.showPicker === 'function') input.showPicker();
  } catch (_) { /* ignore unsupported / not-allowed */ }
}

if (!product) {
  root.innerHTML = '<p class="lede">Equipment not found. <a href="equipment.html">Browse equipment</a>.</p>';
} else {
  document.title = `${product.title} – OJJM Hire`;
  const variants = product.variants.map((v, i) => `
    <label class="variant-opt">
      <input type="radio" name="period" value="${v.label}" data-price="${v.price}" ${i === 0 ? 'checked' : ''}>
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
          <label for="hire-start">Hire start date</label>
          <div class="date-field" data-date-field>
            <input id="hire-start" name="hireStart" type="date" required>
            <span class="date-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                <path d="M16 3v4M8 3v4M3 11h18"></path>
              </svg>
            </span>
          </div>
          <p class="date-readout" data-date-readout></p>
          <p class="hint">Pick your start date. Availability is checked when online booking is connected.</p>
          <p class="date-error" data-date-error hidden></p>
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

  const dateInput = root.querySelector('#hire-start');
  dateInput.min = todayISO();
  dateInput.addEventListener('change', () => {
    showDateError('');
    updateReadout(dateInput);
  });
  dateInput.addEventListener('input', () => updateReadout(dateInput));

  const field = root.querySelector('[data-date-field]');
  field.addEventListener('click', (e) => {
    if (e.target === dateInput) return;
    dateInput.focus();
    openPicker(dateInput);
  });
  dateInput.addEventListener('focus', () => openPicker(dateInput));
  dateInput.addEventListener('click', () => openPicker(dateInput));

  root.addEventListener('change', (e) => {
    if (e.target.matches('input[name="period"]')) {
      root.querySelector('[data-price-label]').textContent = money(+e.target.dataset.price);
    }
  });

  root.querySelector('[data-hire-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const period = root.querySelector('input[name="period"]:checked');
    const iso = dateInput.value;
    const min = dateInput.min || todayISO();
    if (!iso) {
      showDateError('Choose a hire start date.');
      dateInput.focus();
      return;
    }
    if (iso < min) {
      showDateError('Choose today or a future date.');
      dateInput.focus();
      return;
    }
    showDateError('');
    addToCart({
      kind: 'hire',
      handle: product.handle,
      title: product.title,
      variant: period.value,
      price: +period.dataset.price,
      hireStart: iso,
      image: product.image,
    });
    const cartNow = JSON.parse(localStorage.getItem('ojjm-hire-cart-v1') || '[]');
    if (!cartNow.some((c) => c.kind === 'bond')) {
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
