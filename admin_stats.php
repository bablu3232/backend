<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$stats = array(
    "total_users" => 0,
    "total_reports" => 0,
    "total_drugs" => 0,
    "total_parameters" => 0
);

// Get users count
$result = $conn->query("SELECT COUNT(*) as count FROM users");
if ($row = $result->fetch_assoc()) {
    $stats["total_users"] = (int)$row["count"];
}

// Get reports count
$result = $conn->query("SELECT COUNT(*) as count FROM reports");
if ($row = $result->fetch_assoc()) {
    $stats["total_reports"] = (int)$row["count"];
}

// Get drugs count
$result = $conn->query("SELECT COUNT(*) as count FROM drugs");
if ($row = $result->fetch_assoc()) {
    $stats["total_drugs"] = (int)$row["count"];
}

// Get lab parameters count
$result = $conn->query("SELECT COUNT(*) as count FROM lab_parameters");
if ($row = $result->fetch_assoc()) {
    $stats["total_parameters"] = (int)$row["count"];
}

echo json_encode(["status" => "success", "stats" => $stats]);
?>
