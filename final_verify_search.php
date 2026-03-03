<?php
$categories = ["Diabetes", "Cardiovascular", "Pain Relief", "Antibiotics", "Vitamins & Supplements", "Allergy & Cold"];
echo "--- Category Search Verification ---\n";

foreach ($categories as $cat) {
    $url = "http://localhost/drugssearch/search_drugs.php?category=" . urlencode($cat);
    $response = file_get_contents($url);
    $data = json_encode(json_decode($response), JSON_PRETTY_PRINT);
    $count = count(json_decode($response));
    echo "Category: $cat | Results: $count\n";
}
?>
