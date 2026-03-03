<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$users = array();
$result = $conn->query("SELECT id, full_name, email, created_at, phone FROM users ORDER BY created_at DESC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}
echo json_encode(["status" => "success", "users" => $users]);
?>
