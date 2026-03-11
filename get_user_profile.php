<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "db.php";

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id"]);
    exit;
}

$userId = $_GET['user_id'];

$stmt = $conn->prepare(
    "SELECT id, full_name, email, phone, date_of_birth, gender, profile_image FROM users WHERE id = ?"
);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(["message" => "User not found"]);
    exit;
}

echo json_encode([
    "message" => "User profile fetched",
    "user_id" => $user['id'],
    "full_name" => $user['full_name'],
    "email" => $user['email'],
    "phone" => $user['phone'] ?? "",
    "date_of_birth" => $user['date_of_birth'] ?? "",
    "gender" => $user['gender'] ?? "",
    "profile_image" => $user['profile_image'] ?? ""

]);

$stmt->close();
$conn->close();
?>
