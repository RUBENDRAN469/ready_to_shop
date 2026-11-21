/* Hash router + all inner pages. Each page renders into #view and wires its own handlers. */
RTS.router = (function () {
    const { $, render, toast } = RTS.ui, P = RTS.products, S = RTS.store, inr = RTS.inr;
    const ls = (k, d) => { try { return JSON.parse(localStorage.getItem('rts:' + k)) ?? d } catch (e) { return d } };
    const sv = (k, v) => { try { localStorage.setItem('rts:' + k, JSON.stringify(v)) } catch (e) { } };
    const by = id => P.find(p => p.id == id), COUPONS = { SAVE10: .1, LUXE20: .2 };
    const stock = p => (ls('stock', {})[p.id]) ?? (p.id * 7 % 30 + 5);
    const head = (t, s) => `<h1 class="pg">${t}</h1>${s ? `<p class="sub">${s}</p>` : ''}`;
    const empty = (t, s) => `<div class="empty"><h2>${t}</h2><p class="sub">${s}</p><a class="btn" href="#/shop">Go to shop</a></div>`;
    const f = (n, l, v, t) => `<label>${l}<input name="${n}" type="${t || 'text'}" value="${v || ''}" required><small class="err" id="e-${n}"></small></label>`;
    const REV = [['Anika', 'Great value, and it arrived quickly.', 5], ['Dev', 'Solid build. Does exactly what it says.', 4], ['Maya', 'Lovely product. I wish it came in more colours.', 4]];
    const EMAIL = /^\S+@\S+\.\S+$/;
    const tbl = rows => `<div class="tbl">${rows || '<p class="sub">Nothing to show.</p>'}</div>`;
    let cur = '';
    const pages = {
        shop(el, _, q) {
            const st = { cat: q.get('cat') || '', max: 60000, sort: '', deals: q.get('deals') };
            el.innerHTML = head('Shop', st.deals ? 'Deals only' : '') + `<div class="bar"><select id="fc" aria-label="Category"><option value="">All categories</option>${RTS.categories.map(c => `<option value="${c.id}" ${c.id == st.cat ? 'selected' : ''}>${c.name}</option>`).join('')}</select><label>Up to <output id="fo">${inr(60000)}</output> <input id="fm" type="range" min="1000" max="60000" step="1000" value="60000"></label><select id="fs" aria-label="Sort"><option value="">Featured</option><option value="a">Price: low to high</option><option value="d">Price: high to low</option><option value="r">Top rated</option></select></div><div class="grid" id="g"></div>`;
            const go = () => {
                const l = P.filter(p => (!st.cat || p.cat == st.cat) && p.price <= st.max && (!st.deals || p.old));
                if (st.sort) l.sort((a, b) => st.sort == 'a' ? a.price - b.price : st.sort == 'd' ? b.price - a.price : b.rating - a.rating);
                render($('#g', el), l, 'No products match these filters. Raise the price limit or pick another category.')
            };
            el.oninput = () => { st.cat = $('#fc').value; st.max = +$('#fm').value; st.sort = $('#fs').value; $('#fo').textContent = inr(st.max); go() }; go()
        },
        categories(el) { el.innerHTML = head('Categories') + `<div class="cats">${RTS.categories.map(c => `<a class="cat" href="#/shop?cat=${c.id}"><span>${c.icon}</span>${c.name}</a>`).join('')}</div>` },
        product(el, id) {
            const p = by(id); if (!p) return pages.nf(el);
            S.state.viewed = [p.id, ...S.state.viewed.filter(x => x != p.id)].slice(0, 6); sv('viewed', S.state.viewed);
            const rec = S.state.viewed.filter(x => x != p.id).map(by);
            el.innerHTML = `<a href="#/shop">← Back to shop</a><div class="pd"><div class="pd__img">${p.icon}</div><div><span class="card__cat">${p.cat}</span>${head(p.name, `★ ${p.rating} · ${stock(p)} in stock`)}<p class="price big">${inr(p.price)}${p.old ? `<s>${inr(p.old)}</s>` : ''}</p><div class="hero__cta"><button class="btn" data-add="${p.id}">Add to cart</button><button class="btn btn--ghost" data-wish="${p.id}">♡ Save</button></div></div></div><h2>Reviews</h2>${tbl(REV.map(r => `<div class="line"><b>${r[0]}</b><span>${r[1]}</span><span>${'★'.repeat(r[2])}</span></div>`).join(''))}<h2>Similar products</h2><div class="grid" id="sim"></div>${rec.length ? '<h2>Recently viewed</h2><div class="grid" id="rec"></div>' : ''}`;
            render($('#sim', el), P.filter(x => x.cat == p.cat && x.id != p.id).slice(0, 4), 'No similar products yet.'); if (rec.length) render($('#rec', el), rec)
        },
        search(el, _, q) {
            const hist = ls('hist', []);
            el.innerHTML = head('Search') + `<form class="inline"><input id="sq" list="sg" value="${q.get('q') || ''}" placeholder="Search products or categories" aria-label="Search" autofocus><datalist id="sg">${P.map(p => `<option value="${p.name}">`).join('')}</datalist><button class="btn">Search</button></form><p>${hist.map(h => `<a class="chip" href="#/search?q=${encodeURIComponent(h)}">${h}</a>`).join(' ')}</p><div id="sr"></div>`;
            el.onsubmit = e => { e.preventDefault(); const t = $('#sq').value.trim(); if (t) { sv('hist', [t, ...hist.filter(x => x != t)].slice(0, 5)); location.hash = '/search?q=' + encodeURIComponent(t) } };
            const t = (q.get('q') || '').toLowerCase().trim(); if (!t) return;
            const c = RTS.categories.find(c => t.includes(c.name.toLowerCase().slice(0, -1)));
            $('#sr').innerHTML = (c ? `<p class="sub">Showing category: ${c.name}</p>` : '') + '<div class="grid" id="sg2"></div>';
            render($('#sg2'), P.filter(p => (p.name + ' ' + p.cat + ' ' + p.kw).toLowerCase().includes(t) || (c && p.cat == c.id)), 'No matches. Try “laptop”, “gift” or “gaming”.')
        },
        cart(el) {
            const draw = () => {
                const L = S.state.cart.map(i => ({ ...by(i.id), qty: i.qty })), c = ls('coupon', ''), d = COUPONS[c] || 0, sub = S.cartTotal();
                el.innerHTML = head('Your cart') + (L.length ? tbl(L.map(p => `<div class="line"><a href="#/product/${p.id}">${p.icon} ${p.name}</a><span class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Fewer">−</button>${p.qty}<button data-q="${p.id}" data-d="1" aria-label="More">+</button></span><b>${inr(p.price * p.qty)}</b><button data-q="${p.id}" data-d="-99" aria-label="Remove ${p.name}">×</button></div>`).join('')) + `<form class="inline"><input name="c" placeholder="Coupon (SAVE10 or LUXE20)" value="${c}" aria-label="Coupon"><button class="btn btn--ghost">Apply</button></form><p class="tot">Subtotal ${inr(sub)}${d ? ` · Discount ${d * 100}%` : ''}<br><b>Total ${inr(Math.round(sub * (1 - d)))}</b></p><a class="btn" href="#/checkout">Checkout</a>` : empty('Your cart is empty', 'Add something you like and it will show up here.'))
            };
            el.onclick = e => { const b = e.target.closest('[data-q]'); if (b) { S.setQty(+b.dataset.q, +b.dataset.d); draw() } };
            el.onsubmit = e => { e.preventDefault(); const c = el.querySelector('[name=c]').value.trim().toUpperCase(); if (!c || COUPONS[c]) { sv('coupon', c); toast(c ? 'Coupon applied' : 'Coupon removed') } else toast('That code isn’t valid. Try SAVE10.'); draw() }; draw()
        },
        wishlist(el) { const l = S.state.wish.map(by); el.innerHTML = head('Wishlist') + (l.length ? '<div class="grid" id="wg"></div>' : empty('Nothing saved yet', 'Tap ♡ on any product to save it here.')); if (l.length) render($('#wg', el), l) },
        checkout(el) {
            if (!S.state.cart.length) return el.innerHTML = head('Checkout') + empty('Nothing to check out', 'Your cart is empty.');
            const tot = Math.round(S.cartTotal() * (1 - (COUPONS[ls('coupon', '')] || 0))), u = ls('user', {});
            el.innerHTML = head('Checkout') + `<form class="form" novalidate>${f('name', 'Full name', u.name)}${f('email', 'Email', u.email, 'email')}${f('phone', 'Phone (10 digits)')}${f('addr', 'Delivery address')}${f('pin', 'PIN code (6 digits)')}<label>Payment<select name="pay"><option>Cash on delivery</option><option>UPI (demo)</option><option>Card (demo)</option></select></label><p class="tot"><b>Total ${inr(tot)}</b></p><button class="btn">Place order</button></form>`;
            const R = { name: [/.{2,}/, 'Enter your full name'], email: [EMAIL, 'Enter a valid email'], phone: [/^\d{10}$/, 'Enter a 10-digit number'], addr: [/.{8,}/, 'Enter your full address'], pin: [/^\d{6}$/, 'Enter a 6-digit PIN'] };
            el.onsubmit = e => {
                e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); let ok = true;
                for (const k in R) { const bad = !R[k][0].test((d[k] || '').trim()); $('#e-' + k, el).textContent = bad ? R[k][1] : ''; if (bad) ok = false }
                if (!ok) return; const o = { id: 'RTS' + String(Date.now()).slice(-6), t: Date.now(), items: S.state.cart.map(i => ({ ...i })), total: tot };
                sv('orders', [o, ...ls('orders', [])]); sv('coupon', ''); S.clear();
                el.innerHTML = head('Order confirmed', `Thanks, ${d.name}. Order ${o.id} is placed. This is a demo, so no payment was taken.`) + `<a class="btn" href="#/track/${o.id}">Track order</a>`
            }
        },
        login: el => auth(el, 0), register: el => auth(el, 1),
        profile(el) {
            const u = ls('user'); if (!u) return el.innerHTML = head('Profile') + empty('You’re not signed in', 'Sign in to see your details.').replace('#/shop', '#/login').replace('Go to shop', 'Sign in');
            el.innerHTML = head(u.name, u.email) + `<p class="hero__cta"><a class="btn" href="#/orders">My orders</a><a class="btn btn--ghost" href="#/wishlist">Wishlist (${S.state.wish.length})</a><button class="btn btn--ghost" id="out">Sign out</button></p>`;
            el.onclick = e => { if (e.target.id == 'out') { localStorage.removeItem('rts:user'); toast('Signed out'); location.hash = '/' } }
        },
        orders(el) { const o = ls('orders', []); el.innerHTML = head('My orders') + (o.length ? tbl(o.map(x => `<div class="line"><b>${x.id}</b><span>${new Date(x.t).toLocaleDateString('en-IN')} · ${x.items.length} item(s)</span><b>${inr(x.total)}</b><a href="#/track/${x.id}">Track</a></div>`).join('')) : empty('No orders yet', 'Orders you place will appear here.')) },
        track(el, id) {
            const o = ls('orders', []).find(x => x.id == id), S4 = ['Order placed', 'Packed', 'Shipped', 'Delivered'];
            el.innerHTML = head('Track order') + `<form class="inline"><input name="i" value="${id || ''}" placeholder="Order ID, e.g. RTS123456" aria-label="Order ID"><button class="btn">Track</button></form>` + (id ? (o ? `<ol class="steps">${S4.map((s, i) => `<li class="${i <= Math.min(3, Math.floor((Date.now() - o.t) / 30000)) ? 'on' : ''}">${s}</li>`).join('')}</ol><p class="sub">Demo tracking advances every 30 seconds.</p>` : '<p class="err">No order with that ID on this device.</p>') : '');
            el.onsubmit = e => { e.preventDefault(); location.hash = '/track/' + el.querySelector('[name=i]').value.trim() }
        },
        about: el => el.innerHTML = head('About READY TO SHOP', 'We pair a carefully chosen catalogue with an assistant that helps you find the right thing faster. This is a demo storefront built with HTML, CSS and vanilla JavaScript.'),
        contact(el) {
            el.innerHTML = head('Contact') + `<form class="form" novalidate>${f('name', 'Name')}${f('email', 'Email', '', 'email')}<label>Message<textarea name="m" rows="4" required></textarea><small class="err" id="e-m"></small></label><button class="btn">Send message</button></form>`;
            el.onsubmit = e => {
                e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
                $('#e-name', el).textContent = d.name.trim() ? '' : 'Enter your name'; $('#e-email', el).textContent = EMAIL.test(d.email) ? '' : 'Enter a valid email'; $('#e-m', el).textContent = d.m.trim().length > 9 ? '' : 'Write at least 10 characters';
                if (!el.querySelector('.err:not(:empty)')) { toast('Message sent (demo)'); e.target.reset() }
            }
        },
        faq(el) {
            const Q = [['How does the AI assistant work?', 'It is a simulated assistant that searches the sample catalogue. A real model can be connected through a backend API.'], ['Is my data stored?', 'Cart, wishlist and preferences stay in your browser’s localStorage only.'], ['Do coupons work?', 'Try SAVE10 or LUXE20 in the cart.'], ['Is payment real?', 'No. Checkout is a simulation.']];
            el.innerHTML = head('FAQ') + Q.map(q => `<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('')
        },
        admin(el) {
            const SALES = [42, 55, 48, 70, 64, 88, 95], M = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], real = ls('orders', []), rev = SALES.reduce((a, b) => a + b, 0) * 10000 + real.reduce((a, o) => a + o.total, 0);
            const prods = t => tbl(P.filter(p => p.name.toLowerCase().includes(t)).map(p => `<div class="line"><span>${p.icon} ${p.name}</span><span>${p.cat}</span><b>${inr(p.price)}</b><input type="number" min="0" value="${stock(p)}" data-stock="${p.id}" aria-label="Stock for ${p.name}"></div>`).join(''));
            el.innerHTML = head('Admin dashboard') + `<p class="warn">Demo administration only: no login, no roles, and data stays in this browser. A production admin needs server-side authentication, role checks and a real database.</p><div class="stats">${[['Revenue', inr(rev)], ['Products', P.length], ['Orders', 1284 + real.length], ['Customers', 836]].map(s => `<div class="stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div><h2>Monthly sales (₹ ten-thousands)</h2><div class="chart">${SALES.map((v, i) => `<div class="col"><i style="--h:${v}%"></i><span>${M[i]}</span></div>`).join('')}</div><h2>Products and inventory</h2><input id="pf" placeholder="Filter products" aria-label="Filter products"><div id="pt">${prods('')}</div><h2>Orders</h2>${tbl(real.map(o => `<div class="line"><b>${o.id}</b><b>${inr(o.total)}</b><select data-ost="${o.id}">${['Processing', 'Shipped', 'Delivered'].map(s => `<option ${s == (o.status || 'Processing') ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`).join('') || '<p class="sub">No orders placed on this device yet.</p>')}`;
            el.oninput = e => { if (e.target.id == 'pf') $('#pt').innerHTML = prods(e.target.value.toLowerCase()) };
            el.onchange = e => {
                const t = e.target; if (t.dataset.stock) { const s = ls('stock', {}); s[t.dataset.stock] = +t.value; sv('stock', s); toast('Stock updated') }
                if (t.dataset.ost) { sv('orders', ls('orders', []).map(o => o.id == t.dataset.ost ? { ...o, status: t.value } : o)); toast('Order updated') }
            }
        },
        nf: el => el.innerHTML = empty('Page not found', 'That page doesn’t exist.')
    };
    function auth(el, reg) {
        el.innerHTML = head(reg ? 'Create account' : 'Sign in', 'Demo only. No password is collected or sent anywhere.') + `<form class="form" novalidate>${reg ? f('name', 'Name') : ''}${f('email', 'Email', '', 'email')}<button class="btn">${reg ? 'Create account' : 'Sign in'}</button></form>`;
        el.onsubmit = e => {
            e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); if (!EMAIL.test(d.email)) { $('#e-email', el).textContent = 'Enter a valid email'; return }
            sv('user', { name: (d.name || ls('user', {}).name || d.email.split('@')[0]).trim(), email: d.email }); toast('Signed in'); location.hash = '/profile'
        }
    }
    function route() {
        const [path, qs] = (location.hash.slice(1) || '/').split('?'), seg = path.split('/').filter(Boolean), name = seg[0] || 'home', v = $('#view');
        cur = name; $('#main').hidden = name == 'home'; v.hidden = name == 'home';
        if (name != 'home') { v.className = 'sec'; v.onclick = v.oninput = v.onsubmit = v.onchange = null; (pages[name] || pages.nf)(v, seg[1], new URLSearchParams(qs || '')); void v.offsetWidth; v.className = 'sec view' }
        document.title = (name == 'home' ? 'READY TO SHOP' : name[0].toUpperCase() + name.slice(1) + ' · READY TO SHOP'); scrollTo(0, 0)
    }
    S.subscribe(() => { if (cur == 'wishlist') pages.wishlist($('#view')) });
    return { start() { addEventListener('hashchange', route); route() } };
})();
