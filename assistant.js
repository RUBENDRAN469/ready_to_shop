/* Simulated assistant. To go live, replace reply() with fetch('/api/assistant') to YOUR backend; keep API keys server-side. */
RTS.assistant = (function () {
    const { $, toast } = RTS.ui, log = $('#chatLog'), chat = $('#chat'), input = $('#chatInput');
    const chips = ['Find me a laptop under ₹50,000', 'Suggest a birthday gift for my friend', 'Best headphones for gaming?', 'Compare Slate Air 14 and Forge Book 15'];
    function add(html, me) { const d = document.createElement('div'); d.className = 'msg' + (me ? ' me' : ''); d.innerHTML = html; log.append(d); log.scrollTop = log.scrollHeight; return d }
    function budget(q) { const m = q.replace(/,/g, '').match(/(?:under|below|within|₹|rs\.?)\s*₹?\s*(\d+)(k)?/i); return m ? +m[1] * (m[2] ? 1000 : 1) : null }
    const list = ps => ps.map(p => `<div class="mini"><span>${p.icon} ${p.name}</span><b>${RTS.inr(p.price)}</b></div>`).join('');
    function reply(q) {
        const l = q.toLowerCase(), cap = budget(l);
        if (/compare/.test(l)) {
            const f = RTS.products.filter(p => l.includes(p.name.toLowerCase()));
            if (f.length >= 2) { const [a, b] = f, w = a.rating >= b.rating ? a : b; return `${a.name} is ${RTS.inr(a.price)} (★${a.rating}); ${b.name} is ${RTS.inr(b.price)} (★${b.rating}). ${w.name} is rated higher.` + list(f) }
            return 'Name two products to compare, for example “Compare Slate Air 14 and Forge Book 15”.'
        }
        let c = RTS.categories.find(c => l.includes(c.id.slice(0, -1)) || l.includes(c.name.toLowerCase().slice(0, -1)));
        let r = RTS.products.filter(p => (!c || p.cat === c.id) && (!cap || p.price <= cap) && (c || l.split(/\W+/).some(w => w.length > 3 && (p.kw + ' ' + p.name + ' ' + p.cat).toLowerCase().includes(w))));
        r = r.sort((a, b) => b.rating - a.rating).slice(0, 3);
        return r.length ? `Here ${r.length > 1 ? 'are my top picks' : 'is my top pick'}${cap ? ' within ' + RTS.inr(cap) : ''}:` + list(r) : 'I couldn’t find a match. Try a category (laptops, audio, gifts) or a budget like “under ₹20,000”.'
    }
    function ask(q) {
        q = q.trim(); if (!q) return; add(q.replace(/</g, '&lt;'), true);
        const t = add('<span class="typing"><span></span><span></span><span></span></span>');
        setTimeout(() => { t.innerHTML = reply(q) }, 700)
    }
    function open(v = true) { chat.hidden = !v; if (v) { input.focus(); if (!log.children.length) add('Hi! Tell me what you’re looking for, your budget, or who it’s for.') } }
    $('#chips').innerHTML = chips.map(c => `<button class="chip">${c}</button>`).join('');
    $('#chips').addEventListener('click', e => e.target.matches('.chip') && ask(e.target.textContent));
    $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = '' });
    $('#fab').onclick = () => open(chat.hidden); $('#closeChat').onclick = () => open(false);
    return { open };
})();
