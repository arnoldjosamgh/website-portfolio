<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    if ($action === 'register') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'All fields required']);
            exit;
        }

        // Check file existence
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Email already registered']);
            exit;
        }

        // Insert
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
        if ($stmt->execute([$name, $email, $hash])) {
            echo json_encode(['success' => true, 'message' => 'Registration successful', 'user' => ['name' => $name, 'email' => $email]]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Registration failed']);
        }

    } elseif ($action === 'login') {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        // Hardcoded Admin Check
        if ($email === 'admin@luxecurve.com' && $password === 'admin123') {
            session_start();
            $_SESSION['admin_logged_in'] = true;
            echo json_encode(['success' => true, 'message' => 'Admin Login Successful', 'role' => 'admin', 'user' => ['name' => 'Administrator', 'email' => $email]]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            echo json_encode(['success' => true, 'message' => 'Login successful', 'role' => 'customer', 'user' => ['name' => $user['name'], 'email' => $user['email']]]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        }
    }

} else {
    echo json_encode(['success' => false, 'error' => 'Invalid Request Method']);
}
?>
