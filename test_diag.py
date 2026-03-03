import sys
import re
import json
import requests
import mysql.connector
import os
from dotenv import load_dotenv

# Load environmental variables
load_dotenv()
OCRSPACE_API_KEY = os.getenv("OCRSPACE_API_KEY", "helloworld")

file_path = sys.argv[1]

file_path = sys.argv[1]

# -------------------------------
# DATABASE CONNECTION
# -------------------------------
def get_db_parameters():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="drugssearch"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM lab_parameters")
        results = cursor.fetchall()
        conn.close()
        return results
    except Exception as e:
        return []

# -------------------------------
# PARAMETER NAME ALIASES
# Maps common report name variations (including OCR typos) to canonical DB names.
# Keys MUST be lowercase.
# -------------------------------
PARAMETER_ALIASES = {
    # Glucose / Blood Sugar
    "blood sugar": "Glucose",
    "blood sugar (f)": "Glucose",
    "blood sugar (fasting)": "Glucose",
    "blood sugar fasting": "Glucose",
    "blood sugar(f)": "Glucose",
    "fasting blood sugar": "Glucose",
    "fbs": "Glucose",
    "blood glucose": "Glucose",
    "blood glucose (f)": "Glucose",
    "blood glucose (fasting)": "Glucose",
    "blood glucose(f)": "Glucose",
    "glucose (fasting)": "Glucose",
    "glucose fasting": "Glucose",
    "glucose (f)": "Glucose",
    "glucose": "Glucose",
    # Total Cholesterol
    "sr. cholesterol": "Total Cholesterol",
    "sr cholesterol": "Total Cholesterol",
    "serum cholesterol": "Total Cholesterol",
    "cholesterol": "Total Cholesterol",
    "cholesterol total": "Total Cholesterol",
    "total cholesterol": "Total Cholesterol",
    # HDL Cholesterol (including common OCR typos)
    "hdl-cholesterol": "HDL Cholesterol",
    "hdl cholesterol": "HDL Cholesterol",
    "hdl -cholesterol": "HDL Cholesterol",
    "hdl- cholesterol": "HDL Cholesterol",
    "hdl -cholestero!": "HDL Cholesterol",
    "hdl-cholestero!": "HDL Cholesterol",
    "hdl-cholesterat": "HDL Cholesterol",
    "hdl cholestero!": "HDL Cholesterol",
    "hdl cholesterat": "HDL Cholesterol",
    "hol-cholesterol": "HDL Cholesterol",
    "hol cholesterol": "HDL Cholesterol",
    "hdl": "HDL Cholesterol",
    # LDL Cholesterol (including common OCR typos)
    "ldl-cholesterol": "LDL Cholesterol",
    "ldl cholesterol": "LDL Cholesterol",
    "ldl- cholesterol": "LDL Cholesterol",
    "ldl -cholesterol": "LDL Cholesterol",
    "ldl-cholesteral": "LDL Cholesterol",
    "ldl-cholestero!": "LDL Cholesterol",
    "ldl cholesteral": "LDL Cholesterol",
    "ldl cholestero!": "LDL Cholesterol",
    "ldl": "LDL Cholesterol",
    # VLDL Cholesterol (including common OCR typos)
    "vldl-cholesterol": "VLDL Cholesterol",
    "vldl cholesterol": "VLDL Cholesterol",
    "vldl-cholestero!": "VLDL Cholesterol",
    "vldl-chotesterol": "VLDL Cholesterol",
    "vldl cholestero!": "VLDL Cholesterol",
    "vldl chotesterol": "VLDL Cholesterol",
    "vldl": "VLDL Cholesterol",
    # Triglycerides (including OCR typos)
    "sr triglycerides": "Triglycerides",
    "serum triglycerides": "Triglycerides",
    "triglycerides": "Triglycerides",
    "sr. tnglycendes": "Triglycerides",
    "sr tnglycendes": "Triglycerides",
    "tnglycendes": "Triglycerides",
    "tigycerides": "Triglycerides",
    "sr. tigycerides": "Triglycerides",
    "sr tigycerides": "Triglycerides",
    # Lipoprotein(a)
    "lipoprotein(a)": "Lipoprotein(a)",
    "lp(a)": "Lipoprotein(a)",
    "lipoprotein (a)": "Lipoprotein(a)",
    # Creatinine (including OCR typos)
    "sr. creatinine": "Creatinine",
    "sr creatinine": "Creatinine",
    "serum creatinine": "Creatinine",
    "creatinine": "Creatinine",
    "sr. creatine": "Creatinine",
    "sr creatine": "Creatinine",
    "creatine": "Creatinine",
    # Ratios (including OCR mangled versions)
    "t-chol/hdl ratio": "T-Chol/HDL Ratio",
    "t chol/hdl ratio": "T-Chol/HDL Ratio",
    "t-cholhdl ratio": "T-Chol/HDL Ratio",
    "t-chov/hdl ratio": "T-Chol/HDL Ratio",
    "t-chov'hdl ratio": "T-Chol/HDL Ratio",
    "t-chov/hdl rato": "T-Chol/HDL Ratio",
    "t-cholhdl rato": "T-Chol/HDL Ratio",
    "t-chov'hdl rato": "T-Chol/HDL Ratio",
    "total cholesterol/hdl ratio": "T-Chol/HDL Ratio",
    "chol/hdl ratio": "T-Chol/HDL Ratio",
    "tchol/hdl ratio": "T-Chol/HDL Ratio",
    "t chovhdl ratio": "T-Chol/HDL Ratio",
    "t cholhdl ratio": "T-Chol/HDL Ratio",
    "t chovhdl rato": "T-Chol/HDL Ratio",
    "ldl/hdl ratio": "LDL/HDL Ratio",
    "ldl hdl ratio": "LDL/HDL Ratio",
    "lduhdl ratio": "LDL/HDL Ratio",
    "lduhdl rato": "LDL/HDL Ratio",
    "ldl/hdl rato": "LDL/HDL Ratio",
    "loumdl ratio": "LDL/HDL Ratio",
    # BUN
    "blood urea nitrogen": "BUN",
    "urea nitrogen": "BUN",
    "bun": "BUN",
    # Blood Urea (Distinct from BUN)
    "blood urea": "Blood Urea",
    "urea": "Blood Urea",
    "serum urea": "Blood Urea",
    # Uric Acid
    "serum uric acid": "Uric Acid",
    "sr. uric acid": "Uric Acid",
    "uric acid": "Uric Acid",
    "urie acid": "Uric Acid",
    "unie acid": "Uric Acid",
    "platelet count": "Platelet Count",
    "paf": "Platelet Count",
    # RA Factor
    "ra factor": "RA Factor",
    "ra": "RA Factor",
    "rheumatoid factor": "RA Factor",
    # Hemoglobin
    "hemoglobin": "Hemoglobin",
    "hemoglobin (hb)": "Hemoglobin",
    "hb": "Hemoglobin",
    "haemoglobin": "Hemoglobin",
    "heamoglobin": "Hemoglobin",
    "hgb": "Hemoglobin",
    # Liver Function Tests
    "sgpt": "ALT (SGPT)",
    "alt (sgpt": "ALT (SGPT)",
    "alt": "ALT (SGPT)",
    "ast": "AST (SGOT)",
    "sgot": "AST (SGOT)",
    "ast (sgot": "AST (SGOT)",
    "alp": "Alkaline Phosphatase (ALP)",
    "alkaline phosphatase (alp": "Alkaline Phosphatase (ALP)",
    "alkaline phosphatase": "Alkaline Phosphatase (ALP)",
    "bilirubin total": "Bilirubin Total",
    "total bilirubin": "Bilirubin Total",
    "bilirubin direct": "Bilirubin Direct",
    "direct bilirubin": "Bilirubin Direct",
    "bilirubin indirect": "Bilirubin Indirect",
    "indirect bilirubin": "Bilirubin Indirect",
    "total protein": "Total Protein",
    "protein total": "Total Protein",
    "albumin": "Albumin",
    "globulin": "Globulin",
    "ag ratio": "A/G Ratio",
    "a/g ratio": "A/G Ratio",
    # CBC / Blood Count
    "total count": "Total Count",
    "total wbc count": "Total Count",
    "tc": "Total Count",
    "wbc": "WBC",
    "wbc count": "WBC",
    "white blood cells": "WBC",
    "rbc": "RBC",
    "rbc count": "RBC",
    "red blood cells": "RBC",
    "platelet count": "Platelets",
    "platelets": "Platelets",
    "hematocrit": "Hematocrit",
    "hct": "Hematocrit",
    # Indices
    "pcv": "PCV",
    "packed cell volume": "PCV",
    "packed cell volume (pcv)": "PCV",
    "mcv": "MCV",
    "mean corpuscular volume": "MCV",
    "mean corpuscular volume (mcv)": "MCV",
    "mch": "MCH",
    "mean corpuscular hemoglobin": "MCH",
    "mchc": "MCHC",
    "mean corpuscular hb conc": "MCHC",
    "rdw": "RDW",
    "red cell distribution width": "RDW",
    "esr": "ESR",
    "erythrocyte sedimentation rate": "ESR",
    "sed rate": "ESR",
    "poly": "Polymorphs",
    "polymorphs": "Polymorphs",
    "neutrophils": "Polymorphs",
    "lymph": "Lymphocytes",
    "lymphocytes": "Lymphocytes",
    "eosino": "Eosinophils",
    "eosinophils": "Eosinophils",
    "rosino": "Eosinophils",
    "basophils": "Basophils",
    "baso": "Basophils",
    "monocytes": "Monocytes",
    "mono": "Monocytes",
    # Metabolic
    "sodium": "Sodium",
    "potassium": "Potassium",
    "calcium": "Calcium",
    "bicarbonate": "Bicarbonate",
    "chloride": "Chloride",
    "carbon dioxide": "Carbon dioxide",
    "co2": "Carbon dioxide",
    "carbon di oxide": "Carbon dioxide",
    "egfr": "eGFR",
    "e-gfr": "eGFR",
    "estimated gfr": "eGFR",
}

def normalize_param_name(name):
    """Normalize a parameter name for matching:
    - Strip leading 'Sr.', 'Sr ', 'Serum ' prefixes
    - Replace hyphens between words with spaces
    - Collapse multiple spaces
    """
    n = name.strip()
    # Remove common prefixes
    n = re.sub(r'^(?:Sr\.\s*|Sr\s+|Serum\s+)', '', n, flags=re.IGNORECASE)
    # Replace hyphens between letters with space (LDL-Cholesterol -> LDL Cholesterol)
    n = re.sub(r'(?<=[A-Za-z])\s*-\s*(?=[A-Za-z])', ' ', n)
    # Collapse multiple spaces
    n = re.sub(r'\s+', ' ', n)
    return n.strip()

def resolve_alias(name):
    """Resolve a parameter name variation to its canonical DB name.
    Tries: raw name -> normalized name -> each as alias lookup.
    """
    raw = name.strip().lower()
    if raw in PARAMETER_ALIASES:
        return PARAMETER_ALIASES[raw]
    # Try normalized
    normalized = normalize_param_name(name).lower()
    if normalized in PARAMETER_ALIASES:
        return PARAMETER_ALIASES[normalized]
    # Return the normalized (cleaned) name
    return normalize_param_name(name)

# -------------------------------
# -------------------------------
# OCRSpace API INTEGRATION
# -------------------------------
def extract_text_with_ocrspace(file_path):
    """Send image/pdf to OCRSpace API and return the extracted text."""
    payload = {
        'apikey': OCRSPACE_API_KEY,
        'isOverlayRequired': False,
        'isTable': True, # Important for table/medical report data extraction
        'OCREngine': 2, # Engine 2 is recommended for numbers and tables
    }
    
    with open(file_path, 'rb') as f:
        r = requests.post(
            'https://api.ocr.space/parse/image',
            files={file_path: f},
            data=payload,
        )
    
    try:
        result = r.json()
    except Exception:
        print("OCR OUTPUT:")
        print(json.dumps({"error": f"OCRSpace API Connection Error: {r.text}"}))
        sys.exit(1)
        
    if isinstance(result, str):
        print("OCR OUTPUT:")
        print(json.dumps({"error": f"OCRSpace Error: {result}"}))
        sys.exit(1)
        
    if result.get('IsErroredOnProcessing'):
        print("OCR OUTPUT:")
        print(json.dumps({"error": f"OCRSpace Error: {result.get('ErrorMessage')}"}))
        sys.exit(1)
        
    parsed_results = result.get('ParsedResults')
    if not parsed_results:
        return ""
        
    full_text = ""
    for page in parsed_results:
        text = page.get('ParsedText', '')
        # Handle cases where OCRSpace separates table columns with tabs or spaces
        text = text.replace('\t', '  ')
        full_text += text + "\n"
        
    return full_text

# Execute OCRSpace API Call
with open("C:/xampp/htdocs/drugssearch/ocr_debug.txt", "r", encoding="utf-8") as rf:
    raw_text = rf.read()
print("Loaded raw_text of length:", len(raw_text))

# -------------------------------
# TEXT NORMALIZATION
# Normalize OCR output before any matching
# -------------------------------
def normalize_ocr_text(text):
    """Normalize OCR text for consistent parsing."""
    # Replace unicode dashes with standard hyphen
    text = text.replace('\u2013', '-')
    text = text.replace('\u2014', '-')
    text = text.replace('\u2212', '-')
    text = text.replace('\u2010', '-')
    # Remove stray OCR artifacts from table borders
    text = text.replace('|', ' ')
    text = text.replace('{', '')
    text = text.replace('}', '')
    return text

raw_text = normalize_ocr_text(raw_text)

with open("ocr_debug.txt", "w", encoding="utf-8") as f:
    f.write(raw_text)

# -------------------------------
# PATIENT DETAILS EXTRACTION
# Handles many common Indian lab report formats
# -------------------------------
patient_details = {
    "name": "",
    "age": "",
    "gender": ""
}

# --- Name extraction ---
# Handles: "Pt.Name : Mrs.Rose", "Pt Name : John", "Name: John Doe", "Pt Nae Mra Rose"
# Note: separator may be :, ;, -, >, ?, or just spaces (OCR may drop punctuation)
name_match = re.search(
    r'(?:Pt\.?\s*N(?:ame|ae)|Patient\s*Name|Name)\s*[:;\->?]?\s+(.+)',
    raw_text, re.IGNORECASE
)
if name_match:
    raw_name = name_match.group(1).strip()
    # Take up to first newline/tab
    raw_name = re.split(r'[\t\n]', raw_name)[0].strip()
    # Remove trailing age/sex/date info that might be on same line
    # Handles OCR typos: "5A" for "54", "Fomaln" for "Female", etc.
    raw_name = re.sub(r'\s+[\dA-Z]{1,3}\s*/\s*(?:F\w*|M\w*)\s*$', '', raw_name, flags=re.IGNORECASE)
    raw_name = re.sub(r'\s+(?:age|ref|sex|gender|dob|date|sid)\b.*$', '', raw_name, flags=re.IGNORECASE)
    raw_name = re.sub(r'\s+\d{2}[/\-]\d{2}[/\-]\d{2,4}.*$', '', raw_name)
    patient_details["name"] = raw_name.strip()

# --- Age/Gender: combined format "Age/Sex : 54 /Female" ---
# OCR may mangle: Age/So% +54 /Female, or 5A /Fomaln, etc.
# Broad gender pattern to handle OCR typos
GENDER_PATTERN = r'(?:Male|Female|Fomale|Fomaln|Famale|Femal|M|F)'

def extract_age_digits(raw_age):
    """Extract age digits from OCR-mangled strings like '5A' -> '54', '3O' -> '30'."""
    # Common OCR digit substitutions: A->4, O->0, I->1, S->5, B->8, G->6
    ocr_digit_map = {'A': '4', 'O': '0', 'I': '1', 'S': '5', 'B': '8', 'G': '6', 'Z': '2', 'T': '7'}
    result = ''
    for ch in raw_age:
        if ch.isdigit():
            result += ch
        elif ch.upper() in ocr_digit_map:
            result += ocr_digit_map[ch.upper()]
    return result if result else raw_age

age_sex_match = re.search(
    r'(?:Age|age)\s*[/\\&]?\s*(?:Sex|So[x%]|Gender)?\s*[:;\->+?]?\s*[+]?(\d[\dA-Za-z]*)\s*[/\s,]*\s*(' + GENDER_PATTERN + r')\b',
    raw_text, re.IGNORECASE
)
if age_sex_match:
    patient_details["age"] = extract_age_digits(age_sex_match.group(1).strip())
    g = age_sex_match.group(2).strip().lower()
    patient_details["gender"] = "Male" if g.startswith('m') else "Female"
else:
    # Fallback: look for "5A /Fomaln" pattern (digits+optional letter, slash, gender word)
    age_sex_match2 = re.search(
        r'(\d[\dA-Za-z]*)\s*[/\s]+\s*(' + GENDER_PATTERN + r')\b',
        raw_text, re.IGNORECASE
    )
    if age_sex_match2:
        patient_details["age"] = extract_age_digits(age_sex_match2.group(1).strip())
        g = age_sex_match2.group(2).strip().lower()
        patient_details["gender"] = "Male" if g.startswith('m') else "Female"
    else:
        # Separate patterns
        age_match = re.search(r'(?:Age|Yrs|Years)\s*[:;\-]\s*(\d+)', raw_text, re.IGNORECASE)
        if age_match:
            patient_details["age"] = age_match.group(1).strip()

        gender_match = re.search(r'(?:Gender|Sex)\s*[:;\-]\s*(Male|Female|M|F)\b', raw_text, re.IGNORECASE)
        if gender_match:
            g = gender_match.group(1).strip().lower()
            patient_details["gender"] = "Male" if g.startswith('m') else "Female"


# -------------------------------
# PARAMETER & CATEGORY DETECTION
# -------------------------------
lab_parameters = get_db_parameters()

detected_parameters = {}
category_scores = {}

for param in lab_parameters:
    cat = param['category']
    if cat:
        category_scores[cat] = 0

found_param_names = set()
param_lookup = {p['parameter_name'].lower(): p for p in lab_parameters}

def try_add_parameter(canonical_name, value, db_param):
    print(f"TRY ADD: {canonical_name}, {value}")
    """Add a parameter using its canonical DB name and DB metadata."""
    if canonical_name.lower() in found_param_names:
        return
    try:
        val = float(value)
    except (ValueError, TypeError):
        return

    min_val = float(db_param['min_value'])
    max_val = float(db_param['max_value'])

    status = "Normal"
    risk_level = "None"
    deviation = 0.0
    condition = ""
    recommendation = {}

    if val < min_val:
        status = "Low"
        deviation = ((min_val - val) / min_val) * 100
        condition = db_param['condition_if_abnormal'] or "Low Level"
    elif val > max_val:
        status = "High"
        deviation = ((val - max_val) / max_val) * 100
        condition = db_param['condition_if_abnormal'] or "High Level"

    if status != "Normal":
        # Risk Logic: High if deviation > 15%, else Moderate
        risk_level = "High" if deviation > 15 else "Moderate"
        recommendation = {
            "category": db_param['drug_category'],
            "drugs": db_param['example_drugs']
        }

    detected_parameters[canonical_name] = {
        "value": val,
        "unit": db_param['unit'],
        "status": status,
        "risk_level": risk_level,
        "deviation": round(deviation, 1),
        "category": db_param['category'],
        "condition": condition,
        "recommendation": recommendation,
        "summary": db_param['summary'] if 'summary' in db_param else ""
    }
    found_param_names.add(canonical_name.lower())

    if db_param['category']:
        category_scores[db_param['category']] = category_scores.get(db_param['category'], 0) + 1


# =============================================
# PHASE 1: Line-by-line extraction with alias + normalization
# This is the main workhorse — processes every line of OCR text
# =============================================
lines = raw_text.split('\n')

# Lines to skip (headers, patient info, footers, section titles)
SKIP_PATTERNS = re.compile(
    r'(?:^(?:TEST|INVESTIGATION|PARAMETER|TES\?|RESULT|VALUE)\b|'
    r'(?:REFERENCE\s+(?:VALUE|RANGE|VALOR))|'
    r'(?:Test\s*Descript)|'
    r'(?:Pt\.?\s*N(?:ame|ae)|Patient\s*Name|PID|UHID|Reg\.?\s*No|Registered\s*on)\s*[:\-]?|'
    r'(?:Age|Gender|Sex|Date|Generated\s*on)\s*[:\-]?|'
    r'(?:Ref\s*\.?\s*(?:No|by))|'
    r'(?:Sample|Collected|Reported|Received|SID|STD|Visit|Specimen|Doctor|Name)\s*[:\-\s]|'
    r'(?:BIO\s*CHEMISTRY|LIPID\s*PROFILE|HAEMATOLOGY|BLOOD\s*COUNT|CBC|RA\s*Factor\s*:)\s*:?\s*$|'
    r'(?:End\s+of\s+R(?:eport|uport)|Signature|Doctor|Patholog|Consultant|Timing|Week\s*Days|Sunday|Undertaken)|'
    r'(?:PHONE|Prone|Puone|Cell|Phone|Fax|Email|Website|Address|Street|Chennai|Vellore|Diagnostic|Centre|Center|Sakthi|Hospital|SRI\b)|'
    r'(?:COMPUTERISED|BLOOD\s*TEST|ECG|X-RAY|SCAN|EXCELLENCE|CARING|HUMAN|EMERGENCY|CASUALTY|CASUALS|EMERGEN)|'
    r'(?:Dr\.|M\.D|Pathology|Celt|Technician|Incharge|MR\.?No|MRO|OP\d)|'
    r'(?:Making\s*lives|Opp\.?\s*to|Collector|LAB\s*REPORT|MULTISPECIAL)|'
    r'(?:ATTACHED|ACBI|CMC|EXTERNAL|QUALITY|CONTROL|ASSESMENT|SCHEME|REG)|'
    r'(?:Please\s*Bring|next\s*visit|Report\s*during|E\s*\-|LP\b)|'
    r'(?:RARAGIOR|FesDescipion|sampke|sampleDste|Spectnee|Rasus|efesnss|Potassium\s+A\b))',
    re.IGNORECASE
)

for line in lines:
    line_stripped = line.strip()
    if not line_stripped:
        continue

    # Skip header/footer/section/junk lines
    if SKIP_PATTERNS.search(line_stripped):
        continue

    # --- Try to extract parameter name + value from this line ---
    # Pattern A: Name followed by 2+ spaces then number (tabular format)
    match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s{2,}([\d.]+)', line_stripped)

    # Pattern B: Name followed by 1+ space then number
    if not match:
        match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s+([\d.]+)(?:\s|$)', line_stripped)

    # Pattern C: Name : value (colon-separated)
    if not match:
        match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s*:\s*([\d.]+)', line_stripped)

    if not match:
        continue

    param_name_raw = match.group(1).strip()
    value_str = match.group(2).rstrip('.')
    print(f"REGEX MATCHED: {param_name_raw} = {value_str}")

    # Skip garbage: too short, too long, or pure numbers
    if len(param_name_raw) < 2 or len(param_name_raw) > 40:
        continue
    if re.match(r'^[\d.\s]+$', param_name_raw):
        continue
    # Skip single-letter or common non-param words
    SKIP_WORDS = {'a', 'i', 'no', 'ref', 'dr', 'mr', 'mrs', 'ms', 'the', 'and', 'for', 'to', 'of', 'in',
                  'be', 'is', 'at', 'or', 'it', 'on', 'up', 'do', 'by', 'we', 'he', 'so', 'if',
                  'sample', 'date', 'test', 'visit', 'name', 'doctor', 'unit', 'units',
                  'result', 'reference', 'range', 'normal', 'value', 'specimen',
                  'serum', 'report', 'lab', 'factor', 'profile', 'count'}
    if param_name_raw.lower().strip() in SKIP_WORDS:
        continue
    # Skip names that contain 'upto', 'date', 'sample', 'visit' — likely garbage
    if re.search(r'(?:upto|date|sample|visit|reference|range|result|report)', param_name_raw, re.IGNORECASE):
        continue
    # Fix mismatched closing braces before stripping
    if param_name_raw.endswith('}') and '(' in param_name_raw and ')' not in param_name_raw:
        param_name_raw = param_name_raw[:-1] + ')'
    elif param_name_raw.endswith(']') and '[' in param_name_raw and ']' not in param_name_raw:
        param_name_raw = param_name_raw[:-1] + ']'
        
    # Skip names ending in single junk chars from OCR artifacts
    param_name_raw = re.sub(r'[\s|!}\]]+$', '', param_name_raw).strip()
    param_name_raw = re.sub(r'^[\s|!{\[]+', '', param_name_raw).strip()
    
    if len(param_name_raw) < 2:
        continue

    # Resolve to canonical name via alias + normalization
    canonical_name = resolve_alias(param_name_raw)

    # Already found?
    if canonical_name.lower() in found_param_names:
        continue

    # Try DB match
    db_param = param_lookup.get(canonical_name.lower())
    if db_param:
        try_add_parameter(canonical_name, value_str, db_param)


# =============================================
# PHASE 2: Full-text alias scan (catch any remaining)
# Searches the entire OCR text for aliases not yet found
# =============================================
for alias, canonical_name in PARAMETER_ALIASES.items():
    if canonical_name.lower() in found_param_names:
        continue
    # Search entire text for alias followed by a number
    pattern = rf'{re.escape(alias)}\s*[:\-]?\s*([\d.]+)'
    match = re.search(pattern, raw_text, re.IGNORECASE)
    if match:
        value_str = match.group(1).rstrip('.')
        db_param = param_lookup.get(canonical_name.lower())
        if db_param:
            try_add_parameter(canonical_name, value_str, db_param)


# =============================================
# PHASE 3: DB-name full-text scan (catch any remaining DB params)
# =============================================
for param in lab_parameters:
    name = param['parameter_name']
    if name.lower() in found_param_names:
        continue
    pattern = rf"{re.escape(name)}\s*[:\-]?\s*([\d.]+)"
    match = re.search(pattern, raw_text, re.IGNORECASE)
    if match:
        value_str = match.group(1).rstrip('.')
        try_add_parameter(name, value_str, param)


# -------------------------------
# REPORT CATEGORY DECISION
# -------------------------------
active_categories = {k: v for k, v in category_scores.items() if v > 0}

if not active_categories:
    report_category = "Unknown Report"
else:
    if len(active_categories) > 1:
        report_category = "Mixed Report"
    else:
        report_category = max(active_categories, key=active_categories.get)

# -------------------------------
# FINAL JSON OUTPUT
# -------------------------------
output = {
    "report_category": report_category,
    "parameters": detected_parameters,
    "patient_details": patient_details
}

print("OCR OUTPUT:")
print(json.dumps(output))
