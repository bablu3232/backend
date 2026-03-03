<?php
include "db.php";

$alterQueries = [
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255) NULL AFTER user_id",
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS patient_age VARCHAR(50) NULL AFTER patient_name",
    "ALTER TABLE reports MODIFY COLUMN patient_age VARCHAR(50) NULL", 
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS patient_gender VARCHAR(50) NULL AFTER patient_age",
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS remarks TEXT NULL AFTER extracted_text"
];

foreach ($alterQueries as $query) {
    if ($conn->query($query) === TRUE) {
        echo "Successfully executed: $query<br>";
    } else {
        echo "Error executing: $query - " . $conn->error . "<br>";
    }
}

$conn->close();
?>
