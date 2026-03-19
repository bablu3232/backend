<?php

/**
 * OcrExtractor
 * Native PHP replacement for ocrspace_extract.py.
 * Communicates with OCR.Space API, parses patient details, and analyzes lab parameters.
 */
class OcrExtractor {
    
    // Set your OCRSpace API key here or load from env
    private static $apiKey = "helloworld"; 
    
    // Parameter Aliases mapped to DB Canonical names
    private static $parameter_aliases = [
        "blood sugar" => "Glucose",
        "fbs" => "Glucose",
        "blood glucose" => "Glucose",
        "glucose" => "Glucose",
        "cholesterol" => "Total Cholesterol",
        "total cholesterol" => "Total Cholesterol",
        "hdl cholesterol" => "HDL Cholesterol",
        "hdl" => "HDL Cholesterol",
        "ldl cholesterol" => "LDL Cholesterol",
        "ldl" => "LDL Cholesterol",
        "vldl cholesterol" => "VLDL Cholesterol",
        "vldl" => "VLDL Cholesterol",
        "triglycerides" => "Triglycerides",
        "lipoprotein(a)" => "Lipoprotein(a)",
        "lp(a)" => "Lipoprotein(a)",
        "lipoprotein (a)" => "Lipoprotein(a)",
        "serum creatinine" => "Creatinine",
        "creatinine" => "Creatinine",
        "t-chol/hdl ratio" => "T-Chol/HDL Ratio",
        "ldl/hdl ratio" => "LDL/HDL Ratio",
        "blood urea nitrogen" => "BUN",
        "bun" => "BUN",
        "blood urea" => "Blood Urea",
        "urea" => "Blood Urea",
        "serum uric acid" => "Uric Acid",
        "uric acid" => "Uric Acid",
        "rheumatoid factor" => "RA Factor",
        "ra factor" => "RA Factor",
        "ra" => "RA Factor",
        "neu%" => "NEU%",
        "neu" => "NEU%",
        "ne%" => "NEU%",
        "neutrophils" => "NEU%",
        "lym%" => "LYM%",
        "ly%" => "LYM%",
        "lym" => "LYM%",
        "lymphocytes" => "LYM%",
        "mon%" => "MON%",
        "mo%" => "MON%",
        "mon" => "MON%",
        "monocytes" => "MON%",
        "eos%" => "EOS%",
        "eo%" => "EOS%",
        "eos" => "EOS%",
        "eosinophils" => "EOS%",
        "bas%" => "BAS%",
        "ba%" => "BAS%",
        "bas" => "BAS%",
        "basophils" => "BAS%",
        "lym#" => "LYM#",
        "ly#" => "LYM#",
        "gra#" => "GRA#",
        "gr#" => "GRA#",
        "neu#" => "Absolute Neutrophils",
        "ne#" => "Absolute Neutrophils",
        "neu abs" => "Absolute Neutrophils",
        "tlc" => "Total Count",
        "total count" => "Total Count",
        "total leucocyte count" => "Total Count",
        "absolute neutrophils" => "Absolute Neutrophils",
        "absolute lymphocytes" => "Absolute Lymphocytes",
        "absolute eosinophils" => "Absolute Eosinophils",
        "absolute monocytes" => "Absolute Monocytes",
        "absolute basophils" => "Absolute Basophils",
        "pct" => "PCT",
        "pdw" => "PDW",
        "wbc" => "WBC",
        "rbc" => "RBC",
        "hct" => "Hematocrit",
        "pcv" => "Hematocrit",
        "plt" => "PLT",
        "platelets" => "PLT",
        "rdw-cv" => "RDW-CV",
        "rdwc" => "RDW-CV",
        "rdw-sd" => "RDW-SD",
        "rdws" => "RDW-SD",
        "mcv" => "MCV",
        "mch" => "MCH",
        "mchc" => "MCHC",
        "esr" => "ESR",
        "hemoglobin" => "Hemoglobin",
        "hb" => "Hemoglobin",
        "hgb" => "Hemoglobin",
        "sgpt" => "ALT (SGPT)",
        "alt" => "ALT (SGPT)",
        "sgot" => "AST (SGOT)",
        "ast" => "AST (SGOT)",
        "alp" => "Alkaline Phosphatase (ALP)",
        "bilirubin total" => "Total Bilirubin",
        "bilirubin direct" => "Direct Bilirubin",
        "bilirubin indirect" => "Indirect Bilirubin",
        "total protein" => "Total Protein",
        "serum albumin" => "Serum Albumin",
        "albumin" => "Serum Albumin",
        "globulin" => "Globulin",
        "a/g ratio" => "A/G Ratio",
        "sodium" => "Sodium",
        "potassium" => "Potassium",
        "calcium" => "Calcium",
        "chloride" => "Chloride",
        "egfr" => "eGFR",
    ];

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

    private static function normalize_param_name($name) {
        $n = trim($name);
        $n = preg_replace('/^(?:Sr\.\s*|Sr\s+|Serum\s+)/i', '', $n);
        $n = preg_replace('/(?<=[A-Za-z])\s*-\s*(?=[A-Za-z])/', ' ', $n);
        $n = preg_replace('/\s+/', ' ', $n);
        return trim($n);
    }

    private static function resolve_alias($name) {
        $raw = strtolower(trim($name));
        if (isset(self::$parameter_aliases[$raw])) return self::$parameter_aliases[$raw];

        $normalized = strtolower(self::normalize_param_name($name));
        if (isset(self::$parameter_aliases[$normalized])) return self::$parameter_aliases[$normalized];

        $cleansed = preg_replace('/[^a-z0-9]/', '', $raw);
        if (empty($cleansed)) return self::normalize_param_name($name);

        if (isset(self::$parameter_aliases[$cleansed])) return self::$parameter_aliases[$cleansed];

        foreach (self::$parameter_aliases as $alias_key => $canonical) {
            if (strlen($alias_key) >= 3) {
                $cleansed_alias = preg_replace('/[^a-z0-9]/', '', $alias_key);
                if (!empty($cleansed_alias) && strpos($cleansed, $cleansed_alias) !== false) {
                    return $canonical;
                }
            }
        }
        return self::normalize_param_name($name);
    }

    private static function extract_text_with_ocrspace($file_path) {
        if (!file_exists($file_path)) {
            die(json_encode(["error" => "File not found: " . $file_path]));
        }

        $cfile = new CURLFile($file_path);
        
        $postData = [
            'apikey' => self::$apiKey,
            'isOverlayRequired' => 'false',
            'isTable' => 'true',
            'OCREngine' => '2',
            'file' => $cfile
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.ocr.space/parse/image');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        $result = curl_exec($ch);
        curl_close($ch);

        $json = json_decode($result, true);
        if (!$json || isset($json['IsErroredOnProcessing']) && $json['IsErroredOnProcessing']) {
            $err = isset($json['ErrorMessage']) ? json_encode($json['ErrorMessage']) : "Unknown OCR Error";
            echo "OCR OUTPUT:\n";
            echo json_encode(["error" => "OCRSpace Error: " . $err]);
            exit(1);
        }

        $full_text = "";
        if (isset($json['ParsedResults']) && is_array($json['ParsedResults'])) {
            foreach ($json['ParsedResults'] as $page) {
                $text = isset($page['ParsedText']) ? $page['ParsedText'] : '';
                $text = str_replace("\t", "  ", $text);
                $full_text .= $text . "\n";
            }
        }
        return $full_text;
    }

    private static function normalize_ocr_text($text) {
        $replacements = [
            "\u{2013}" => "-", "\u{2014}" => "-", "\u{2212}" => "-", "\u{2010}" => "-",
            "|" => " ", "{" => "", "}" => ""
        ];
        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }

    private static function extract_age_digits($raw_age) {
        $ocr_digit_map = ['A'=>'4', 'O'=>'0', 'I'=>'1', 'S'=>'5', 'B'=>'8', 'G'=>'6', 'Z'=>'2', 'T'=>'7'];
        $result = '';
        foreach (str_split($raw_age) as $ch) {
            if (is_numeric($ch)) {
                $result .= $ch;
            } else if (isset($ocr_digit_map[strtoupper($ch)])) {
                $result .= $ocr_digit_map[strtoupper($ch)];
            }
        }
        return !empty($result) ? $result : $raw_age;
    }

    public static function process_file($file_path) {
        
        // Load API KEY from environment
        $env_file = dirname(__DIR__) . '/.env';
        if (file_exists($env_file)) {
            $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                list($name, $value) = explode('=', $line, 2);
                if (trim($name) === 'OCRSPACE_API_KEY') {
                    self::$apiKey = trim($value);
                }
            }
        }

        $raw_text = self::extract_text_with_ocrspace($file_path);
        $raw_text = self::normalize_ocr_text($raw_text);

        $patient_details = [
            "name" => "",
            "age" => "",
            "gender" => ""
        ];

        // Name Extraction
        if (preg_match('/(?:Pt\.?\s*N(?:ame|ae)|Patient\s*Name|Name)\s*[:;\->?]?\s+(.+)/i', $raw_text, $matches)) {
            $raw_name = trim($matches[1]);
            $parts = preg_split('/[\t\n]/', $raw_name);
            $raw_name = trim($parts[0]);
            $raw_name = preg_replace('/\s+[\dA-Z]{1,3}\s*\/\s*(?:F\w*|M\w*)\s*$/i', '', $raw_name);
            $raw_name = preg_replace('/\s+(?:age|ref|sex|gender|dob|date|sid)\b.*$/i', '', $raw_name);
            $raw_name = preg_replace('/\s+\d{2}[/\-]\d{2}[/\-]\d{2,4}.*$/', '', $raw_name);
            $patient_details["name"] = trim($raw_name);
        }

        // Age/Gender Extraction
        $GENDER_PATTERN = '(?:Male|Female|Fomale|Fomaln|Famale|Femal|M|F)';
        
        if (preg_match('/(?:Age|age)\s*[\/\\\\&]?\s*(?:Sex|So[x%]|Gender)?\s*[:;\->+?]?\s*[+]?(\d[\dA-Za-z]*)\s*[\/\s,]*\s*(' . $GENDER_PATTERN . ')\b/i', $raw_text, $m)) {
            $patient_details["age"] = self::extract_age_digits(trim($m[1]));
            $g = strtolower(trim($m[2]));
            $patient_details["gender"] = (strpos($g, 'm') === 0 && strpos($g, 'f') === false) ? "Male" : "Female";
        } else if (preg_match('/(\d[\dA-Za-z]*)\s*[\/\s]+\s*(' . $GENDER_PATTERN . ')\b/i', $raw_text, $m)) {
            $patient_details["age"] = self::extract_age_digits(trim($m[1]));
            $g = strtolower(trim($m[2]));
            $patient_details["gender"] = (strpos($g, 'm') === 0 && strpos($g, 'f') === false) ? "Male" : "Female";
        } else {
            if (preg_match('/(?:Age|Yrs|Years)\s*[:;\-]\s*(\d+)/i', $raw_text, $m)) {
                $patient_details["age"] = trim($m[1]);
            }
            if (preg_match('/(?:Gender|Sex)\s*[:;\-]\s*(Male|Female|M|F)\b/i', $raw_text, $m)) {
                $g = strtolower(trim($m[1]));
                $patient_details["gender"] = (strpos($g, 'm') === 0 && strpos($g, 'f') === false) ? "Male" : "Female";
            }
        }

        $lab_parameters = self::get_db_parameters();
        $detected_parameters = [];
        $category_scores = [];
        $found_param_names = [];
        $param_lookup = [];
        
        foreach ($lab_parameters as $param) {
            if (!empty($param['category'])) {
                if (!isset($category_scores[$param['category']])) $category_scores[$param['category']] = 0;
            }
            $param_lookup[strtolower($param['parameter_name'])] = $param;
        }

        $try_add_parameter = function($canonical_name, $value, $db_param) use (&$found_param_names, &$detected_parameters, &$category_scores) {
            $lower_name = strtolower($canonical_name);
            if (isset($found_param_names[$lower_name])) return;
            if (!is_numeric($value)) return;
            $val = (float)$value;

            $min_val = (float)$db_param['min_value'];
            $max_val = (float)$db_param['max_value'];

            if ($val < 1000 && $min_val >= 1000) $val *= 1000;
            else if ($val >= 1000 && $max_val <= 100) $val /= 1000;

            $status = "Normal";
            $risk_level = "None";
            $deviation = 0.0;
            $condition = "";
            $recommendation = new stdClass();

            if ($val < $min_val) {
                $status = "Low";
                $deviation = $min_val != 0 ? (($min_val - $val) / $min_val) * 100 : 0;
                $condition = !empty($db_param['condition_if_abnormal']) ? $db_param['condition_if_abnormal'] : "Low Level";
            } else if ($val > $max_val) {
                $status = "High";
                $deviation = $max_val != 0 ? (($val - $max_val) / $max_val) * 100 : 0;
                $condition = !empty($db_param['condition_if_abnormal']) ? $db_param['condition_if_abnormal'] : "High Level";
            }

            if ($status != "Normal") {
                $risk_level = $deviation > 15 ? "High" : "Moderate";
                $recommendation = [
                    "category" => $db_param['drug_category'],
                    "drugs" => $db_param['example_drugs']
                ];
            }

            $detected_parameters[$canonical_name] = [
                "value" => $val,
                "unit" => $db_param['unit'],
                "min_value" => $min_val,
                "max_value" => $max_val,
                "status" => $status,
                "risk_level" => $risk_level,
                "deviation" => round($deviation, 1),
                "category" => $db_param['category'],
                "condition" => $condition,
                "recommendation" => $recommendation,
                "summary" => isset($db_param['summary']) ? $db_param['summary'] : ""
            ];
            $found_param_names[$lower_name] = true;
            if (!empty($db_param['category'])) {
                $category_scores[$db_param['category']]++;
            }
        };

        $lines = explode("\n", $raw_text);
        
        $SKIP_REGEX = '/(?:^(?:TEST|INVESTIGATION|PARAMETER|TES\?|RESULT|VALUE)\b|' .
            '(?:REFERENCE\s+(?:VALUE|RANGE|VALOR))|' .
            '(?:Test\s*Descript)|' .
            '(?:Pt\.?\s*N(?:ame|ae)|Patient\s*Name|PID|UHID|Reg\.?\s*No|Registered\s*on)\s*[:\-]?|' .
            '(?:Age|Gender|Sex|Date|Generated\s*on)\s*[:\-]?|' .
            '(?:Ref\s*\.?\s*(?:No|by))|' .
            '(?:Sample|Collected|Reported|Received|SID|STD|Visit|Specimen|Doctor|Name)\s*[:\-\s]|' .
            '(?:BIO\s*CHEMISTRY|LIPID\s*PROFILE|HAEMATOLOGY|BLOOD\s*COUNT|CBC|RA\s*Factor\s*:)\s*:?\s*$|' .
            '(?:End\s+of\s+R(?:eport|uport)|Signature|Doctor|Patholog|Consultant|Timing|Week\s*Days|Sunday|Undertaken)|' .
            '(?:PHONE|Prone|Puone|Cell|Phone|Fax|Email|Website|Address|Street|Chennai|Vellore|Diagnostic|Centre|Center|Sakthi|Hospital|SRI\b)|' .
            '(?:COMPUTERISED|BLOOD\s*TEST|ECG|X-RAY|SCAN|EXCELLENCE|CARING|HUMAN|EMERGENCY|CASUALTY|CASUALS|EMERGEN)|' .
            '(?:Dr\.|M\.D|Pathology|Celt|Technician|Incharge|MR\.?No|MRO|OP\d)|' .
            '(?:Making\s*lives|Opp\.?\s*to|Collector|LAB\s*REPORT|MULTISPECIAL)|' .
            '(?:ATTACHED|ACBI|CMC|EXTERNAL|QUALITY|CONTROL|ASSESMENT|SCHEME|REG)|' .
            '(?:Please\s*Bring|next\s*visit|Report\s*during|E\s*\-|LP\b)|' .
            '(?:RARAGIOR|FesDescipion|sampke|sampleDste|Spectnee|Rasus|efesnss|Potassium\s+A\b))/i';

        foreach ($lines as $line) {
            $line_stripped = trim($line);
            if (empty($line_stripped)) continue;

            if (preg_match($SKIP_REGEX, $line_stripped)) continue;

            $match = null;
            if (preg_match('/^([A-Za-z][A-Za-z\s.\-\'\/!()%#]{1,40})\s{2,}.*?([\d.]+)/', $line_stripped, $m)) $match = $m;
            else if (preg_match('/^([A-Za-z][A-Za-z\s.\-\'\/!()%#]{1,40})\s+.*?([\d.]+)(?:\s|$)/', $line_stripped, $m)) $match = $m;
            else if (preg_match('/^([A-Za-z][A-Za-z\s.\-\'\/!()%#]{1,40})\s*:\s*.*?([\d.]+)/', $line_stripped, $m)) $match = $m;

            if (!$match) continue;

            $param_name_raw = trim($match[1]);
            $value_str = rtrim($match[2], '.');

            if (strlen($param_name_raw) < 2 || strlen($param_name_raw) > 40) continue;
            if (preg_match('/^[\d.\s]+$/', $param_name_raw)) continue;

            $SKIP_WORDS = ['a','i','no','ref','dr','mr','mrs','ms','the','and','for','to','of','in','be','is','at','or','it','on','up','do','by','we','he','so','if','sample','date','test','visit','name','doctor','unit','units','result','reference','range','normal','value','specimen','serum','report','lab','factor','profile','count'];
            if (in_array(strtolower(trim($param_name_raw)), $SKIP_WORDS)) continue;

            if (preg_match('/(?:upto|date|sample|visit|reference|range|result|report)/i', $param_name_raw)) continue;

            if (substr($param_name_raw, -1) == '}' && strpos($param_name_raw, '(') !== false && strpos($param_name_raw, ')') === false) {
                $param_name_raw = substr($param_name_raw, 0, -1) . ')';
            } else if (substr($param_name_raw, -1) == ']' && strpos($param_name_raw, '[') !== false && strpos($param_name_raw, ']') === false) {
                $param_name_raw = substr($param_name_raw, 0, -1) . ']';
            }

            $param_name_raw = trim(preg_replace('/[\s|!}\]]+$/', '', $param_name_raw));
            $param_name_raw = trim(preg_replace('/^[\s|!{\[]+/', '', $param_name_raw));
            
            if (strlen($param_name_raw) < 2) continue;

            $canonical_name = self::resolve_alias($param_name_raw);
            if (isset($found_param_names[strtolower($canonical_name)])) continue;

            if (isset($param_lookup[strtolower($canonical_name)])) {
                $try_add_parameter($canonical_name, $value_str, $param_lookup[strtolower($canonical_name)]);
            }
        }

        foreach (self::$parameter_aliases as $alias => $canonical_name) {
            if (isset($found_param_names[strtolower($canonical_name)])) continue;
            $pattern = '/' . preg_quote($alias, '/') . '[\s%#.:\-]*(?:result)?[\s:]*([\d.]+)/i';
            if (preg_match($pattern, $raw_text, $m)) {
                $value_str = rtrim($m[1], '.');
                if (isset($param_lookup[strtolower($canonical_name)])) {
                    $try_add_parameter($canonical_name, $value_str, $param_lookup[strtolower($canonical_name)]);
                }
            }
        }

        foreach ($lab_parameters as $param) {
            $name = $param['parameter_name'];
            if (isset($found_param_names[strtolower($name)])) continue;
            $pattern = '/' . preg_quote($name, '/') . '\s*[:\-]?\s*([\d.]+)/i';
            if (preg_match($pattern, $raw_text, $m)) {
                $value_str = rtrim($m[1], '.');
                $try_add_parameter($name, $value_str, $param);
            }
        }

        $active_categories = array_filter($category_scores, function($v) { return $v > 0; });
        if (empty($active_categories)) {
            $report_category = "Unknown Report";
        } else if (count($active_categories) > 1) {
            $report_category = "Mixed Report";
        } else {
            arsort($active_categories);
            $report_category = array_key_first($active_categories);
        }

        $output = [
            "report_category" => $report_category,
            "parameters" => $detected_parameters,
            "patient_details" => $patient_details
        ];

        return $output;
    }
}

// Optional command line execution behavior
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    $result = OcrExtractor::process_file($argv[1]);
    echo "OCR OUTPUT:\n";
    echo json_encode($result);
}

?>
