<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

// Log raw input for debugging
$rawInput = file_get_contents("php://input");
function logDebug($message) {
    file_put_contents(__DIR__ . '/debug_log.txt', date('[Y-m-d H:i:s] ') . $message . PHP_EOL, FILE_APPEND);
}
logDebug("Save Report Request: " . $rawInput);

$data = json_decode($rawInput, true);

if (!isset($data['user_id']) || !isset($data['category']) || !isset($data['parameters'])) {
    logDebug("Error: Missing required fields");
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields"]);
    exit;
}

$userId = $data['user_id'];
$category = $data['category'];
$parameters = $data['parameters'];
$reportDate = date('Y-m-d'); // Current date

$reportId = $data['report_id'] ?? null;
$patientName = $data['patient_name'] ?? null;
$patientAge = $data['patient_age'] ?? null;
$patientGender = $data['patient_gender'] ?? null;
$remarks = $data['remarks'] ?? null;

if ($reportId) {
    // Update existing report
    $stmt = $conn->prepare("UPDATE reports SET category = ?, report_date = ?, patient_name = ?, patient_age = ?, patient_gender = ?, remarks = ? WHERE id = ?");
    if (!$stmt) {
        logDebug("Prepare Failed (Update): " . $conn->error);
        http_response_code(500);
        echo json_encode(["message" => "Database error"]);
        exit;
    }
    $stmt->bind_param("ssssssi", $category, $reportDate, $patientName, $patientAge, $patientGender, $remarks, $reportId);
    $success = $stmt->execute();
    if (!$success) {
        logDebug("Update Failed: " . $stmt->error);
    }
} else {
    // Insert new report
    $stmt = $conn->prepare("INSERT INTO reports (user_id, category, report_date, patient_name, patient_age, patient_gender, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $userId, $category, $reportDate, $patientName, $patientAge, $patientGender, $remarks);
    $success = $stmt->execute();
    if ($success) {
        $reportId = $stmt->insert_id;
    } else {
        logDebug("Insert Failed: " . $stmt->error);
    }
}

if ($success) {
    // Run Analysis Script FIRST to get recommendations
    // Prepare JSON input for the python script
    $analysisInput = json_encode([
        "category" => $category,
        "parameters" => $parameters
    ]);
    
    // Create a temporary file to store the JSON input
    $tempFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'analysis_input_' . uniqid() . '.json';
    file_put_contents($tempFile, $analysisInput);
    
    // Execute Python script with file path
    // Use absolute path for python executable
    $pythonPath = "C:\\Users\\Nikhil M\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";
    $scriptPath = __DIR__ . "\\analyze_report.py";
    
    // Create command - pass the temp file path
    $command = "\"$pythonPath\" \"$scriptPath\" \"$tempFile\" 2>&1";
    $analysisOutput = shell_exec($command);
    
    // Clean up temp file
    if (file_exists($tempFile)) {
        unlink($tempFile);
    }
    
    // Parse analysis output
    $analysisResult = json_decode($analysisOutput, true);
    
    // Delete existing parameters if updating
    if ($reportId) {
        $delStmt = $conn->prepare("DELETE FROM report_parameters WHERE report_id = ?");
        $delStmt->bind_param("i", $reportId);
        $delStmt->execute();
    }

    // Insert parameters from ANALYSIS RESULT
    // This ensures we save the exact data the python script processed + recommendations
    $paramStmt = $conn->prepare("INSERT INTO report_parameters (report_id, parameter_name, parameter_value, unit, recommendation) VALUES (?, ?, ?, ?, ?)");
    
    if (isset($analysisResult['parameters'])) {
        foreach ($analysisResult['parameters'] as $name => $details) {
            $value = (string)$details['value']; // Ensure string for DB
            $unit = $details['unit'] ?? '';
            
            // Format recommendation string
            $recString = null;
            if (!empty($details['recommendation']) && isset($details['recommendation']['drugs'])) {
                $recCat = $details['recommendation']['category'] ?? 'General';
                $drugs = $details['recommendation']['drugs'];
                $recString = "Category: $recCat. Drugs: $drugs";
            }
            
            $paramStmt->bind_param("issss", $reportId, $name, $value, $unit, $recString);
            $paramStmt->execute();
        }
    } else {
        // Fallback: If analysis failed, save raw input parameters
        // Note: No recommendations in this case
        foreach ($parameters as $param) {
            $name = $param['name'];
            $value = $param['value'];
            $unit = $param['unit'] ?? '';
            $recString = null;
            
            $paramStmt->bind_param("issss", $reportId, $name, $value, $unit, $recString);
            $paramStmt->execute();
        }
    }

    echo json_encode([
        "message" => "Report saved successfully",
        "report_id" => $reportId,
        "analysis" => $analysisResult // Include analysis in response
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to save report: " . $conn->error]);
}

$conn->close();
?>
