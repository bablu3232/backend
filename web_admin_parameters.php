<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$parameters = array();
$result = $conn->query("SELECT id, parameter_name, unit, min_value, max_value, category FROM lab_parameters ORDER BY parameter_name ASC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $parameters[] = $row;
    }
}
echo json_encode(["status" => "success", "parameters" => $parameters]);
?>
