<?php

/**
 * NlpEngine
 * A native PHP implementation of the NLP engine logic, replacing nlp_engine.py.
 * Detects user intent based on regular expressions.
 */
class NlpEngine {

    public static function normalize_text($text) {
        if (!$text) return "";
        // Remove special characters but keep spaces and hyphens for medical terms
        $text = preg_replace('/[^\w\s\-]/', '', strtolower($text));
        return trim($text);
    }

    public static function detect_intent($original_text) {
        $text = self::normalize_text($original_text);

        if (empty($text)) {
            return ["intent" => "UNKNOWN", "entity" => null, "confidence" => 0.0];
        }

        // 1. GREETING
        $greeting_patterns = [
            '/\b(hi|hello|hlo|hey|hiee|greet|morning|evening|afternoon|vanakkam)\b/i',
            '/\b(hi|hello)\s+(da|bro|buddy|assistant)\b/i'
        ];
        foreach ($greeting_patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return ["intent" => "GREETING", "entity" => null, "confidence" => 0.98];
            }
        }

        // 2. CHECK_REPORT
        $report_patterns = [
            '/\b(show|get|see|view)\b.*?\b(report|reports|result|results|test)\b/i',
            '/\b(latest|my|last)\s+(report|results|test|blood test)\b/i'
        ];
        foreach ($report_patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return ["intent" => "CHECK_REPORT", "entity" => null, "confidence" => 0.97];
            }
        }

        // 3. TREND_ANALYSIS
        $trend_patterns = [
            '/\b(compare|difference|changes|improvement|progress)\b.*?\b(report|reports|results|health)\b/i',
            '/\b(are|is)\b.*?\b(improving|getting better|worsening)\b/i'
        ];
        foreach ($trend_patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return ["intent" => "TREND_ANALYSIS", "entity" => null, "confidence" => 0.95];
            }
        }

        // 4. HEALTH_TIPS
        $tips_patterns = [
            '/\b(diet|exercise|health|healthy|workout|lifestyle|food)\b.*?\b(tip|tips|advice|guide|how to)\b/i',
            '/\bhow to\b.*?\b(stay|be|reduce|manage|improve)\b/i',
            '/\b(reduce|lower|manage)\b.*?\b(cholesterol|sugar|weight|bp|pressure)\b/i'
        ];
        foreach ($tips_patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return ["intent" => "HEALTH_TIPS", "entity" => null, "confidence" => 0.88];
            }
        }

        // 5. EXPLAIN_PARAM
        $fillers = [
            '/\bwhat\s+is\b/i', '/\bexplain\b/i', '/\bmeaning\s+of\b/i', 
            '/\btell\s+me\s+about\b/i', '/\bwhat\s+do\s+you\s+know\s+about\b/i',
            '/\bunderstand\b/i', '/\bvalue\s+of\b/i', '/\binformation\s+on\b/i'
        ];
        
        $explanation_trigger = false;
        $clean_entity = $text;
        
        foreach ($fillers as $filler) {
            if (preg_match($filler, $text)) {
                $explanation_trigger = true;
                $clean_entity = trim(preg_replace($filler, '', $clean_entity));
            }
        }
        
        $words = preg_split('/\s+/', $text);
        $is_medical_term = count($words) <= 3 && (strlen($text) >= 2 || preg_match('/\d/', $text));
        
        if ($explanation_trigger || $is_medical_term) {
            $clean_entity = trim(preg_replace('/\b(the|a|an|please|my|level|levels|about)\b/i', '', $clean_entity));
            if (strlen($clean_entity) >= 2) {
                $confidence = $explanation_trigger ? 0.96 : 0.85;
                return ["intent" => "EXPLAIN_PARAM", "entity" => $clean_entity, "confidence" => $confidence];
            }
        }

        // 6. UNKNOWN
        return ["intent" => "UNKNOWN", "entity" => null, "confidence" => 0.2];
    }
}

// Optional command line execution behavior for quick testing
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    $result = NlpEngine::detect_intent($argv[1]);
    if ($result['confidence'] < 0.5) {
        $result['intent'] = "UNKNOWN";
        $result['entity'] = null;
    }
    echo json_encode(["intent" => $result['intent'], "entity" => $result['entity'], "confidence" => round($result['confidence'], 2)]);
}

?>
