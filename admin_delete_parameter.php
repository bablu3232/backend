<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "id is required"]);
    exit;
}

$id = intval($input['id']);

$sql = "DELETE FROM lab_parameters WHERE id = $id";

if ($conn->query($sql)) {
    if ($conn->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Parameter deleted successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Parameter not found"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to delete: " . $conn->error]);
}
?>
