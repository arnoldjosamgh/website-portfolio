const payments = {
    method: 'mpesa', // default

    selectMethod: (method) => {
        payments.method = method;

        // Visual toggle
        document.querySelectorAll('.method-card').forEach(el => el.classList.remove('active'));
        document.getElementById(`pm-${method}`).classList.add('active');

        // Form toggle
        if (method === 'mpesa') {
            document.getElementById('mpesa-fields').classList.remove('hidden');
            document.getElementById('card-fields').classList.add('hidden');
        } else {
            document.getElementById('mpesa-fields').classList.add('hidden');
            document.getElementById('card-fields').classList.remove('hidden');
        }
    },

    handlePayment: (e) => {
        e.preventDefault();

        // AUTH GUARD: Check if user is logged in
        if (!localStorage.getItem('luxe_session')) {
            app.showToast('Please Login or Create an Account to Checkout');
            // Optional: wait a moment then redirect
            setTimeout(() => {
                app.navigate('login');
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
                app.showToast('Please enter a phone number');
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
            // Simulate Daraja API STK Push
            setTimeout(() => {
                btn.innerHTML = 'Sending request to phone...';

                setTimeout(() => {
                    alert(`STK Push sent to +254${phone}. Please enter your M-PESA PIN.`);

                    // Simulate Success after PIN entry
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Payment Successful';
                    btn.style.backgroundColor = '#4CD964'; // Success green
                    btn.style.color = '#fff';

                    setTimeout(() => {
                        alert('Order Confirmed! Thank you for shopping with LuxeCurve.');
                        app.cart = [];
                        app.updateCartCount();
                        app.navigate('home');
                        // Reset button
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 2000);

                }, 2000);
            }, 1500);

        } else {
            // Visa Simulation
            const cardInput = document.getElementById('card-fields').querySelector('input');
            const sensitiveData = cardInput.value;

            // SECURITY: Clear the input immediately from DOM and memory variables
            cardInput.value = '';

            setTimeout(() => {
                btn.innerHTML = 'Verifying Card...';

                setTimeout(() => {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Payment Approved';
                    btn.style.backgroundColor = '#4CD964';

                    // Explicitly nullify any temp variables held in closure
                    // (sensitiveData is local to the else block and will be garbage collected, 
                    // but good practice to not pass it anywhere)

                    setTimeout(() => {
                        setTimeout(() => {
                            // --- SERVER SYNC (PHP) ---
                            // Send cart items to PHP backend
                            // --- SERVER SYNC (PHP) ---
                            // Send cart items to PHP backend
                            // Recalculate amounts to ensure security/consistency (or trust client state for now)
                            const isWholesale = app.state.isWholesale;
                            const totalQty = app.cart.reduce((sum, item) => sum + item.qty, 0);
                            const applyDiscount = isWholesale && totalQty > 5;

                            const itemsPayload = app.cart.map(p => {
                                const unitPrice = applyDiscount ? Math.floor(p.price * 0.95) : p.price;
                                return {
                                    id: p.id,
                                    title: p.title,
                                    qty: p.qty,
                                    price: unitPrice
                                };
                            });

                            const totalAmount = itemsPayload.reduce((sum, i) => sum + (i.price * i.qty), 0);

                            const paymentData = {
                                email: localStorage.getItem('luxe_email'),
                                amount: totalAmount,
                                method: payments.method,
                                items: itemsPayload
                            };

                            fetch('/api/checkout', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(paymentData)
                            })
                                .then(r => r.json())
                                .then(d => {
                                    if (d.success) console.log('Payment recorded');
                                    else console.warn('Payment API Error', d);
                                })
                                .catch(e => console.warn("Server connection failed"));
                                .catch(e => console.warn("Server offline/PHP not running"));
                        // -------------------

                        alert('Order Confirmed! Thank you for shopping with LuxeCurve.');

                        // Generate Receipt
                        payments.downloadReceipt(paymentData, new Date().toLocaleString());

                        app.cart = [];
                        app.updateCartCount();
                        app.navigate('home');
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                    }, 2000);
                }, 1000);
            }, 2000);
        }, 1000);
    }
},

    downloadReceipt: (data, date) => {
        // Simple Text Receipt
        const name = localStorage.getItem('luxe_session') || 'Valued Customer';
let receiptContent = `LuxeCurve Fashion House\n`;
receiptContent += `RECEIPT\n`;
receiptContent += `--------------------------------\n`;
receiptContent += `Date: ${date}\n`;
receiptContent += `Customer: ${name}\n`;
receiptContent += `Email: ${data.email}\n`;
receiptContent += `Payment Method: ${data.method.toUpperCase()}\n`;
receiptContent += `--------------------------------\n`;
receiptContent += `ITEMS PURCHASED:\n\n`;

data.items.forEach(item => {
    receiptContent += `- ${item.title} x${item.qty}\n`;
    receiptContent += `  @ KES ${item.price.toLocaleString()}\n`;
});

receiptContent += `--------------------------------\n`;
receiptContent += `TOTAL PAID: KES ${data.amount.toLocaleString()}\n`;
receiptContent += `--------------------------------\n`;
receiptContent += `Thank you for shopping with us!\n`;

// Create Blob
const blob = new Blob([receiptContent], { type: 'text/plain' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `LuxeCurve_Receipt_${Date.now()}.txt`;
document.body.appendChild(a);
a.click();

// Clean up
window.URL.revokeObjectURL(url);
document.body.removeChild(a);
    }
};
