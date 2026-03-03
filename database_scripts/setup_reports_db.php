<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "db.php";

// Create reports table
$sqlReports = "CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sqlReports) === TRUE) {
    echo "Table 'reports' created successfully.<br>";
} else {
    echo "Error creating table 'reports': " . $conn->error . "<br>";
}

// Create report_parameters table
$sqlParams = "CREATE TABLE IF NOT EXISTS report_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    is_normal BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
)";

if ($conn->query($sqlParams) === TRUE) {
    echo "Table 'report_parameters' created successfully.<br>";
} else {
    echo "Error creating table 'report_parameters': " . $conn->error . "<br>";
}

$conn->close();
?>
