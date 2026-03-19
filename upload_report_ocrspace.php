<?php
header("Content-Type: application/json");


function logDebug($message) {
    file_put_contents(__DIR__ . '/debug_log.txt', date('[Y-m-d H:i:s] ') . $message . PHP_EOL, FILE_APPEND);
}

logDebug("--- New Upload Request ---");

if (!isset($_FILES["report"])) {
    logDebug("Error: No file uploaded");
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$user_id = isset($_POST["user_id"]) ? trim($_POST["user_id"]) : null;
logDebug("Received user_id: " . ($user_id ?? 'NULL'));

if ($user_id === null || $user_id === "" || !ctype_digit($user_id)) {
    logDebug("Error: Invalid user_id");
    echo json_encode(["status" => "error", "message" => "Valid user_id is required"]);
    exit;
}
$user_id = (int) $user_id;

include "db.php";
if ($conn->connect_error) {
    logDebug("DB Connection Failed: " . $conn->connect_error);
}

// Check user exists
$check = $conn->prepare("SELECT id FROM users WHERE id = ?");
$check->bind_param("i", $user_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    logDebug("Error: User not found for ID $user_id");
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}
$check->close();

$uploadDir = "uploads/";
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        logDebug("Error: Failed to create upload directory");
    }
}

$originalName = basename($_FILES["report"]["name"]);
$ext = pathinfo($originalName, PATHINFO_EXTENSION);
$safeName = pathinfo($originalName, PATHINFO_FILENAME);
$uniqueName = $safeName . '_' . time() . '_' . uniqid() . ($ext ? '.' . $ext : '');
$filePath = $uploadDir . $uniqueName;

logDebug("Target Path: $filePath");

if (!move_uploaded_file($_FILES["report"]["tmp_name"], $filePath)) {
    logDebug("Error: move_uploaded_file failed for " . $_FILES["report"]["tmp_name"]);
    echo json_encode(["status" => "error", "message" => "File upload failed"]);
    exit;
}
logDebug("File moved successfully.");

$mime_type = isset($_FILES["report"]["type"]) && $_FILES["report"]["type"] !== '' ? $_FILES["report"]["type"] : null;

require_once 'OcrExtractor.php';

logDebug("Starting OCR Extraction via PHP OcrExtractor...");
try {
    $result_array = OcrExtractor::process_file(realpath($filePath));
    $extracted_text = json_encode($result_array);
    logDebug("OCR Output generated successfully.");
} catch (Exception $e) {
    logDebug("Error during OCR extraction: " . $e->getMessage());
    $extracted_text = json_encode(["report_category" => "Error", "parameters" => [], "patient_details" => []]);
}

// Parse patient details safely
$patientName = null;
$patientAge = null;
$patientGender = null;

if (!empty($extracted_text)) {
    $json = json_decode($extracted_text, true);
    if ($json && isset($json['patient_details'])) {
        $patientName = $json['patient_details']['name'] ?? null;
        $patientAge = $json['patient_details']['age'] ?? null;
        $patientGender = $json['patient_details']['gender'] ?? null;
    }
}

// Return OCR result directly — report will be saved only on "Submit for Analysis"
logDebug("Returning OCR result without DB insert (deferred storage).");
$conn->close();

echo json_encode([
    "status" => "success",
    "report_id" => null,
    "file_name" => $originalName,
    "extracted_text" => $extracted_text
]);
