<?php
session_start();
include '../api/config.php';

// Check if admin is logged in (set via api/auth.php or manual link if session persists)
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // If not logged in, redirect to main site to login
    header("Location: ../index.html");
    exit;
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: ../index.html");
    exit;
}

$payments = [];
try {
    $stmt = $pdo->query("SELECT * FROM payments ORDER BY created_at DESC");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(Exception $e) {
    $error = "DB Error: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="30"> <!-- Auto refresh every 30 seconds -->
    <title>LuxeCurve Admin</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #f8f8f8; }
        .logout { float: right; color: red; text-decoration: none; padding: 10px; border: 1px solid red; border-radius: 4px; }
    </style>
</head>
<body>

    <div class="container">
        <a href="?logout=true" class="logout">Logout</a>
        <h1>Sales Dashboard</h1>
        <p style="font-size: 0.9em; color: #666;">Updates automatically every 30 seconds.</p>
        
        <?php if(empty($payments)): ?>
            <p>No transactions recorded yet.</p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>User Email</th>
                        <th>Method</th>
                        <th>Qty</th>
                        <th>Amount</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach($payments as $p): ?>
                    <tr>
                        <td><?= htmlspecialchars($p['created_at']) ?></td>
                        <td><?= htmlspecialchars($p['user_email']) ?></td>
                        <td><?= htmlspecialchars($p['payment_method']) ?></td>
                        <td><?= htmlspecialchars($p['quantity_total']) ?></td>
                        <td>KES <?= number_format($p['amount_paid']) ?></td>
                        <td style="font-size: 0.8em; color: #666;">
                            <?php 
                                $items = json_decode($p['items_summary'], true);
                                if($items) {
                                    foreach($items as $i) {
                                        echo htmlspecialchars($i['title']) . " (x" . $i['qty'] . ")<br>";
                                    }
                                }
                            ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>
