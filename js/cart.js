import { getCart, saveCart, removeFromCart, money, formatAuDate, shellBoot, updateCartBadge } from './app.js';

shellBoot('cart');
function render() {
  const cart = getCart();
  const el = document.querySelector('[data-cart]');
  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty"><p class="lede">Cart is empty. <a href="equipment.html">Browse equipment</a>.</p></div>`;
    return;
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  el.innerHTML = `
    <ul class="cart-lines">
      ${cart.map((i) => `
        <li class="cart-line ${i.kind==='bond'?'bond-line':''}">
          <div>
            <strong>${i.title}</strong>
            <div class="meta">${i.variant}${i.hireStart ? ' · Start ' + formatAuDate(i.hireStart) : ''} · ${money(i.price)}</div>
          </div>
          <div class="line-actions">
            <label class="visually-hidden" for="q-${i.key}">Qty</label>
            <input id="q-${i.key}" type="number" min="1" value="${i.qty}" data-qty="${i.key}" style="width:4rem">
            <button type="button" class="btn btn-ghost" data-remove="${i.key}">Remove</button>
          </div>
        </li>`).join('')}
    </ul>
    <div class="cart-foot">
      <div class="totals">Subtotal ${money(total)}</div>
      <a class="btn btn-copper" href="checkout.html">Request hire</a>
    </div>`;
}
const root = document.querySelector('[data-cart]');
root.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-remove]');
  if (btn) { removeFromCart(btn.getAttribute('data-remove')); render(); updateCartBadge(); }
});
root.addEventListener('change', (e) => {
  const inp = e.target.closest('[data-qty]');
  if (!inp) return;
  const key = inp.getAttribute('data-qty');
  const cart = getCart();
  const item = cart.find((c) => c.key === key);
  if (!item) return;
  item.qty = Math.max(1, parseInt(inp.value, 10) || 1);
  saveCart(cart);
  render();
});
render();
