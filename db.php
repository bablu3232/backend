<?php
error_reporting(0);
ini_set('display_errors', 0);

$conn = new mysqli("localhost", "root", "", "drugssearch");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}
?>
