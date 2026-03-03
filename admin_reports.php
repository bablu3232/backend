<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$reports = array();
$query = "SELECT r.id, r.user_id, r.file_name, r.created_at, u.full_name as user_name 
          FROM reports r 
          LEFT JOIN users u ON r.user_id = u.id 
          ORDER BY r.created_at DESC";
$result = $conn->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }
}
echo json_encode(["status" => "success", "reports" => $reports]);
?>
