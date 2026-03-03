<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
// error_reporting(0);
// ini_set('display_errors', 0);
include "db.php";
if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id"]);
    exit;
}

$userId = $_GET['user_id'];

$stmt = $conn->prepare("SELECT id, category, report_date, file_path FROM reports WHERE user_id = ? ORDER BY report_date DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$reports = [];

while ($row = $result->fetch_assoc()) {
    $reportId = $row['id'];
    
    // Fetch parameters for this report
    $paramStmt = $conn->prepare("SELECT parameter_name, parameter_value, unit, recommendation FROM report_parameters WHERE report_id = ?");
    $paramStmt->bind_param("i", $reportId);
    $paramStmt->execute();
    $paramResult = $paramStmt->get_result();
    
    $parameters = [];
    $isAbnormal = false;
    $abnormalCount = 0;
    
    while ($paramRow = $paramResult->fetch_assoc()) {
        $isParamNormal = empty($paramRow['recommendation']);
        $parameters[] = [
            'name' => (string)$paramRow['parameter_name'],
            'value' => (string)$paramRow['parameter_value'],
            'unit' => (string)$paramRow['unit'],
            'is_normal' => $isParamNormal
        ];
        
        if (!$isParamNormal) {
            $isAbnormal = true;
            $abnormalCount++;
        }
    }
    
    $reports[] = [
        'id' => (string)$row['id'],
        'category' => $row['category'] ?: "Unknown",
        'date' => $row['report_date'] ?: "",
        'is_normal' => !$isAbnormal,
        'abnormal_count' => $abnormalCount,
        'parameters' => $parameters,
        // Added for compatibility with newer app versions (HistoryScreen expects these now)
        'patient_name' => "",
        'patient_age' => null,
        'patient_gender' => "",
        'remarks' => ""
    ];
}

echo json_encode($reports);

$conn->close();
?>
