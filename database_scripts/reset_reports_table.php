<?php
include "db.php";

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Drop the existing reports table
$sqlDrop = "DROP TABLE IF EXISTS reports";
if ($conn->query($sqlDrop) === TRUE) {
    echo "Table 'reports' dropped successfully.<br>";
} else {
    echo "Error dropping table: " . $conn->error . "<br>";
}

// Recreate the table using the schema from reports_table.sql
// Note: user_id is INT to match users.id in setup_db_raw.php/setup_db_final.php
$sqlCreate = "CREATE TABLE reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NULL,
    extracted_text LONGTEXT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_user_id (user_id),
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sqlCreate) === TRUE) {
    echo "Table 'reports' created successfully with correct schema.<br>";
} else {
    echo "Error creating table: " . $conn->error . "<br>";
}

$conn->close();
?>
