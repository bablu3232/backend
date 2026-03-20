<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["message" => "User ID is required"]);
    exit;
}

// 1. Delete report parameters
$stmt = $conn->prepare("DELETE FROM report_parameters WHERE report_id IN (SELECT id FROM reports WHERE user_id = ?)");
$stmt->bind_param("i", $userId);
$stmt->execute();

// 2. Delete reports
$stmt = $conn->prepare("DELETE FROM reports WHERE user_id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();

// 3. Delete user
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["message" => "Account deleted successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete account: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
