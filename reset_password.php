<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$new = trim($data['new_password'] ?? '');
$confirm = trim($data['confirm_password'] ?? '');

if (!$email || !$new || !$confirm) {
    echo json_encode(["message" => "All fields required"]);
    exit;
}

if ($new !== $confirm) {
    echo json_encode(["message" => "Passwords do not match"]);
    exit;
}

$hash = password_hash($new, PASSWORD_BCRYPT);

$stmt = $conn->prepare(
    "UPDATE users 
     SET password = ?, otp = NULL, otp_expiry = NULL 
     WHERE email = ?"
);
$stmt->bind_param("ss", $hash, $email);
$stmt->execute();

echo json_encode(["message" => "Password reset successful"]);
