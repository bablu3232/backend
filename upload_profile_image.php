<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "db.php";

$upload_dir = __DIR__ . "/uploads/profiles/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (!isset($_POST['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

$userId = $_POST['user_id'];

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];
$fileName = time() . "_" . basename($file['name']);
$targetPath = $upload_dir . $fileName;

// Basic validation
$fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
$allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."]);
    exit;
}

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Determine the base URL dynamically or hardcode to localhost for emulators
    // Assuming the app uses the Retrofit base URL, we just store the relative path or full URL.
    // It's usually better to store just the filename or relative path. Let's store relative.
    $profileImagePath = "uploads/profiles/" . $fileName;
    
    // Update the database
    $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->bind_param("si", $profileImagePath, $userId);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Profile image uploaded successfully",
            "profile_image_url" => $profileImagePath
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update database: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to move uploaded file"]);
}

$conn->close();
?>
