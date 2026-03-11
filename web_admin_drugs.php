<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$drugs = array();
$result = $conn->query("SELECT id, drug_name, generic_name, drug_category FROM drugs ORDER BY drug_name ASC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $drugs[] = $row;
    }
}
echo json_encode(["status" => "success", "drugs" => $drugs]);
?>
