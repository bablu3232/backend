<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "user_id is required"]);
    exit;
}

$user_id = intval($_GET['user_id']);

$total = 0;
$normal = 0;
$abnormal = 0;

// Total reports for this user
$result = $conn->query("SELECT COUNT(*) as count FROM reports WHERE user_id = $user_id");
if ($result && $row = $result->fetch_assoc()) {
    $total = (int)$row['count'];
}

// Count normal vs abnormal parameter values
// A parameter with a non-null, non-empty recommendation is considered abnormal
$result = $conn->query("SELECT rp.recommendation FROM report_parameters rp INNER JOIN reports r ON rp.report_id = r.id WHERE r.user_id = $user_id");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['recommendation'])) {
            $abnormal++;
        } else {
            $normal++;
        }
    }
}

echo json_encode([
    "status" => "success",
    "total_reports" => $total,
    "normal_values" => $normal,
    "abnormal_values" => $abnormal
]);
?>
