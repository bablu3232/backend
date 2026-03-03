<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";
require_once "otp_service.php";

$data = json_decode(file_get_contents("php://input"), true);

// 1️⃣ Validate input
if (
    !isset($data['full_name']) ||
    !isset($data['email']) ||
    !isset($data['phone']) ||
    !isset($data['password']) ||
    !isset($data['confirm_password'])
) {
    http_response_code(400);
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$fullName = trim($data['full_name']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$password = trim($data['password']);
$confirmPassword = trim($data['confirm_password']);

// 2️⃣ Password match check
if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["message" => "Passwords do not match"]);
    exit;
}

// 3️⃣ Email already exists check
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["message" => "Email already registered"]);
    exit;
}

// 4️⃣ Hash password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// 5️⃣ Insert user
$stmt = $conn->prepare(
    "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)"
);
$stmt->bind_param("ssss", $fullName, $email, $phone, $hashedPassword);

if ($stmt->execute()) {
    // Send OTP immediately after successful registration
    $otpResult = sendOtpForEmail($conn, $email);

    if ($otpResult['success']) {
        echo json_encode([
            "message" => "Account created successfully. OTP sent to email."
        ]);
    } else {
        // Account is created, but OTP failed – communicate both states clearly
        echo json_encode([
            "message" => "Account created successfully, but OTP could not be sent: " . $otpResult['message']
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Registration failed"]);
}
