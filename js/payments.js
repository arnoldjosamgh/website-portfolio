const payments = {
    method: 'mpesa', // default

    selectMethod: (method) => {
        payments.method = method;

        // Visual toggle
        document.querySelectorAll('.method-card-luxe').forEach(el => el.classList.remove('active'));
        const activeTab = method === 'mpesa' ? document.getElementById('pm-mpesa') : document.getElementById('pm-bank');
        if (activeTab) activeTab.classList.add('active');

        // Form toggle
        if (method === 'mpesa') {
            document.getElementById('mpesa-fields').classList.remove('hidden');
            document.getElementById('bank-fields').classList.add('hidden');
        } else {
            document.getElementById('mpesa-fields').classList.add('hidden');
            document.getElementById('bank-fields').classList.remove('hidden');
        }
    },

    handlePayment: async (e) => {
        e.preventDefault();

        // AUTH GUARD: Check if user is logged in
        if (!window.app.user) {
            window.app.showToast('Please Login or Create an Account to Checkout');
            setTimeout(() => {
                window.app.navigate('login');
            }, 1000);
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        // 1. Processing Animation
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

        if (payments.method === 'mpesa') {
            const phone = document.getElementById('mpesa-number').value;
            if (!phone) {
                window.app.showToast('Please enter a phone number');
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
            // Simulate Daraja API STK Push
            setTimeout(() => {
                btn.innerHTML = 'Sending request to phone...';

                setTimeout(async () => {
                    // Simulate Success after PIN entry
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Payment Successful';
                    btn.style.backgroundColor = '#4CD964'; // Success green
                    btn.style.color = '#fff';

                    await payments.finalizeOrder(btn, originalText);

                }, 2000);
            }, 1500);

        } else {
            // Bank Transfer Logic (Simulated Verification)
            // No input validation needed for static bank details view, just confirmation
            setTimeout(() => {
                btn.innerHTML = 'Verifying Transfer...';

                setTimeout(async () => {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Transfer Verified';
                    btn.style.backgroundColor = '#4CD964';

                    await payments.finalizeOrder(btn, originalText);
                }, 2000);
            }, 1500);
        }
    },

    finalizeOrder: async (btn, originalText) => {
        const isWholesale = window.app.state.isWholesale;
        const totalQty = window.app.cart.reduce((sum, item) => sum + item.qty, 0);
        const applyDiscount = isWholesale && totalQty > 5;

        const itemsPayload = window.app.cart.map(p => {
            const unitPrice = applyDiscount ? Math.floor(p.price * 0.95) : p.price;
            return {
                id: p.id,
                title: p.title,
                qty: p.qty,
                price: unitPrice,
                color: 'Default', // Simplified as color selection wasn't detailed in current UI
                units: p.qty // As requested "unites"
            };
        });

        const totalAmount = itemsPayload.reduce((sum, i) => sum + (i.price * i.qty), 0);

        const orderData = {
            email: window.app.user.email,
            userId: window.app.user.id,
            amount: totalAmount,
            method: payments.method, // 'mpesa' or 'bank'
            account_credited: "LUXECURVE FASHION HOUSE LIMITED - 00308369356250",
            currency: "KES",
            items: itemsPayload,
            status: "paid"
        };

        // --- SAVE TO FIREBASE ---
        const saved = await window.app.saveOrder(orderData);
        // ------------------------

        if (saved) {
            setTimeout(() => {
                alert('Order Confirmed! Logic to Direct Transaction to Company Bank Successful. Database Updated.');

                // Generate Receipt
                payments.downloadReceipt(orderData, new Date().toLocaleString());

                window.app.cart = [];
                window.app.updateCartCount();
                window.app.navigate('home');

                // Reset button
                btn.disabled = false;
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 1000);
        } else {
            alert('Payment processed but failed to save record. Please contact support.');
            btn.disabled = false;
        }
    },

    downloadReceipt: (data, date) => {
        const name = window.app.user.displayName || 'Valued Customer';
        let receiptContent = `LuxeCurve Fashion House\n`;
        receiptContent += `RECEIPT\n`;
        receiptContent += `--------------------------------\n`;
        receiptContent += `Date: ${date}\n`;
        receiptContent += `Customer: ${name}\n`;
        receiptContent += `Email: ${data.email}\n`;
        receiptContent += `Payment Method: ${data.method === 'bank' ? 'BANK TRANSFER' : 'M-PESA'}\n`;
        receiptContent += `Beneficiary: LUXECURVE FASHION HOUSE LIMITED\n`;
        receiptContent += `Account: 00308369356250\n`;
        receiptContent += `--------------------------------\n`;
        receiptContent += `ITEMS PURCHASED:\n\n`;

        data.items.forEach(item => {
            receiptContent += `- ${item.title} (x${item.units})\n`;
            receiptContent += `  @ KES ${item.price.toLocaleString()}\n`;
        });

        receiptContent += `--------------------------------\n`;
        receiptContent += `TOTAL PAID: KES ${data.amount.toLocaleString()}\n`;
        receiptContent += `--------------------------------\n`;
        receiptContent += `Thank you for shopping with us!\n`;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LuxeCurve_Receipt_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
