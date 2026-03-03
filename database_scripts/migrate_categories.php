<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "db.php";

echo "<h2>Migrating Drugs Database...</h2>";

// 1. Add missing columns and rename others
$columns_to_add = [
    'drug_name' => "ALTER TABLE drugs CHANGE COLUMN name drug_name VARCHAR(255) NOT NULL",
    'generic_name' => "ALTER TABLE drugs ADD COLUMN generic_name VARCHAR(255) AFTER drug_name",
    'drug_category' => "ALTER TABLE drugs ADD COLUMN drug_category VARCHAR(255) AFTER generic_name",
    'indication' => "ALTER TABLE drugs CHANGE COLUMN `condition` indication VARCHAR(255) NOT NULL",
    'common_dosage' => "ALTER TABLE drugs CHANGE COLUMN dosages common_dosage TEXT NOT NULL",
    'safety_warnings' => "ALTER TABLE drugs CHANGE COLUMN warnings safety_warnings TEXT",
    'storage_details' => "ALTER TABLE drugs CHANGE COLUMN storage storage_details TEXT"
];

foreach ($columns_to_add as $col => $sql) {
    $check = $conn->query("SHOW COLUMNS FROM drugs LIKE '$col'");
    if ($check->num_rows == 0) {
        // Try renaming first if it's a rename operation
        if (strpos($sql, 'CHANGE COLUMN') !== false) {
             $old_col = explode(' ', $sql)[4]; // Rough extraction of old column name
             $check_old = $conn->query("SHOW COLUMNS FROM drugs LIKE '$old_col'");
             if ($check_old->num_rows > 0) {
                if ($conn->query($sql)) echo "Renamed $old_col to $col successfully.<br>";
             } else {
                // If old column doesn't exist, just add the new one
                $add_sql = str_replace("CHANGE COLUMN $old_col ", "ADD COLUMN ", $sql);
                if ($conn->query($add_sql)) echo "Added $col successfully.<br>";
             }
        } else {
            if ($conn->query($sql)) echo "Added $col successfully.<br>";
        }
    }
}

// 2. Define mapping from indication to UI categories
$mapping = [
    'Diabetes' => 'Diabetes',
    'Hypertension' => 'Cardiovascular',
    'Cholesterol' => 'Cardiovascular',
    'Cardiovascular' => 'Cardiovascular',
    'Pain Relief' => 'Pain Relief',
    'Pain Relief/Fever' => 'Pain Relief',
    'Anti-inflammatory' => 'Pain Relief',
    'Gastric' => 'Gastrointestinal',
    'Gastric/Acidity' => 'Gastrointestinal',
    'Gastrointestinal' => 'Gastrointestinal',
    'Nausea/Vomiting' => 'Gastrointestinal',
    'Neurology' => 'Neurology',
    'Antibiotics' => 'Antibiotics',
    'Antibiotics/Infection' => 'Antibiotics',
    'Infection' => 'Antibiotics',
    'Allergy' => 'Allergy & Cold',
    'Allergy & Cold' => 'Allergy & Cold',
    'Allergy/Asthma' => 'Allergy & Cold',
    'Supplements' => 'Vitamins & Supplements',
    'Vitamins & Supplements' => 'Vitamins & Supplements'
];

foreach ($mapping as $indication => $category) {
    $stmt = $conn->prepare("UPDATE drugs SET drug_category = ? WHERE indication = ?");
    $stmt->bind_param("ss", $category, $indication);
    if ($stmt->execute()) {
        echo "Updated drugs with indication '$indication' to category '$category'.<br>";
    }
}

// 3. Set default for others
$conn->query("UPDATE drugs SET drug_category = 'Other' WHERE drug_category IS NULL OR drug_category = ''");

echo "<h3>Migration Complete!</h3>";
$conn->close();
?>
