(function () {
    const { $, render, toast } = RTS.ui, P = RTS.products, S = RTS.store;
    function paint() {
        render($('#trending'), P.filter(p => p.tag === 'Trending' || p.rating >= 4.5).slice(0, 4));
        const cats = new Set(P.filter(p => S.state.wish.includes(p.id)).map(p => p.cat));
        const picks = (cats.size ? P.filter(p => cats.has(p.cat) && !S.state.wish.includes(p.id)) : P.slice().sort((a, b) => b.rating - a.rating)).slice(0, 4);
        $('#picksNote').textContent = cats.size ? 'Based on products you saved.' : 'Top rated for now. Save products to personalize this.';
        render($('#picksGrid'), picks); render($('#dealsGrid'), P.filter(p => p.old)); render($('#newGrid'), P.filter(p => p.tag === 'New'));
        const set = (id, n) => { const b = $(id); if (b.textContent != n) { b.textContent = n; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump') } };
        set('#cartCount', S.cartCount()); set('#wishCount', S.state.wish.length)
    }
    $('#cats').innerHTML = RTS.categories.map(c => `<a class="cat" href="#/shop?cat=${c.id}"><span>${c.icon}</span>${c.name}</a>`).join('');
    document.addEventListener('click', e => {
        const t = e.target;
        if (t.dataset.add) { S.addToCart(+t.dataset.add); toast('Added to cart') }
        else if (t.dataset.wish) { const on = S.toggleWish(+t.dataset.wish); toast(on ? 'Saved to wishlist' : 'Removed from wishlist') }
        else if (t.closest('[data-open-assistant],#openAssistant')) RTS.assistant.open();
        else if (t.closest('#navLinks a')) $('#navLinks').classList.remove('open')
    });
    $('#news').addEventListener('submit', e => {
        e.preventDefault(); const v = e.target.email.value.trim();
        if (/^\S+@\S+\.\S+$/.test(v)) { toast('You’re subscribed (demo)'); e.target.reset() } else toast('Enter a valid email address')
    });
    $('#menuBtn').onclick = e => { const o = $('#navLinks').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o) };
    S.subscribe(paint); paint(); RTS.router.start();
    addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 500));
})();
