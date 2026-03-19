import sys
import re
import json

def normalize_text(text):
    # Remove special characters but keep spaces and hyphens for medical terms
    text = re.sub(r'[^\w\s\-]', '', text.lower())
    return text.strip()

def detect_intent(text):
    original_text = text
    text = normalize_text(text)
    
    if not text:
        return "UNKNOWN", None, 0.0

    # 1. GREETING
    # Supports slang, Indian English, and common variations
    greeting_patterns = [
        r'\b(hi|hello|hlo|hey|hiee|greet|morning|evening|afternoon|vanakkam)\b',
        r'\b(hi|hello)\s+(da|bro|buddy|assistant)\b'
    ]
    for pattern in greeting_patterns:
        if re.search(pattern, text):
            return "GREETING", None, 0.98

    # 2. CHECK_REPORT
    report_patterns = [
        r'\b(show|get|see|view)\b.*?\b(report|reports|result|results|test)\b',
        r'\b(latest|my|last)\s+(report|results|test|blood test)\b'
    ]
    for pattern in report_patterns:
        if re.search(pattern, text):
            return "CHECK_REPORT", None, 0.97

    # 3. TREND_ANALYSIS (New)
    trend_patterns = [
        r'\b(compare|difference|changes|improvement|progress)\b.*?\b(report|reports|results|health)\b',
        r'\b(are|is)\b.*?\b(improving|getting better|worsening)\b'
    ]
    for pattern in trend_patterns:
        if re.search(pattern, text):
            return "TREND_ANALYSIS", None, 0.95

    # 4. HEALTH_TIPS
    tips_patterns = [
        r'\b(diet|exercise|health|healthy|workout|lifestyle|food)\b.*?\b(tip|tips|advice|guide|how to)\b',
        r'\bhow to\b.*?\b(stay|be|reduce|manage|improve)\b',
        r'\b(reduce|lower|manage)\b.*?\b(cholesterol|sugar|weight|bp|pressure)\b'
    ]
    for pattern in tips_patterns:
        if re.search(pattern, text):
            return "HEALTH_TIPS", None, 0.88

    # 5. EXPLAIN_PARAM (Prioritized medical parameter extraction)
    # Filler words to strip
    fillers = [
        r'\bwhat\s+is\b', r'\bexplain\b', r'\bmeaning\s+of\b', 
        r'\btell\s+me\s+about\b', r'\bwhat\s+do\s+you\s+know\s+about\b',
        r'\bunderstand\b', r'\bvalue\s+of\b', r'\binformation\s+on\b'
    ]
    
    # Check if text contains clear explanation trigger
    explanation_trigger = False
    clean_entity = text
    for filler in fillers:
        if re.search(filler, text):
            explanation_trigger = True
            clean_entity = re.sub(filler, '', clean_entity).strip()
    
    # Even if no trigger, check if it's a known medical-looking query
    words = text.split()
    is_medical_term = len(words) <= 3 and (len(text) >= 2 or re.search(r'\d', text))
    
    if explanation_trigger or is_medical_term:
        # Final cleanup for the entity
        clean_entity = re.sub(r'\b(the|a|an|please|my|level|levels|about)\b', '', clean_entity).strip()
        if len(clean_entity) >= 2:
            confidence = 0.96 if explanation_trigger else 0.85
            return "EXPLAIN_PARAM", clean_entity, confidence

    # 5. UNKNOWN
    # If the process reached here, we are very uncertain
    return "UNKNOWN", None, 0.2

if __name__ == "__main__":
    if len(sys.argv) > 1:
        message = sys.argv[1]
    else:
        message = sys.stdin.read()
    
    intent, entity, confidence = detect_intent(message)
    
    # Final check: if confidence is low, strictly return UNKNOWN as per user rules
    if confidence < 0.5:
        intent = "UNKNOWN"
        entity = None
    
    print(json.dumps({
        "intent": intent,
        "entity": entity,
        "confidence": round(float(confidence), 2)
    }))
