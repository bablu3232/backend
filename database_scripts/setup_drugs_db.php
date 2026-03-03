<?php
error_reporting(E_ALL);
include "db.php";

// Create drugs table
$sql = "CREATE TABLE IF NOT EXISTS drugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    drug_category VARCHAR(255) NOT NULL,
    indication VARCHAR(255) NOT NULL,
    common_dosage TEXT NOT NULL,
    description TEXT,
    side_effects TEXT,
    safety_warnings TEXT,
    storage_details TEXT
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'drugs' created successfully.<br>";
} else {
    die("Error creating table: " . $conn->error);
}

// Initial Data
$drugs = [
    ["Metformin", "Metformin Hydrochloride", "Diabetes", "Diabetes", ["500mg", "850mg", "1000mg"]],
    ["Lisinopril", "Lisinopril", "Cardiovascular", "Hypertension", ["2.5mg", "5mg", "10mg", "20mg"]],
    ["Atorvastatin", "Atorvastatin Calcium", "Cardiovascular", "Cholesterol", ["10mg", "20mg", "40mg", "80mg"]],
    ["Amlodipine", "Amlodipine Besylate", "Cardiovascular", "Hypertension", ["2.5mg", "5mg", "10mg"]],
    ["Aspirin", "Acetylsalicylic Acid", "Pain Relief", "Pain Relief", ["81mg", "325mg", "500mg"]],
    ["Omeprazole", "Omeprazole", "Gastrointestinal", "Gastric", ["10mg", "20mg", "40mg"]],
    ["Insulin", "Human Insulin", "Diabetes", "Diabetes", ["Various doses"]],
    ["Glipizide", "Glipizide", "Diabetes", "Diabetes", ["5mg", "10mg"]],
    ["Metoprolol", "Metoprolol Tartrate", "Cardiovascular", "Hypertension", ["25mg", "50mg", "100mg"]],
    ["Ibuprofen", "Ibuprofen", "Pain Relief", "Pain Relief", ["200mg", "400mg", "600mg"]],
    ["Acetaminophen", "Paracetamol", "Pain Relief", "Pain Relief", ["325mg", "500mg", "650mg"]],
    ["Naproxen", "Naproxen Sodium", "Pain Relief", "Pain Relief", ["220mg", "500mg"]],
    ["Simvastatin", "Simvastatin", "Cardiovascular", "Cholesterol", ["10mg", "20mg", "40mg"]],
    ["Losartan", "Losartan Potassium", "Cardiovascular", "Hypertension", ["25mg", "50mg", "100mg"]],
    ["Gabapentin", "Gabapentin", "Neurology", "Neurology", ["100mg", "300mg", "400mg"]],
    ["Amoxicillin", "Amoxicillin", "Antibiotics", "Antibiotics", ["250mg", "500mg"]],
    ["Azithromycin", "Azithromycin", "Antibiotics", "Antibiotics", ["250mg", "500mg"]],
    ["Ciprofloxacin", "Ciprofloxacin", "Antibiotics", "Antibiotics", ["250mg", "500mg", "750mg"]],
    ["Prednisone", "Prednisone", "Pain Relief", "Anti-inflammatory", ["5mg", "10mg", "20mg"]],
    ["Cetirizine", "Cetirizine Hydrochloride", "Allergy & Cold", "Allergy", ["5mg", "10mg"]],
    ["Loratadine", "Loratadine", "Allergy & Cold", "Allergy", ["10mg"]],
    ["Vitamin D", "Cholecalciferol", "Vitamins & Supplements", "Supplements", ["1000 IU", "2000 IU", "5000 IU"]],
    ["Vitamin B12", "Cyanocobalamin", "Vitamins & Supplements", "Supplements", ["500mcg", "1000mcg"]],
    ["Paracetamol", "Paracetamol", "Pain Relief", "Pain Relief/Fever", ["500mg", "650mg"]],
    ["Dolo 650", "Paracetamol", "Pain Relief", "Pain Relief/Fever", ["650mg"]],
    ["Crocin", "Paracetamol", "Pain Relief", "Pain Relief/Fever", ["500mg", "650mg"]],
    ["Pantoprazole", "Pantoprazole Sodium", "Gastrointestinal", "Gastric/Acidity", ["40mg"]],
    ["Pan 40", "Pantoprazole", "Gastrointestinal", "Gastric/Acidity", ["40mg"]],
    ["Domperidone", "Domperidone", "Gastrointestinal", "Nausea/Vomiting", ["10mg", "30mg"]],
    ["Ondansetron", "Ondansetron", "Gastrointestinal", "Nausea/Vomiting", ["4mg", "8mg"]],
    ["Montelukast", "Montelukast Sodium", "Allergy & Cold", "Allergy/Asthma", ["5mg", "10mg"]],
    ["Levocetirizine", "Levocetirizine Dihydrochloride", "Allergy & Cold", "Allergy", ["5mg"]],
    ["Telmisartan", "Telmisartan", "Cardiovascular", "Hypertension", ["20mg", "40mg", "80mg"]],
    ["Metogyl", "Metronidazole", "Antibiotics", "Antibiotics/Infection", ["200mg", "400mg"]]
];

$stmt = $conn->prepare("INSERT INTO drugs (drug_name, generic_name, drug_category, indication, common_dosage, description, side_effects, safety_warnings, storage_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

$desc = "Consult your healthcare provider.";
$side = "Follow your healthcare provider's instructions.";
$warn = "Consult your healthcare provider.";
$store = "Consult your healthcare provider.";

foreach ($drugs as $drug) {
    $name = $drug[0];
    $generic = $drug[1];
    $cat = $drug[2];
    $ind = $drug[3];
    $dose = json_encode($drug[4]);
    
    // Check if exists to avoid duplicates on refresh
    $check = $conn->query("SELECT id FROM drugs WHERE drug_name = '$name'");
    if ($check->num_rows == 0) {
        $stmt->bind_param("sssssssss", $name, $generic, $cat, $ind, $dose, $desc, $side, $warn, $store);
        $stmt->execute();
        echo "Inserted $name<br>";
    } else {
        echo "Skipped $name (already exists)<br>";
    }
}

echo "Drugs data population complete.";
$conn->close();
?>
