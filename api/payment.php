<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $email = $data['email'] ?? 'guest@example.com';
    $amount = $data['amount'] ?? 0;
    $method = $data['method'] ?? 'card';
    $items = $data['items'] ?? [];
    
    // Calculate total quantity
    $quantityTotal = 0;
    foreach ($items as $item) {
        $quantityTotal += ($item['qty'] ?? 1);
    }
    
    $itemsJson = json_encode($items);
    $balance = 0; // Fully paid

    try {
        $stmt = $pdo->prepare("INSERT INTO payments (user_email, items_summary, quantity_total, amount_paid, balance, payment_method) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$email, $itemsJson, $quantityTotal, $amount, $balance, $method]);

        echo json_encode(['success' => true, 'message' => 'Payment recorded successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'error' => 'Invalid Request']);
}
?>
