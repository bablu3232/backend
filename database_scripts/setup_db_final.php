<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "drugssearch");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Drop explicitly
$conn->query("SET FOREIGN_KEY_CHECKS = 0");
$conn->query("DROP TABLE IF EXISTS report_parameters");
$conn->query("DROP TABLE IF EXISTS reports");
$conn->query("SET FOREIGN_KEY_CHECKS = 1");

// Create reports
$sql1 = "CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql1) === TRUE) {
    echo "Reports table created.<br>";
} else {
    die("Error creating reports: " . $conn->error);
}

// Create parameters WITHOUT FK
$sql2 = "CREATE TABLE report_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    is_normal BOOLEAN DEFAULT TRUE
)";

if ($conn->query($sql2) === TRUE) {
    echo "Parameters table created.<br>";
} else {
    die("Error creating parameters: " . $conn->error);
}

$conn->close();
?>
