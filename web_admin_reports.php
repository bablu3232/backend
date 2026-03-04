<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

// Return user-level report summary: user_id, name, total_reports
$query = "SELECT r.user_id, u.full_name as user_name, COUNT(*) as total_reports
          FROM reports r
          LEFT JOIN users u ON r.user_id = u.id
          GROUP BY r.user_id, u.full_name
          ORDER BY total_reports DESC";

$result = $conn->query($query);
$users = array();

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            "user_id" => (int)$row['user_id'],
            "user_name" => $row['user_name'] ?? ("User #" . $row['user_id']),
            "total_reports" => (int)$row['total_reports']
        ];
    }
}

echo json_encode(["status" => "success", "users" => $users]);
?>
