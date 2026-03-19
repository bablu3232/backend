<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$stats = array(
    "total_users" => 0,
    "total_reports" => 0,
    "total_drugs" => 0,
    "total_parameters" => 0,
    "active_users" => 0,
    "active_users_list" => array()
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

// Get active users count and list (last 15 minutes)
$activeUsersList = array();
$result = $conn->query("SELECT id, full_name, email FROM users WHERE last_active >= NOW() - INTERVAL 15 MINUTE ORDER BY last_active DESC");
if ($result) {
    while($row = $result->fetch_assoc()) {
        $activeUsersList[] = array(
            "id" => (int)$row["id"],
            "name" => $row["full_name"],
            "email" => $row["email"]
        );
    }
    $stats["active_users"] = count($activeUsersList);
    $stats["active_users_list"] = $activeUsersList;
}

// Get time-series chart data (last 6 months)
$chartDataRaw = array();
for ($i = 5; $i >= 0; $i--) {
    $monthLabel = date('M', strtotime("-$i months"));
    $chartDataRaw[$monthLabel] = array("users" => 0, "reports" => 0);
}

// Users per month
$usersQuery = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count 
               FROM users 
               WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
               GROUP BY DATE_FORMAT(created_at, '%b')";
$usersResult = $conn->query($usersQuery);
if ($usersResult) {
    while ($row = $usersResult->fetch_assoc()) {
        $month = $row['month'];
        if (isset($chartDataRaw[$month])) {
            $chartDataRaw[$month]["users"] = (int)$row['count'];
        }
    }
}

// Reports per month
$reportsQuery = "SELECT DATE_FORMAT(uploaded_at, '%b') as month, COUNT(*) as count 
                 FROM reports 
                 WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
                 GROUP BY DATE_FORMAT(uploaded_at, '%b')";
$reportsResult = $conn->query($reportsQuery);
if ($reportsResult) {
    while ($row = $reportsResult->fetch_assoc()) {
        $month = $row['month'];
        if (isset($chartDataRaw[$month])) {
            $chartDataRaw[$month]["reports"] = (int)$row['count'];
        }
    }
}

$labels = array_keys($chartDataRaw);
$usersData = array_map(function($data) { return $data["users"]; }, array_values($chartDataRaw));
$reportsData = array_map(function($data) { return $data["reports"]; }, array_values($chartDataRaw));

$stats["chart_data"] = array(
    "labels" => $labels,
    "users" => $usersData,
    "reports" => $reportsData
);
echo json_encode(["status" => "success", "stats" => $stats]);
?>
