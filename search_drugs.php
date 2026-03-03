<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);
include "db.php";

$query = $_GET['query'] ?? '';
$category = $_GET['category'] ?? '';

if (empty($query) && empty($category)) {
    echo json_encode([]);
    exit;
}

$drugs = [];

if (!empty($category)) {
    // Specialized logic for categories
    if ($category === "Antibiotics") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ?");
        $term = "%Antibiotic%";
        $stmt->bind_param("s", $term);
    } elseif ($category === "Vitamins & Supplements") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ?");
        $term1 = "%Vitamin%";
        $term2 = "%Supplement%";
        $term3 = "%Herbal%";
        $stmt->bind_param("sss", $term1, $term2, $term3);
    } elseif ($category === "Diabetes") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ?");
        $t1 = "%Diabetes%";
        $t2 = "%Antidiabetic%";
        $t3 = "%Insulin%";
        $t4 = "%Inhibitor%"; // Catches DPP-4, SGLT2 if they are inhibitors
        $stmt->bind_param("ssss", $t1, $t2, $t3, $t4);
    } elseif ($category === "Cardiovascular") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ?");
        $t1 = "%Cardio%";
        $t2 = "%Heart%";
        $t3 = "%Statin%";
        $t4 = "%ACE%";
        $t5 = "%ARB%";
        $t6 = "%Beta Blocker%";
        $t7 = "%Blocker%";
        $stmt->bind_param("sssssss", $t1, $t2, $t3, $t4, $t5, $t6, $t7);
    } elseif ($category === "Pain Relief") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ?");
        $t1 = "%Pain%";
        $t2 = "%Analgesic%";
        $t3 = "%NSAID%";
        $stmt->bind_param("sss", $t1, $t2, $t3);
    } elseif ($category === "Allergy & Cold") {
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ? OR drug_category LIKE ? OR drug_category LIKE ?");
        $t1 = "%Allergy%";
        $t2 = "%Antihistamine%";
        $t3 = "%Cold%";
        $stmt->bind_param("sss", $t1, $t2, $t3);
    } else {
        // Default category search logic
        $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_category LIKE ?");
        $term = "%" . $category . "%";
        $stmt->bind_param("s", $term);
    }
} else {
    // General text search across all columns
    $searchTerm = "%" . $query . "%";
    $stmt = $conn->prepare("SELECT * FROM drugs WHERE drug_name LIKE ? OR generic_name LIKE ? OR drug_category LIKE ? OR indication LIKE ?");
    $stmt->bind_param("ssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $drugs[] = [
        'drug_name' => $row['drug_name'],
        'generic_name' => $row['generic_name'],
        'drug_category' => $row['drug_category'],
        'indication' => $row['indication'],
        'description' => $row['description'],
        'common_dosage' => $row['common_dosage'],
        'side_effects' => $row['side_effects'],
        'safety_warnings' => $row['safety_warnings'],
        'storage_details' => $row['storage_details']
    ];
}

echo json_encode($drugs);

$conn->close();
?>
