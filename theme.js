RTS.theme = (function () {
    const root = document.documentElement, btn = document.getElementById('themeToggle');
    const sync = () => btn.setAttribute('aria-checked', root.dataset.theme === 'dark');
    btn.addEventListener('click', () => {
        const n = root.dataset.theme === 'dark' ? 'day' : 'dark';
        root.dataset.theme = n; try { localStorage.setItem('rts:theme', n) } catch (e) { } sync()
    });
    sync();
})();
