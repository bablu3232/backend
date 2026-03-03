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

if (!isset($input['parameter_name']) || !isset($input['unit'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "parameter_name and unit are required"]);
    exit;
}

$name = $conn->real_escape_string($input['parameter_name']);
$unit = $conn->real_escape_string($input['unit']);
$min_value = isset($input['min_value']) ? floatval($input['min_value']) : 0;
$max_value = isset($input['max_value']) ? floatval($input['max_value']) : 0;
$category = isset($input['category']) ? $conn->real_escape_string($input['category']) : '';
$condition_if_abnormal = isset($input['condition_if_abnormal']) ? $conn->real_escape_string($input['condition_if_abnormal']) : '';
$drug_category = isset($input['drug_category']) ? $conn->real_escape_string($input['drug_category']) : '';
$example_drugs = isset($input['example_drugs']) ? $conn->real_escape_string($input['example_drugs']) : '';

$sql = "INSERT INTO lab_parameters (parameter_name, min_value, max_value, unit, category, condition_if_abnormal, drug_category, example_drugs) 
        VALUES ('$name', $min_value, $max_value, '$unit', '$category', '$condition_if_abnormal', '$drug_category', '$example_drugs')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "message" => "Lab parameter added successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to add parameter: " . $conn->error]);
}
?>
