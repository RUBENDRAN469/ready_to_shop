window.RTS = window.RTS || {};
RTS.categories = [{ id: 'laptops', name: 'Laptops', icon: '💻' }, { id: 'phones', name: 'Smartphones', icon: '📱' }, { id: 'audio', name: 'Audio', icon: '🎧' }, { id: 'wearables', name: 'Wearables', icon: '⌚' }, { id: 'gifts', name: 'Gifts', icon: '🎁' }, { id: 'gaming', name: 'Gaming', icon: '🎮' }];
RTS.products = [
    { id: 1, name: 'Slate Air 14', cat: 'laptops', price: 46999, old: 52999, rating: 4.6, icon: '💻', tag: 'Trending', kw: 'work study office' },
    { id: 2, name: 'Forge Book 15', cat: 'laptops', price: 38999, rating: 4.3, icon: '🖥', kw: 'student budget' },
    { id: 3, name: 'Nova X Phone', cat: 'phones', price: 29999, old: 34999, rating: 4.5, icon: '📱', tag: 'Deal', kw: 'camera' },
    { id: 4, name: 'Pulse 5G', cat: 'phones', price: 17999, rating: 4.2, icon: '📲', kw: 'budget battery' },
    { id: 5, name: 'Aurum Pro Headphones', cat: 'audio', price: 12999, rating: 4.7, icon: '🎧', tag: 'Best seller', kw: 'music travel' },
    { id: 6, name: 'Rift Gaming Headset', cat: 'gaming', price: 6499, old: 7999, rating: 4.4, icon: '🎮', tag: 'Deal', kw: 'headphones gaming mic' },
    { id: 7, name: 'Meridian Watch', cat: 'wearables', price: 8499, rating: 4.4, icon: '⌚', tag: 'New', kw: 'fitness gift' },
    { id: 8, name: 'Keepsake Gift Box', cat: 'gifts', price: 1999, rating: 4.8, icon: '🎁', kw: 'birthday friend present' },
    { id: 9, name: 'Orbit Earbuds', cat: 'audio', price: 3499, old: 4499, rating: 4.1, icon: '🎵', tag: 'Deal', kw: 'headphones music gift' },
    { id: 10, name: 'Vector Controller', cat: 'gaming', price: 4299, rating: 4.5, icon: '🕹', tag: 'New', kw: 'gaming gift' }];
RTS.inr = n => '₹' + n.toLocaleString('en-IN');
