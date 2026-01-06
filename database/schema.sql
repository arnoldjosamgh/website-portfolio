-- Database Schema for LuxeCurve

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments/Orders Table
-- Tracks the transaction details, user email, total quantity of items, amount paid, and balance.
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    items_summary TEXT, -- Store JSON string of items bought
    quantity_total INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00, -- In case of partial payment logic, though currently full payment is assumed
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'Success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Admin Table (Optional, or just hardcode admin in PHP as requested)
-- The user requested: "business email and password will only be the crudencials that can allow to open it"
-- We will handle admin auth in the PHP script directly or via a specific user flag.
