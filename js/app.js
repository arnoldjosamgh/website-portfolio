/* --- Data --- */
// Generating a larger dataset for demonstration purposes
const products = [
    // WOMEN - DRESSES/SHIRTS
    { id: 1, category: 'women', subCategory: 'shirts', title: 'Silk Emerald Gown', price: 12500, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop' },
    { id: 2, category: 'women', subCategory: 'shirts', title: 'Royal Blue Cocktail', price: 8900, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1924&auto=format&fit=crop' },
    { id: 3, category: 'women', subCategory: 'shirts', title: 'Crimson Velvet Blazer', price: 9500, image: 'https://images.unsplash.com/photo-1550614000-4b9519e02a48?q=80&w=1888&auto=format&fit=crop' },
    { id: 101, category: 'women', subCategory: 'shirts', title: 'White Linen Blouse', price: 4500, image: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?q=80&w=2098&auto=format&fit=crop' },
    { id: 102, category: 'women', subCategory: 'shirts', title: 'Satin Evening Top', price: 5500, image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=1887&auto=format&fit=crop' },

    // WOMEN - SHOES
    { id: 4, category: 'women', subCategory: 'shoes', title: 'Gold Plated Heel', price: 4500, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080&auto=format&fit=crop' },
    { id: 103, category: 'women', subCategory: 'shoes', title: 'Red Stiletto', price: 6500, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080&auto=format&fit=crop' },
    { id: 104, category: 'women', subCategory: 'shoes', title: 'Nude Pump', price: 5000, image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=2080&auto=format&fit=crop' },

    // WOMEN - PANTS
    { id: 105, category: 'women', subCategory: 'pants', title: 'High Waist Trousers', price: 3500, image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=1935&auto=format&fit=crop' },
    { id: 106, category: 'women', subCategory: 'pants', title: 'Palazzo Pants', price: 4200, image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1770&auto=format&fit=crop' },

    // Fillers
    { id: 302, category: 'woman', subCategory: 'pants', title: 'Denim Jeans', price: 3500, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop' }
];
// Local Resource Mapping
// Ensure you have photos named photo_1.jpg, photo_2.jpg, etc. in resources folder
const localImages = [
    'resources/photo_1.jpg',
    'resources/photo_2.jpg',
    'resources/photo_3.jpg',
    'resources/photo_4.jpg'
];

// Update products to use local images
products.forEach((p, index) => {
    // Cycle through available local images
    p.image = localImages[index % localImages.length];
});

/* --- App Logic --- */
const app = {
    cart: [],
    authMode: 'login', // 'login' or 'signup'
    state: {
        category: 'women', // 'men' or 'women'
        subCategory: 'all', // 'all', 'shoes', 'pants', 'shirts'
        currentPage: 1,
        itemsPerPage: 12,
        isWholesale: false
    },

    init: () => {
        // Initial check or setup
        console.log('LuxeCurve App Initialized');
        // If logged in, go to home. If not, stay on login (default in HTML)
        const sessionUser = localStorage.getItem('luxe_session');
        if (sessionUser) {
            app.checkSession();
            app.navigate('home');
        } else {
            // Default to login page
            app.navigate('login');
        }
    },

    enableWholesale: () => {
        app.state.isWholesale = true;
        app.showToast('Wholesale Mode Activated! Discount applies for orders > 5 items.');

        // Navigate to shop
        app.navigate('shop-women');
    },

    enterRetail: (viewName) => {
        app.state.isWholesale = false;
        // app.showToast('Retail Mode Active'); // Optional: Feedback
        app.navigate(viewName);
    },

    navigate: (viewName) => {
        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        window.scrollTo(0, 0);

        if (viewName === 'home') {
            document.getElementById('home').classList.remove('hidden');
        } else if (viewName === 'shop-men') {
            document.getElementById('shop').classList.remove('hidden');
            app.state.category = 'men';
            app.state.currentPage = 1;
            app.state.subCategory = 'all'; // reset filter
            app.renderProducts();
            document.getElementById('shop-title').textContent = 'Gentlemen\'s Collection';
        } else if (viewName === 'shop-women') {
            document.getElementById('shop').classList.remove('hidden');
            app.state.category = 'women';
            app.state.currentPage = 1;
            app.state.subCategory = 'all'; // reset filter
            app.renderProducts();
            document.getElementById('shop-title').textContent = 'Ladies\' Collection';
        } else if (viewName === 'shop') {
            document.getElementById('shop').classList.remove('hidden');
        } else if (viewName === 'checkout') {
            if (app.cart.length === 0) {
                app.showToast('Your bag is empty!');
                return;
            }
            document.getElementById('checkout').classList.remove('hidden');
            app.renderCheckout();
        } else if (viewName === 'login') {
            document.getElementById('auth-login').classList.remove('hidden');
        } else if (viewName === 'signup') {
            document.getElementById('auth-signup').classList.remove('hidden');
        }
    },

    filterBy: (subCat) => {
        app.state.subCategory = subCat;
        app.state.currentPage = 1; // reset to page 1 on filter

        // Update UI buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        // Find the button (simple check via innerText or add IDs would be more robust, but iterating is fine for 4 items)
        const buttons = document.querySelectorAll('.filter-btn');
        // Simple logic to highlight clicked
        if (subCat === 'all') buttons[0].classList.add('active');
        if (subCat === 'shirts') buttons[1].classList.add('active');
        if (subCat === 'pants') buttons[2].classList.add('active');
        if (subCat === 'shoes') buttons[3].classList.add('active');

        app.renderProducts();
    },

    renderProducts: () => {
        const container = document.getElementById('product-grid');
        container.innerHTML = ''; // clear

        // 1. Filter
        const filtered = products.filter(p => {
            // Match Gender
            if (app.state.category === 'women' && p.category !== 'women') return false;
            if (app.state.category === 'men' && p.category !== 'men') return false;

            // Match SubCategory
            if (app.state.subCategory !== 'all' && p.subCategory !== app.state.subCategory) return false;

            return true;
        });

        // 2. Paginate
        const start = (app.state.currentPage - 1) * app.state.itemsPerPage;
        const end = start + app.state.itemsPerPage;
        const paginatedItems = filtered.slice(start, end);

        // 3. Render
        if (paginatedItems.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px;">No products found in this category.</div>';
        } else {
            paginatedItems.forEach(p => {
                const el = document.createElement('div');
                el.className = 'product-card';

                // Pricing Logic
                let priceDisplay = `KES ${p.price.toLocaleString()}`;
                if (app.state.isWholesale) {
                    const discountPrice = Math.floor(p.price * 0.95);
                    priceDisplay = `
                        <span class="old-price">KES ${p.price.toLocaleString()}</span>
                        <span class="wholesale-price">KES ${discountPrice.toLocaleString()}</span>
                    `;
                }

                el.innerHTML = `
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.title}">
                        <button class="btn btn-add-cart" onclick="app.addToCart(${p.id})">ADD TO BAG</button>
                    </div>
                    <div class="product-info">
                        <div class="product-cat">LuxeCurve ${p.category === 'men' ? 'Man' : 'Woman'} - ${p.subCategory}</div>
                        <div class="product-title">${p.title}</div>
                        <div class="product-price">${priceDisplay}</div>
                    </div>
                `;
                container.appendChild(el);
            });
        }

        app.renderPagination(filtered.length);
    },

    renderPagination: (totalItems) => {
        const container = document.getElementById('pagination');
        container.innerHTML = '';

        const totalPages = Math.ceil(totalItems / app.state.itemsPerPage);

        if (totalPages <= 1) return; // Hide if only 1 page

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === app.state.currentPage ? 'active' : ''}`;
            btn.innerText = i;
            btn.onclick = () => {
                app.state.currentPage = i;
                app.renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            container.appendChild(btn);
        }
    },

    addToCart: (id) => {
        const product = products.find(p => p.id === id);

        // Check if item exists in cart
        const existingItem = app.cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty += 1;
            app.showToast(`Updated quantity for ${product.title}`);
        } else {
            // Push copy with qty 1
            app.cart.push({ ...product, qty: 1 });
            app.showToast(`Added ${product.title} to Bag`);
        }

        app.updateCartCount();
    },

    updateCartCount: () => {
        // Sum up quantities
        const count = app.cart.reduce((sum, item) => sum + item.qty, 0);
        document.getElementById('cart-count').textContent = count;
    },

    toggleCart: () => {
        // Simple shortcut to checkout for this demo
        app.navigate('checkout');
    },

    renderCheckout: () => {
        const container = document.getElementById('checkout-items');
        container.innerHTML = '';
        let total = 0;
        let originalTotal = 0;

        // Calculate Total Qty FIRST to determine discount eligibility
        const totalQty = app.cart.reduce((sum, item) => sum + item.qty, 0);
        const applyDiscount = app.state.isWholesale && totalQty > 5;

        app.cart.forEach(item => {
            let unitPrice = item.price;
            let displayPrice = `KES ${item.price.toLocaleString()}`;

            if (applyDiscount) {
                unitPrice = Math.floor(item.price * 0.95);
                displayPrice = `<span style="font-size:0.8em; text-decoration:line-through; color:#aaa;">${item.price.toLocaleString()}</span> KES ${unitPrice.toLocaleString()}`;
            }

            const lineTotal = unitPrice * item.qty;
            total += lineTotal;
            originalTotal += (item.price * item.qty);

            const el = document.createElement('div');
            el.className = 'checkout-item';
            el.innerHTML = `
                <img src="${item.image}" alt="">
                <div class="details">
                    <h4>${item.title}</h4>
                    <div>${displayPrice}</div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="app.changeQty(${item.id}, -1)">-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="app.changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">KES ${lineTotal.toLocaleString()}</div>
                    <button onclick="app.removeFromCart(${item.id})" class="btn-text" style="color:red; margin-top:5px; font-size:0.7rem;">Remove</button>
                </div>
            `;
            container.appendChild(el);
        });

        // Wholesale Savings & Constraints
        const payBtn = document.querySelector('#payment-form button[type="submit"]');
        let note = '';

        // Always enable pay button unless cart is empty (handled elsewhere)
        payBtn.disabled = false;
        payBtn.style.opacity = '1';

        if (applyDiscount) {
            const savings = originalTotal - total;
            note = `<div style="color:#d4af37; margin-bottom:10px; font-weight:bold;">Wholesale Active! You Saved: KES ${savings.toLocaleString()}</div>`;
        } else if (app.state.isWholesale && totalQty <= 5) {
            // Optional: Remind them they missed the discount, but don't block
            note = `<div style="color:#666; margin-bottom:10px; font-size: 0.9em;">Add ${6 - totalQty} more items to unlock 5% Wholesale Discount.</div>`;
        }

        // Insert Note before Total Row or somewhere visible
        const summaryDiv = document.querySelector('.order-summary');
        // Remove old notes
        const oldNote = document.getElementById('wholesale-note');
        if (oldNote) oldNote.remove();

        if (note) {
            const noteEl = document.createElement('div');
            noteEl.id = 'wholesale-note';
            noteEl.innerHTML = note;
            // Insert before total
            const totalRow = document.querySelector('.total-row');
            summaryDiv.insertBefore(noteEl, totalRow);
        }

        document.getElementById('checkout-total').textContent = `KES ${total.toLocaleString()}`;
        document.getElementById('pay-btn-amount').textContent = `KES ${total.toLocaleString()}`;
    },

    changeQty: (id, change) => {
        const item = app.cart.find(p => p.id === id);
        if (!item) return;

        if (change === -1 && item.qty === 1) {
            // Confirm removal if decreasing from 1
            if (confirm('Remove this item from your bag?')) {
                app.removeFromCart(id);
            }
            return;
        }

        item.qty += change;
        app.updateCartCount();
        app.renderCheckout();
    },

    removeFromCart: (id) => {
        // Remove first instance found
        const idx = app.cart.findIndex(p => p.id === id);
        if (idx > -1) app.cart.splice(idx, 1);
        app.updateCartCount();
        app.renderCheckout();
    },

    // --- NEW SEPARATE AUTH HANDLERS ---

    handleLoginSubmit: async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('login-remember').checked;
        const btn = document.getElementById('login-btn');

        const originalText = btn.innerHTML; // preserve spinner if needed, but innerText is safer usually
        btn.innerText = 'Signing In...';
        btn.disabled = true;

        try {
            // Updated to JSON for Node Server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.success) {
                app.showToast(result.message);

                // User Login
                if (remember || result.user) {
                    localStorage.setItem('luxe_session', result.user ? result.user.name : email);
                    localStorage.setItem('luxe_email', email);
                }
                app.checkSession();
                app.navigate('home');

            } else {
                app.showToast(result.error || 'Login Failed');
            }

        } catch (err) {
            console.error(err);
            app.showToast('Server connection failed');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    handleSignupSubmit: async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const btn = document.getElementById('signup-btn');

        const originalText = btn.innerText;
        btn.innerText = 'Creating Account...';
        btn.disabled = true;

        try {
            // Updated to JSON for Node Server
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const result = await response.json();

            if (result.success) {
                app.showToast('Account Created! Please Login.');
                app.navigate('login');
            } else {
                app.showToast(result.error || 'Signup Failed');
            }
        } catch (err) {
            console.error(err);
            app.showToast('Server connection failed');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    // Migrating old helpers if any needed
    hashPassword: async (string) => {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    checkSession: () => {
        const sessionUser = localStorage.getItem('luxe_session');
        if (sessionUser) {
            console.log(`[Auth] Auto-logged in as ${sessionUser}`);
            app.showToast(`Welcome back, ${sessionUser}`);
        }
    },

    showToast: (msg) => {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 3000);
    },

    togglePassword: (inputId, icon) => {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
};

// Initialize
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = 'none';
    }
});
