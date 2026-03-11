<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["message" => "Email and password required"]);
    exit;
}

$email = trim($data['email']);
$password = trim($data['password']);

$stmt = $conn->prepare(
    "SELECT id, full_name, password, phone, date_of_birth, gender, profile_image FROM users WHERE email = ?"
);
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid email or password"]);
    exit;
}

// Update last_active on login
$updateStmt = $conn->prepare("UPDATE users SET last_active = NOW() WHERE id = ?");
$updateStmt->bind_param("i", $user['id']);
$updateStmt->execute();
$updateStmt->close();

echo json_encode([
    "message" => "Login successful",
    "user_id" => $user['id'],
    "full_name" => $user['full_name'],
    "email" => $email,
    "phone" => $user['phone'] ?? "",
    "date_of_birth" => $user['date_of_birth'] ?? "",
    "gender" => $user['gender'] ?? "",
    "profile_image" => $user['profile_image'] ?? ""
]);
?>
