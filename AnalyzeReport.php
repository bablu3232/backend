<?php

/**
 * Native PHP version of analyze_report.py
 * Takes parsed JSON parameters, compares them to DB ranges, calculates deviations, and extracts recommendations.
 */
class AnalyzeReport {
    
    private static function get_db_parameters() {
        $conn = new mysqli("localhost", "root", "", "drugssearch");
        if ($conn->connect_error) { return []; }
        $res = $conn->query("SELECT * FROM lab_parameters");
        $params = [];
        while($row = $res->fetch_assoc()) {
            $params[] = $row;
        }
        $conn->close();
        return $params;
    }

    public static function analyze($input_json) {
        $data = json_decode($input_json, true);
        if (!$data) {
            return ["error" => "Invalid JSON input"];
        }

        $input_category = $data['category'] ?? "General";
        $input_parameters = $data['parameters'] ?? [];
        $patient_details = $data['patient_details'] ?? [
            "name" => "",
            "age" => "",
            "gender" => ""
        ];

        $lab_parameters = self::get_db_parameters();
        
        $param_lookup = [];
        foreach ($lab_parameters as $p) {
            $param_lookup[strtolower($p['parameter_name'])] = $p;
        }

        $detected_parameters = [];

        foreach ($input_parameters as $param) {
            $name = $param['name'] ?? null;
            $value_str = strval($param['value'] ?? "0");

            if (!$name) continue;

            $value = is_numeric($value_str) ? (float)$value_str : 0.0;
            $lower_name = strtolower($name);

            $status = "Normal";
            $condition = "";
            $recommendation = null;
            $db_param = $param_lookup[$lower_name] ?? null;

            if ($db_param) {
                $min_val = (float)$db_param['min_value'];
                $max_val = (float)$db_param['max_value'];
                
                $deviation = 0.0;
                $risk_level = "None";

                if ($value < $min_val) {
                    $status = "Low";
                    $deviation = $min_val != 0 ? (($min_val - $value) / $min_val) * 100 : 0;
                    $condition = !empty($db_param['condition_if_abnormal']) ? $db_param['condition_if_abnormal'] : "Low Level";
                } else if ($value > $max_val) {
                    $status = "High";
                    $deviation = $max_val != 0 ? (($value - $max_val) / $max_val) * 100 : 0;
                    $condition = !empty($db_param['condition_if_abnormal']) ? $db_param['condition_if_abnormal'] : "High Level";
                }

                if ($status !== "Normal") {
                    $risk_level = $deviation > 15 ? "High" : "Moderate";
                    $recommendation = [
                        "category" => $db_param['drug_category'],
                        "drugs" => $db_param['example_drugs']
                    ];
                }

                $detected_parameters[$name] = [
                    "value" => $value,
                    "unit" => $db_param['unit'],
                    "min_value" => $min_val,
                    "max_value" => $max_val,
                    "status" => $status,
                    "risk_level" => $risk_level,
                    "deviation" => round($deviation, 1),
                    "category" => !empty($db_param['category']) ? $db_param['category'] : $input_category,
                    "condition" => $condition,
                    "recommendation" => $recommendation,
                    "summary" => $db_param['summary'] ?? ""
                ];
            }
        }

        return [
            "report_category" => $input_category,
            "parameters" => $detected_parameters,
            "patient_details" => $patient_details
        ];
    }
}

// Optional CLI execution
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    $input_arg = $argv[1];
    if (file_exists($input_arg) && is_file($input_arg)) {
        $content = file_get_contents($input_arg);
        echo json_encode(AnalyzeReport::analyze($content));
    } else {
        echo json_encode(AnalyzeReport::analyze($input_arg));
    }
}
?>
