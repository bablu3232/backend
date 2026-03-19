<?php
require_once 'db.php';
header("Content-Type: text/plain");

echo "Diagnostic Start\n";

// 1. Check tables
$tables = ['reports', 'report_parameters', 'lab_parameters'];
foreach ($tables as $table) {
    echo "\n--- Table: $table ---\n";
    $res = $conn->query("DESCRIBE $table");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']}\n";
        }
    } else {
        echo "Error describing $table: " . $conn->error . "\n";
    }
}

// 2. Check for a test user's reports
echo "\n--- Test Data Check ---\n";
$res = $conn->query("SELECT user_id, COUNT(*) as count FROM reports GROUP BY user_id");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "User ID: {$row['user_id']}, Reports: {$row['count']}\n";
    }
} else {
    echo "Error checking reports: " . $conn->error . "\n";
}

echo "\nDiagnostic End\n";
?>
