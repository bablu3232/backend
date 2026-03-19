<?php
require_once 'db.php';
require_once 'OcrExtractor.php';

// Fetch the latest report
$sql = "SELECT id, file_path FROM reports ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $report_id = $row['id'];
    $file_path_rel = $row['file_path'];
    
    // Convert relative path to absolute
    $abs_path = __DIR__ . "/../../../../xampp/htdocs/drugssearch/" . $file_path_rel;
    if (!file_exists($abs_path)) {
        // Fallback for local testing in backend_repo
        $abs_path = __DIR__ . "/" . $file_path_rel;
    }

    echo "Reprocessing Latest Report $report_id: $abs_path\n";

    if (!file_exists($abs_path)) {
        echo "Error: File does not exist at $abs_path\n";
        exit;
    }

    try {
        $result_array = OcrExtractor::process_file(realpath($abs_path));
        $json_text = json_encode($result_array);
        
        if (strpos($json_text, "Hemoglobin") !== false) {
            echo "SUCCESS: Hemoglobin was successfully extracted!\n";
        }

        // Update DB!
        $stmt = $conn->prepare("UPDATE reports SET extracted_text = ? WHERE id = ?");
        $stmt->bind_param("si", $json_text, $report_id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo "Successfully updated database with the new JSON data.\n";
        } else {
            echo "Database updated, but no rows were changed (data was identical).\n";
        }
        $stmt->close();
        
    } catch (Exception $e) {
        echo "Error during OCR extraction: " . $e->getMessage() . "\n";
    }
} else {
    echo "No reports found in the database.\n";
}

$conn->close();
?>
