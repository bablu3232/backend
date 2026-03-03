<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$otp = trim($data['otp'] ?? '');

if (!$email || !$otp) {
    echo json_encode(["message" => "Email and OTP required"]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT otp, otp_expiry FROM users WHERE email = ?"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(["message" => "User not found"]);
    exit;
}

if ($user['otp'] !== $otp) {
    echo json_encode(["message" => "Invalid OTP"]);
    exit;
}

if (strtotime($user['otp_expiry']) < time()) {
    echo json_encode(["message" => "OTP expired"]);
    exit;
}

echo json_encode(["message" => "OTP verified"]);
