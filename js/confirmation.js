import { money, formatAuDate, shellBoot } from './app.js';

shellBoot('checkout');
let order = null;
try { order = JSON.parse(sessionStorage.getItem('ojjm-hire-last-order') || 'null'); } catch {}
sessionStorage.removeItem('ojjm-hire-last-order');
const el = document.querySelector('[data-confirm]');
if (!order) {
  el.innerHTML = `<p class="lede">No recent hire preview found. <a href="equipment.html">Browse equipment</a>.</p>`;
} else {
  const first = (order.name || '').split(' ')[0] || 'there';
  el.innerHTML = `
    <div class="confirm-box">
      <div class="eyebrow">Order preview</div>
      <h1 class="h1 sm">Thanks, ${first}.</h1>
      <p class="lede">Your hire list is ready. Online booking isn't connected on this site yet, so nothing has been sent and no booking was made.</p>
      <ul class="cart-lines">
        ${order.items.map((i) => `<li class="cart-line"><div><strong>${i.title}</strong><div class="meta">${i.variant}${i.hireStart ? ' · Start ' + formatAuDate(i.hireStart) : ''}</div></div><div>${money(i.price * i.qty)}</div></li>`).join('')}
      </ul>
      <p><strong>Subtotal ${money(order.total)}</strong></p>
      <p class="privacy-line">Your details stayed in this browser tab only and have been cleared.</p>
      <p><a class="btn btn-copper" href="index.html">Back to home</a></p>
    </div>`;
}
