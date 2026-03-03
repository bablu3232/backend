<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";
require_once "otp_service.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'])) {
    echo json_encode(["message" => "Email required"]);
    exit;
}

$email = trim($data['email']);

$result = sendOtpForEmail($conn, $email);

if ($result['success']) {
    echo json_encode(["message" => $result['message']]);
} else {
    echo json_encode(["message" => $result['message']]);
}
