import { getCart, clearCart, money, formatAuDate, shellBoot } from './app.js';

shellBoot('checkout');
const cart = getCart();
const summary = document.querySelector('[data-summary]');
const form = document.querySelector('[data-checkout-form]');
if (!cart.length) {
  summary.innerHTML = `<p class="lede">Cart is empty. <a href="equipment.html">Browse equipment</a>.</p>`;
  form.hidden = true;
} else {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  summary.innerHTML = `
    <ul class="cart-lines">
      ${cart.map((i) => `<li class="cart-line"><div><strong>${i.title}</strong><div class="meta">${i.variant}${i.hireStart ? ' · Start ' + formatAuDate(i.hireStart) : ''} × ${i.qty}</div></div><div>${money(i.price * i.qty)}</div></li>`).join('')}
    </ul>
    <p><strong>Subtotal ${money(total)}</strong></p>
    <p class="hint">No payment is taken on this page. Nothing you enter is sent from this site.</p>`;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const order = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      notes: fd.get('notes') || '',
      items: cart,
      total,
      at: new Date().toISOString(),
    };
    sessionStorage.setItem('ojjm-hire-last-order', JSON.stringify(order));
    clearCart();
    location.href = 'confirmation.html';
  });
}
