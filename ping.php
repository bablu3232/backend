<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id)) {
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit();
}

$userId = (int)$data->user_id;

$stmt = $conn->prepare("UPDATE users SET last_active = NOW() WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Activity tracked"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to track activity"]);
}

$stmt->close();
$conn->close();
?>
