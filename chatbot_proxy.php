<?php
require_once 'db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

// Get input from Android App
$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input['user_id'] ?? null;
$message = $input['message'] ?? '';

if (empty($message)) {
    die(json_encode(["error" => "Empty message."]));
}

// --- CALL LOCAL NLP ENGINE ---
// Use shell_exec to run the python script and get the intent
$escaped_message = escapeshellarg($message);
$python_cmd = "python nlp_engine.py $escaped_message";
$nlp_output = shell_exec($python_cmd);
$nlp_data = json_decode($nlp_output, true);

$intent = $nlp_data['intent'] ?? 'UNKNOWN';
$entity = $nlp_data['entity'] ?? null;

$reply = "";

// Helper function for Trend Analysis
function getParams($conn, $report_id) {
    $sql = "SELECT parameter_name, parameter_value, recommendation FROM report_parameters WHERE report_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $report_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $cleaned_val = filter_var($row['parameter_value'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
        $data[$row['parameter_name']] = [
            'val' => (float) $cleaned_val,
            'normal' => empty($row['recommendation'])
        ];
    }
    return $data;
}

switch ($intent) {
    case 'GREETING':
        $reply = "Hello! I am your DrugsSearch Assistant. Here is what I can do for you:\n\n";
        $reply .= "• 📊 Summarize Report: Ask 'Check my latest report'\n";
        $reply .= "• 🧪 Explain Parameters: Ask 'Explain LDL' or 'What is RBC?'\n";
        $reply .= "• 📈 Trend Analysis: Ask 'Compare my reports' to see your progress\n";
        $reply .= "• 🍎 Health Tips: Ask 'Give me a health tip'\n\n";
        $reply .= "How can I help you today?";
        break;

    case 'CHECK_REPORT':
        if (!$user_id) {
            $reply = "I'd love to check your reports, but I couldn't identify your user account. Please make sure you are logged in.";
            break;
        }
        
        // Fetch latest report
        $sql = "SELECT id, category, report_date FROM reports WHERE user_id = ? ORDER BY id DESC LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $report_res = $stmt->get_result();
        
        if ($report_res->num_rows > 0) {
            $report = $report_res->fetch_assoc();
            $report_id = $report['id'];
            $category = $report['category'];
            $date = date("d M Y", strtotime($report['report_date']));
            
            // Fetch parameters for this report
            $sql_p = "SELECT parameter_name, parameter_value, unit, recommendation FROM report_parameters WHERE report_id = ?";
            $stmt_p = $conn->prepare($sql_p);
            $stmt_p->bind_param("i", $report_id);
            $stmt_p->execute();
            $params_res = $stmt_p->get_result();
            
            $reply = "Your latest report is a $category from $date.\n\n";
            $abnormal_count = 0;
            while ($p = $params_res->fetch_assoc()) {
                $is_normal = empty($p['recommendation']);
                $status = $is_normal ? "✅ Normal" : "⚠️ Abnormal";
                if (!$is_normal) $abnormal_count++;
                $reply .= "• {$p['parameter_name']}: {$p['parameter_value']} {$p['unit']} ($status)\n";
            }
            
            if ($abnormal_count > 0) {
                $reply .= "\nNote: You have $abnormal_count abnormal result(s). Please consult your doctor for a detailed clinical advice.";
            } else {
                $reply .= "\nEverything looks normal in this report! Keep maintaining a healthy lifestyle.";
            }
        } else {
            $reply = "I couldn't find any reports for your account yet. You can upload a report in the 'Upload' section!";
        }
        break;

    case 'TREND_ANALYSIS':
        if (!$user_id) {
            $reply = "I'd love to analyze your trends, but please log in first.";
            break;
        }

        // Fetch last two reports
        $sql = "SELECT id, category, report_date FROM reports WHERE user_id = ? ORDER BY id DESC LIMIT 2";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $reports_res = $stmt->get_result();

        if ($reports_res->num_rows < 2) {
            $reply = "I need at least two reports to perform a trend analysis. You currently have only " . $reports_res->num_rows . " report(s) uploaded.";
            break;
        }

        $report1 = $reports_res->fetch_assoc(); // Latest
        $report2 = $reports_res->fetch_assoc(); // Previous

        $params1 = getParams($conn, $report1['id']);
        $params2 = getParams($conn, $report2['id']);

        $reply = "📊 Comparative Trend Analysis\n\n";
        $reply .= "Comparing results from " . date("d M", strtotime($report2['report_date'])) . " to " . date("d M", strtotime($report1['report_date'])) . ":\n\n";

        $changes = 0;
        foreach ($params1 as $name => $p1) {
            if (isset($params2[$name])) {
                $p2 = $params2[$name];
                $diff = round($p1['val'] - $p2['val'], 2);
                $trend = "";
                
                if ($p1['val'] == $p2['val']) continue;

                if ($diff > 0) {
                    $trend = "📈 Increased by " . abs($diff);
                } else {
                    $trend = "📉 Decreased by " . abs($diff);
                }

                $status = $p1['normal'] ? " (Normal ✅)" : " (Abnormal ⚠️)";
                $reply .= "• $name: $trend$status\n";
                $changes++;
            }
        }

        if ($changes == 0) {
            $reply .= "No significant changes found in common parameters between these two reports.";
        } else {
            $reply .= "\n*Note: Trends show changes in values. Always consult your doctor for medical interpretation.*";
        }
        break;

    case 'EXPLAIN_PARAM':
        if (!$entity) {
            $reply = "Could you please specify which parameter you'd like me to explain? (e.g., 'What is LDL?') ";
            break;
        }
        
        // Search in lab_parameters
        $search_term = "%" . $entity . "%";
        $sql = "SELECT parameter_name, summary, unit, min_value, max_value, category, condition_if_abnormal, drug_category, example_drugs 
                FROM lab_parameters 
                WHERE parameter_name LIKE ? OR category LIKE ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $search_term, $search_term);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($res->num_rows > 0) {
            $p = $res->fetch_assoc();
            $reply = "{$p['parameter_name']}\n\n";
            
            if (!empty($p['category'])) {
                $reply .= "- Category: {$p['category']}\n";
            }
            if ($p['min_value'] !== null && $p['max_value'] !== null) {
                $unit = !empty($p['unit']) ? " {$p['unit']}" : "";
                $reply .= "- Normal Range: {$p['min_value']} - {$p['max_value']}$unit\n";
            }
            if (!empty($p['condition_if_abnormal'])) {
                $reply .= "- Abnormal Indication: {$p['condition_if_abnormal']}\n";
            }
            if (!empty($p['drug_category'])) {
                $reply .= "- Treatment Category: {$p['drug_category']}\n";
            }
            if (!empty($p['example_drugs'])) {
                $reply .= "- Example Drugs: {$p['example_drugs']}\n";
            }
            
            $reply .= "\nSummary:\n";
            $reply .= !empty($p['summary']) ? $p['summary'] : "No detailed summary available.";
            
        } else {
            $reply = "I'm sorry, I don't have information about '$entity' in my medical library yet. I'm constantly learning!";
        }
        break;

    case 'HEALTH_TIPS':
        $general_tips = [
            "DRINK WATER: Staying hydrated is essential for your kidneys and overall energy levels.",
            "WALK DAILY: Even a 20-minute walk can significantly improve your heart health and mood.",
            "LIMIT SALT: Reducing salt intake helps manage blood pressure and reduces water retention.",
            "EAT GREENS: Spinach and broccoli are rich in fiber and essential vitamins for your immunity.",
            "SLEEP WELL: Aim for 7-8 hours of sleep to help your body recover and manage stress better.",
            "AVOID SUGAR: Cutting down on added sugars is a great way to regulate your blood glucose.",
            "STRESS LESS: Practice 5 minutes of deep breathing daily to lower your resting heart rate.",
            "EAT MINDFULLY: Pay attention to your meals and eat slowly. It aids digestion and prevents overeating.",
            "STAY ACTIVE: Avoid sitting for prolonged periods. Stand up and stretch every hour.",
            "GET SUNLIGHT: 15 minutes of morning sun provides essential Vitamin D and boosts your mood.",
            "PRACTICE POSTURE: Keep your back straight, especially when working at a desk, to avoid chronic pain."
        ];

        $targeted_tips = [
            'Hemoglobin' => [
                "I noticed your Hemoglobin was flagged in a recent report. Include more iron-rich foods like spinach, lentils, and red meat in your diet.",
                "Since your Hemoglobin showed an abnormal value recently, consider taking Vitamin C with iron-rich foods to boost absorption.",
                "To help support healthy Hemoglobin levels, consider snacking on pumpkin seeds or adding more tofu to your meals."
            ],
            'LDL Cholesterol' => [
                "Based on a recent report, your LDL Cholesterol was high. Try replacing saturated fats with healthier options like olive oil and almonds.",
                "To help manage your LDL Cholesterol levels, add more soluble dietary fiber like oatmeal and kidney beans to your meals.",
                "Regular cardiovascular exercise, like brisk walking or cycling, can be highly effective in reducing your LDL Cholesterol."
            ],
            'Total Cholesterol' => [
                "Your Total Cholesterol was flagged recently. Prioritizing foods high in soluble fiber and low in saturated fats can bring it down.",
                "To manage your Total Cholesterol, consider switching from full-fat dairy products to low-fat or fat-free alternatives."
            ],
            'Triglycerides' => [
                "Your Triglycerides were flagged recently. Reducing refined carbohydrates and exercising regularly can help lower them.",
                "Since your Triglycerides were outside the normal range, increasing your intake of Omega-3 fatty acids (like in salmon) might be beneficial.",
                "Limiting sugary beverages and alcohol is one of the fastest ways to lower your Triglyceride levels."
            ],
            'Blood Glucose' => [
                "I see your Blood Glucose was outside the normal range. Regular physical activity can help your body use insulin more effectively.",
                "For better Blood Glucose control, try to eat meals at regular times and strictly monitor your carbohydrate intake."
            ],
            'Glucose' => [
                "I see your Glucose was outside the normal range. Regular physical activity can help your body use insulin more effectively.",
                "For better Glucose control, try to eat meals at regular times and strictly monitor your carbohydrate intake."
            ],
            'WBC' => [
                "Your WBC count was flagged recently. Ensure you get enough sleep and stay hydrated to support your immune system.",
                "Since your WBC count was abnormal, focus on a balanced diet rich in antioxidants like berries, citrus fruits, and leafy greens."
            ],
            'Platelets' => [
                "Your Platelet count was flagged. Staying well hydrated and consuming folate-rich foods like dark leafy greens can be supportive.",
                "To support healthy Platelet levels, ensure you are not deficient in Vitamin B12 or iron by eating a varied, balanced diet."
            ],
            'Sodium' => [
                "An abnormal Sodium level was found in your recent report. Make sure to stay properly hydrated and avoid excessively salty processed foods.",
                "Since your Sodium was flagged, be mindful of hidden salts in canned soups, sauces, and fast food."
            ],
            'Potassium' => [
                "Your Potassium level was outside the normal range. Foods like bananas, sweet potatoes, and spinach are great natural sources of Potassium.",
                "To manage Potassium, speak with your doctor about whether you need to adjust your diet or medications."
            ],
            'Calcium' => [
                "An abnormal Calcium value was noted in your report. Dairy products, fortified plant milks, and leafy greens can help support Calcium levels.",
                "Vitamin D is crucial for Calcium absorption. Try to get safe sun exposure or eat fortified foods."
            ],
            'Creatinine' => [
                "I noticed an abnormal Creatinine level in your report. Make sure to drink plenty of water unless advised otherwise by your doctor.",
                "To support kidney health and manage Creatinine levels, avoid excessive use of over-the-counter pain relievers like NSAIDs."
            ],
            'Uric Acid' => [
                "Your Uric Acid was flagged in your recent report. Reducing the intake of purine-rich foods like red meat and avoiding alcohol can help.",
                "To manage Uric Acid levels, drink plenty of water to help your kidneys flush it out of your system more efficiently."
            ]
        ];

        $selected_tip = "";
        $debug_params = [];
        
        if ($user_id) {
            // Find abnormal parameters from the latest reports
            $sql = "SELECT rp.parameter_name FROM reports r 
                    JOIN report_parameters rp ON r.id = rp.report_id 
                    WHERE r.user_id = ? AND rp.recommendation IS NOT NULL AND rp.recommendation != '' 
                    ORDER BY r.id DESC LIMIT 10";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $abnormal_res = $stmt->get_result();
            
            $abnormal_params = [];
            while ($row = $abnormal_res->fetch_assoc()) {
                $abnormal_params[] = trim($row['parameter_name']);
            }
            $debug_params = $abnormal_params;
            
            // Try to match an abnormal parameter to our targeted tips
            shuffle($abnormal_params); // Randomize if multiple
            foreach ($abnormal_params as $param) {
                // Case-insensitive match
                foreach ($targeted_tips as $key => $tips_array) {
                    if (strcasecmp($param, $key) == 0) {
                        $selected_tip = $tips_array[array_rand($tips_array)];
                        break 2;
                    }
                }
            }
        }
        
        if (empty($selected_tip)) {
            $selected_tip = $general_tips[array_rand($general_tips)];
            $reply = "Here is a health tip for you:\n\n" . $selected_tip;
        } else {
            $reply = "Here is a personalized health tip for you:\n\n" . $selected_tip;
        }
        break;

    default:
        $reply = "I'm not sure I understood that. You can ask me to 'summarize my report', 'explain LDL', or just say 'hello'!";
        break;
}

echo json_encode(["reply" => $reply]);
