<?php
/**
 * Update user profile API.
 * Expects JSON: user_id, full_name, email, phone, date_of_birth (optional), gender (optional).
 * If your users table lacks date_of_birth or gender, add them:
 *   ALTER TABLE users ADD COLUMN date_of_birth DATE NULL, ADD COLUMN gender VARCHAR(50) NULL;
 */
header("Content-Type: application/json");

// Only allow POST (or PUT) for updates
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

// Required fields
$required = ['user_id', 'full_name', 'email', 'phone'];
foreach ($required as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
        http_response_code(400);
        echo json_encode(["message" => "Missing or empty required field: " . $field]);
        exit;
    }
}

$user_id = $data['user_id'];
$full_name = trim($data['full_name']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$date_of_birth = isset($data['date_of_birth']) && $data['date_of_birth'] !== '' ? trim($data['date_of_birth']) : null;
$gender = isset($data['gender']) && $data['gender'] !== '' ? trim($data['gender']) : null;

// Validate user_id is integer
if (!ctype_digit((string) $user_id) && !is_int($user_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid user_id"]);
    exit;
}
$user_id = (int) $user_id;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email format"]);
    exit;
}

// Optional: validate date_of_birth format if provided
if ($date_of_birth !== null) {
    $dt = DateTime::createFromFormat('Y-m-d', $date_of_birth);
    if (!$dt || $dt->format('Y-m-d') !== $date_of_birth) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid date_of_birth. Use Y-m-d format."]);
        exit;
    }
}

// Check user exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
$checkStmt->bind_param("i", $user_id);
$checkStmt->execute();
$res = $checkStmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["message" => "User not found"]);
    exit;
}
$checkStmt->close();

// Check email not taken by another user (allow same email for current user)
$emailStmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
$emailStmt->bind_param("si", $email, $user_id);
$emailStmt->execute();
$emailRes = $emailStmt->get_result();
if ($emailRes->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["message" => "Email already in use by another account"]);
    exit;
}
$emailStmt->close();

// Update user with prepared statement (SQL injection safe)
$stmt = $conn->prepare(
    "UPDATE users SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ? WHERE id = ?"
);
$stmt->bind_param("sssssi", $full_name, $email, $phone, $date_of_birth, $gender, $user_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Profile updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Update failed. Please try again."]);
}
$stmt->close();
$conn->close();
