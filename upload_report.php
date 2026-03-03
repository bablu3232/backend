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

/* Run OCR */
$pythonPath = "C:\\Users\\Nikhil M\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
if (!file_exists($pythonPath)) {
    logDebug("Custom python path not found, falling back to 'python'");
    $pythonPath = "python";
} else {
    logDebug("Found python at $pythonPath");
}

$scriptPath = __DIR__ . DIRECTORY_SEPARATOR . 'ocr_extract.py';
if (!file_exists($scriptPath)) {
    logDebug("Error: OCR Script not found at $scriptPath");
}

$python = '"' . $pythonPath . '"';
$script = '"' . $scriptPath . '"';
$fileArg = '"' . realpath($filePath) . '"';

$command = "$python $script $fileArg 2>&1";
logDebug("Executing Command: $command");

$output = shell_exec($command);
logDebug("OCR Output: " . ($output ?? 'NULL'));

$extracted_text = $output;
if ($output !== null && stripos($output, "OCR OUTPUT:") !== false) {
    $parts = preg_split('/\s*OCR OUTPUT:\s*/i', $output, 2);
    $extracted_text = isset($parts[1]) ? trim($parts[1]) : $output;
} else {
    $extracted_text = $output === null ? '' : trim($output);
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


// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$relativePath = $uploadDir . $uniqueName;
logDebug("Relative Path: $relativePath");

if (!isset($conn)) {
    logDebug("Error: \$conn is not set!");
    exit;
}

if ($conn->ping()) {
    logDebug("DB Connection is alive.");
} else {
    logDebug("Error: DB Connection is closed: " . $conn->error);
    // Reconnect if needed, or exit
    include "db.php";
}

$sql = "INSERT INTO reports (user_id, file_name, file_path, mime_type, extracted_text) VALUES (?, ?, ?, ?, ?)";
logDebug("Preparing Statement: $sql");


try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    logDebug("Statement Prepared.");

    // Handle NULLs explicitly for binding if needed
    $b_userId = $user_id;
    $b_fileName = $originalName;
    $b_filePath = $relativePath;
    $b_mimeType = $mime_type;
    $b_extractedText = $extracted_text;

    logDebug("Binding Params...");
    if (!$stmt->bind_param("issss", $b_userId, $b_fileName, $b_filePath, $b_mimeType, $b_extractedText)) {
        throw new Exception("Bind Param Failed: " . $stmt->error);
    }
    logDebug("Params Bound.");

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    logDebug("Database Insert Success. Report ID: " . $conn->insert_id);
    
    $report_id = (int) $conn->insert_id;
    $stmt->close();
    $conn->close();

    echo json_encode([
        "status" => "success",
        "report_id" => $report_id,
        "file_name" => $originalName,
        "extracted_text" => $extracted_text
    ]);

} catch (Exception $e) {
    logDebug("DB EXCEPTION: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    exit;
}
