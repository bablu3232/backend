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

if (!isset($input['drug_name'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "drug_name is required"]);
    exit;
}

$drug_name = $conn->real_escape_string($input['drug_name']);
$generic_name = isset($input['generic_name']) ? $conn->real_escape_string($input['generic_name']) : '';
$drug_category = isset($input['drug_category']) ? $conn->real_escape_string($input['drug_category']) : '';
$indication = isset($input['indication']) ? $conn->real_escape_string($input['indication']) : '';
$description = isset($input['description']) ? $conn->real_escape_string($input['description']) : '';
$common_dosage = isset($input['common_dosage']) ? $conn->real_escape_string($input['common_dosage']) : '';
$side_effects = isset($input['side_effects']) ? $conn->real_escape_string($input['side_effects']) : '';
$safety_warnings = isset($input['safety_warnings']) ? $conn->real_escape_string($input['safety_warnings']) : '';
$storage_details = isset($input['storage_details']) ? $conn->real_escape_string($input['storage_details']) : '';

$sql = "INSERT INTO drugs (drug_name, generic_name, drug_category, indication, description, common_dosage, side_effects, safety_warnings, storage_details) 
        VALUES ('$drug_name', '$generic_name', '$drug_category', '$indication', '$description', '$common_dosage', '$side_effects', '$safety_warnings', '$storage_details')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "message" => "Drug added successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to add drug: " . $conn->error]);
}
?>
