<?php
// Database Configuration
$host = 'localhost';
$db_name = 'luxecurve_db';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // If DB doesn't exist, try to connect to server and create it
    try {
        $pdo = new PDO("mysql:host=$host", $username, $password);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name`");
        $pdo->exec("USE `$db_name`");
        
        // Execute Schema
        $sql = file_get_contents('../database/schema.sql');
        $pdo->exec($sql);
        
    } catch (PDOException $e2) {
        die("Connection failed: " . $e2->getMessage());
    }
}
?>
