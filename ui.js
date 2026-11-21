RTS.ui = (function () {
    const $ = (s, r = document) => r.querySelector(s);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 });
    function card(p) {
        const wish = RTS.store.state.wish.includes(p.id);
        return `<article class="card" data-id="${p.id}">${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
<button class="heart ${wish ? 'on' : ''}" data-wish="${p.id}" aria-label="Save ${p.name}" aria-pressed="${wish}">${wish ? '♥' : '♡'}</button>
<div class="card__img" style="background:var(--bg2)"><span>${p.icon}</span></div>
<div class="card__body"><div class="card__cat">${p.cat} · ★ ${p.rating}</div><h3><a href="#/product/${p.id}">${p.name}</a></h3>
<div class="card__row"><span class="price">${RTS.inr(p.price)}${p.old ? `<s>${RTS.inr(p.old)}</s>` : ''}</span><button class="add" data-add="${p.id}">Add</button></div></div></article>`
    }
    function render(el, list, msg) {
        el.innerHTML = list.length ? list.map(card).join('') : `<p class="sub">${msg || 'Nothing here yet.'}</p>`;
        el.querySelectorAll('.card').forEach((c, i) => { c.style.transitionDelay = i * 70 + 'ms'; io.observe(c) })
    }
    function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 2600) }
    addEventListener('scroll', () => { const h = document.documentElement; $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%' }, { passive: true });
    return { card, render, toast, $ };
})();
