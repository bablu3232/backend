<?php
/**
 * Change password API (authenticated user).
 * Expects JSON: user_id, current_password, new_password, confirm_password.
 * Validates: user exists, current password correct, new password meets rules, confirm matches.
 */
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed. Use POST or PUT."]);
    exit;
}

include "db.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid JSON input"]);
    exit;
}

$required = ['user_id', 'current_password', 'new_password', 'confirm_password'];
foreach ($required as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
        http_response_code(400);
        echo json_encode(["message" => "Missing or empty required field: " . $field]);
        exit;
    }
}

$user_id = $data['user_id'];
$current_password = $data['current_password'];
$new_password = trim($data['new_password']);
$confirm_password = trim($data['confirm_password']);

// Validate user_id is integer
if (!ctype_digit((string) $user_id) && !is_int($user_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid user_id"]);
    exit;
}
$user_id = (int) $user_id;

if ($new_password !== $confirm_password) {
    http_response_code(400);
    echo json_encode(["message" => "New password and confirm password do not match"]);
    exit;
}

// Password rules: at least 8 chars, uppercase, lowercase, number, special character
if (strlen($new_password) < 8) {
    http_response_code(400);
    echo json_encode(["message" => "Password must be at least 8 characters"]);
    exit;
}
if (!preg_match('/[A-Z]/', $new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Password must contain at least one uppercase letter"]);
    exit;
}
if (!preg_match('/[a-z]/', $new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Password must contain at least one lowercase letter"]);
    exit;
}
if (!preg_match('/[0-9]/', $new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Password must contain at least one number"]);
    exit;
}
if (!preg_match('/[^A-Za-z0-9]/', $new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Password must contain at least one special character"]);
    exit;
}

// Get stored password for user
$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    http_response_code(404);
    echo json_encode(["message" => "User not found"]);
    exit;
}

if (!password_verify($current_password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["message" => "Current password is incorrect"]);
    exit;
}

$hash = password_hash($new_password, PASSWORD_BCRYPT);

$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$updateStmt->bind_param("si", $hash, $user_id);

if ($updateStmt->execute()) {
    echo json_encode(["message" => "Password updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Update failed. Please try again."]);
}
$updateStmt->close();
$conn->close();
