/* --- Imports --- */
import { supabase } from './supabase-config.js';

const ADMIN_EMAILS = ['admin@luxecurve.com', 'luxecurvefashionhouse@gmail.com'];

/* --- Data --- */
/* --- Data --- */
let products = []; // Now dynamic


/* --- App Logic --- */
const app = {
    cart: [],
    authMode: 'login', // 'login' or 'signup'
    user: null, // Firebase User Object
    state: {
        category: 'women', // 'men' or 'women'
        subCategory: 'all', // 'all', 'shoes', 'pants', 'shirts'
        currentPage: 1,
        itemsPerPage: 12,
        isWholesale: false
    },

    init: async () => {
        console.log('LuxeCurve App Initialized (Supabase Mode)');

        // Supabase Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                app.user = session.user;
                console.log('User signed in:', session.user.email);
                // Get display name from metadata if available
                const name = session.user.user_metadata.display_name || session.user.email;
                app.showToast(`Welcome back, ${name}`);
                localStorage.setItem('luxe_email', session.user.email);
                app.checkAdminUI(session.user);

                // If on login/signup page, redirect to home
                const loginSection = document.getElementById('auth-login');
                const signupSection = document.getElementById('auth-signup');
                if (loginSection && signupSection) {
                    if (!loginSection.classList.contains('hidden') || !signupSection.classList.contains('hidden')) {
                        // Only redirect if we have products loaded, else wait or go home
                        app.navigate('home');
                    }
                }
            } else {
                app.user = null;
                console.log('User signed out');
                // Optional: clear local storage tokens if needed, but supabase client handles it
                app.checkAdminUI(null);
            }
        });

        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            app.user = session.user;
            app.checkAdminUI(session.user);
        }

        // Fetch Products Initial
        await app.fetchProducts();

        // Check URL or default nav
        app.navigate('login');
    },

    fetchProducts: async () => {
        // Hardcoded products as per user request to replace placeholders
        products = [
            {
                id: 1,
                category: 'women',
                subCategory: 'pants', // Jumpsuit fits best here for existing filters
                title: 'Black Jumpsuit Cross Back',
                price: 3500,
                image: 'resources/black-cross-jumpsuit.jpg',
                description: 'Available in all sizes'
            },
            {
                id: 2,
                category: 'women',
                subCategory: 'pants', // Two-piece set
                title: 'Black Two-Piece Set',
                price: 4500,
                image: 'resources/black-two-piece.jpg',
                description: 'Available in all sizes'
            },
            {
                id: 3,
                category: 'women',
                subCategory: 'all', // Dress - effectively 'all' since no dress filter yet
                title: 'Pink Ruched Dress',
                price: 3200,
                image: 'resources/pink-ruched-dress.jpg',
                description: 'Available in all sizes'
            },
            {
                id: 4,
                category: 'women',
                subCategory: 'pants', // Two-piece
                title: 'White Two-Piece Set',
                price: 4500,
                image: 'resources/white-two-piece.jpg',
                description: 'Available in all sizes'
            },
            {
                id: 5,
                category: 'women',
                subCategory: 'pants', // Jumpsuit
                title: 'Red Jumpsuit',
                price: 3800,
                image: 'resources/red-jumpsuit.jpg',
                description: 'Available in all sizes'
            }
        ];
        console.log('Products Loaded (Hardcoded):', products.length);
    },

    enableWholesale: () => {
        app.state.isWholesale = true;
        app.showToast('Wholesale Mode Activated! Discount applies for orders > 5 items.');
        app.navigate('shop-women');
    },

    enterRetail: (viewName) => {
        app.state.isWholesale = false;
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
            const title = document.getElementById('shop-title');
            if (title) title.textContent = 'Gentlemen\'s Collection';
        } else if (viewName === 'shop-women') {
            document.getElementById('shop').classList.remove('hidden');
            app.state.category = 'women';
            app.state.currentPage = 1;
            app.state.subCategory = 'all'; // reset filter
            app.renderProducts();
            const title = document.getElementById('shop-title');
            if (title) title.textContent = 'Ladies\' Collection';
        } else if (viewName === 'shop') {
            document.getElementById('shop').classList.remove('hidden');
        } else if (viewName === 'checkout') {
            if (app.cart.length === 0) {
                app.showToast('Your bag is empty!');
                return;
            }
            if (!app.user) {
                app.showToast('Please Login to Checkout');
                app.navigate('login');
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
        const buttons = document.querySelectorAll('.filter-btn');
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
                        <button class="btn btn-add-cart" onclick="window.app.addToCart(${p.id})">ADD TO BAG</button>
                    </div>
                    <div class="product-info">
                        <div class="product-cat">LuxeCurve ${p.category === 'men' ? 'Man' : 'Woman'}</div>
                        <div class="product-title">${p.title}</div>
                        <div class="product-price">${priceDisplay}</div>
                         <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">${p.description || ''}</div>
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
        const existingItem = app.cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.qty += 1;
            app.showToast(`Updated quantity for ${product.title}`);
        } else {
            app.cart.push({ ...product, qty: 1 });
            app.showToast(`Added ${product.title} to Bag`);
        }
        app.updateCartCount();
    },

    updateCartCount: () => {
        const count = app.cart.reduce((sum, item) => sum + item.qty, 0);
        document.getElementById('cart-count').textContent = count;
    },

    toggleCart: () => {
        app.navigate('checkout');
    },

    renderCheckout: () => {
        const container = document.getElementById('checkout-items');
        container.innerHTML = '';
        let total = 0;
        let originalTotal = 0;

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
                        <button class="qty-btn" onclick="window.app.changeQty(${item.id}, -1)">-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="window.app.changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">KES ${lineTotal.toLocaleString()}</div>
                    <button onclick="window.app.removeFromCart(${item.id})" class="btn-text" style="color:red; margin-top:5px; font-size:0.7rem;">Remove</button>
                </div>
            `;
            container.appendChild(el);
        });

        // Wholesale Savings
        const payBtn = document.querySelector('#payment-form button[type="submit"]');
        let note = '';
        if (payBtn) payBtn.disabled = false;

        if (applyDiscount) {
            const savings = originalTotal - total;
            note = `<div style="color:#d4af37; margin-bottom:10px; font-weight:bold;">Wholesale Active! You Saved: KES ${savings.toLocaleString()}</div>`;
        } else if (app.state.isWholesale && totalQty <= 5) {
            note = `<div style="color:#666; margin-bottom:10px; font-size: 0.9em;">Add ${6 - totalQty} more items to unlock 5% Wholesale Discount.</div>`;
        }

        const summaryDiv = document.querySelector('.order-summary-compact');
        if (summaryDiv) {
            const oldNote = document.getElementById('wholesale-note');
            if (oldNote) oldNote.remove();

            if (note) {
                const noteEl = document.createElement('div');
                noteEl.id = 'wholesale-note';
                noteEl.innerHTML = note;
                const totalRow = document.querySelector('.total-row-luxe');
                if (totalRow) summaryDiv.insertBefore(noteEl, totalRow);
            }
        }

        const totalEl = document.getElementById('checkout-total');
        const payBtnAmt = document.getElementById('pay-btn-amount');
        if (totalEl) totalEl.textContent = `KES ${total.toLocaleString()}`;
        if (payBtnAmt) payBtnAmt.textContent = `KES ${total.toLocaleString()}`;
    },

    changeQty: (id, change) => {
        const item = app.cart.find(p => p.id === id);
        if (!item) return;

        if (change === -1 && item.qty === 1) {
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
        const idx = app.cart.findIndex(p => p.id === id);
        if (idx > -1) app.cart.splice(idx, 1);
        app.updateCartCount();
        app.renderCheckout();
    },

    // --- SUPABASE AUTH HANDLERS ---
    handleLoginSubmit: async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
        btn.disabled = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

        } catch (error) {
            console.error('Login Error:', error);
            app.showToast('Login Failed: ' + error.message);
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
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        display_name: name,
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                app.showToast('Account Created! Welcome ' + name);
            } else {
                // Should not happen for email/pass unless email confirmation is on
                app.showToast('Please check your email to confirm signup');
            }

        } catch (error) {
            console.error('Signup Error:', error);
            app.showToast('Signup Failed: ' + error.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    // Database Helper for Payments
    saveOrder: async (orderData) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([
                    { ...orderData, timestamp: new Date().toISOString() } // Supabase handles timestamp, but being explicit or relying on default
                ])
                .select();

            if (error) throw error;

            console.log("Order saved:", data);
            return true;
        } catch (e) {
            console.error("Error adding order: ", e);
            return false;
        }
    },

    checkAdminUI: (user) => {
        const btn = document.getElementById('admin-nav-btn');
        if (!btn) return;

        if (user && ADMIN_EMAILS.includes(user.email)) {
            btn.classList.remove('hidden');
        } else {
            console.log('Not an admin or not logged in, hiding button');
            btn.classList.add('hidden');
        }
    },

    showToast: (msg) => {
        const t = document.getElementById('toast');
        if (t) {
            t.innerText = msg;
            t.classList.remove('hidden');
            setTimeout(() => t.classList.add('hidden'), 3000);
        } else {
            alert(msg);
        }
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

// Expose to window for HTML onclicks
window.app = app;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
    }
});

app.init();
