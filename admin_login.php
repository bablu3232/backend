<?php
header('Content-Type: application/json');

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['error' => 'Missing email or password']);
    exit;
}

$email = $input['email'];
$password = $input['password'];

if ($email === 'adminR1549' && $password === 'adminR1549') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Admin login successful',
        'userId' => 0,
        'fullName' => 'Administrator',
        'email' => 'adminR1549',
        'role' => 'admin'
    ]);
} else {
    // Return standard error response so Retrofit catches it correctly
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
?>
