/* Persistent state (cart, wishlist, recently viewed) with a tiny pub/sub. */
RTS.store = (function () {
    const read = (k, d) => { try { return JSON.parse(localStorage.getItem('rts:' + k)) ?? d } catch (e) { return d } };
    const write = (k, v) => { try { localStorage.setItem('rts:' + k, JSON.stringify(v)) } catch (e) { } };
    const s = { cart: read('cart', []), wish: read('wish', []), viewed: read('viewed', []) }, subs = [];
    const emit = () => { write('cart', s.cart); write('wish', s.wish); write('viewed', s.viewed); subs.forEach(f => f(s)) };
    return {
        state: s, subscribe: f => subs.push(f),
        addToCart(id) { const l = s.cart.find(i => i.id === id); l ? l.qty++ : s.cart.push({ id, qty: 1 }); emit() },
        toggleWish(id) { const i = s.wish.indexOf(id); i < 0 ? s.wish.push(id) : s.wish.splice(i, 1); emit(); return i < 0 },
        setQty(id, d) { const l = s.cart.find(i => i.id === id); if (l) { l.qty += d; if (l.qty < 1) s.cart = s.cart.filter(i => i !== l) } emit() }, clear() { s.cart = []; emit() }, cartCount: () => s.cart.reduce((a, i) => a + i.qty, 0),
        cartTotal: () => s.cart.reduce((a, i) => a + i.qty * RTS.products.find(p => p.id === i.id).price, 0)
    };
})();
