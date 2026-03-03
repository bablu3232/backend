import sys
import json
import os
import mysql.connector
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ==========================================
# GEMINI API KEY LOADED FROM .ENV
# ==========================================
API_KEY = os.getenv("GEMINI_API_KEY")

# Optional: Output log for debugging
def log_debug(message):
    try:
        pass
    except Exception:
        pass

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
        log_debug(f"DB Error: {e}")
        return []

def main():
    if len(sys.argv) < 2:
        print("OCR OUTPUT:\n" + json.dumps({"error": "No file path provided."}))
        sys.exit(1)

    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print("OCR OUTPUT:\n" + json.dumps({"error": "File not found."}))
        sys.exit(1)

    if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("OCR OUTPUT:\n" + json.dumps({"error": "Gemini API key not configured. Please add it to backend/.env file."}))
        sys.exit(1)

    genai.configure(api_key=API_KEY)

    # Load database parameters to hint Gemini on what parameters to extract accurately
    lab_parameters = get_db_parameters()
    param_lookup = {p['parameter_name'].lower(): p for p in lab_parameters}
    db_param_names = [p['parameter_name'] for p in lab_parameters]
    
    # Upload Document to Gemini using the File API
    try:
        uploaded_file = genai.upload_file(path=file_path)
    except Exception as e:
        print("OCR OUTPUT:\n" + json.dumps({"error": f"Failed to upload to Gemini: {e}"}))
        sys.exit(1)
        
    prompt = f"""
You are a precise medical laboratory data extraction algorithm. Extract ALL the medical test results and patient details from the provided medical report document.

IMPORTANT: Respond EXACTLY in this JSON format. DO NOT add markdown like ```json or any other text outside the JSON block.
{{
  "report_category": "Specify category like Blood Count, Metabolic Panel, Liver Function, Lipid Profile, etc. or Mixed Report",
  "parameters": [
    {{
      "name": "Parameter Name",
      "value": "Numeric value extracted"
    }}
  ],
  "patient_details": {{
    "name": "Patient Name if present, else empty string",
    "age": "Patient age digits only if present (e.g. '25'), else empty string",
    "gender": "Male or Female if present, else empty string"
  }}
}}

CRITICAL INSTRUCTIONS:
1. ONLY include parameters that have a measurable numeric "value".
2. If possible, map the "name" to one of these standard database parameter names EXACTLY:
{json.dumps(db_param_names)}
Only map if it's a clear semantic match. If it's a parameter not in the list, extract its name exactly as it appears.
"""
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content([uploaded_file, prompt])
        
        # Parse JSON from response
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:-3].strip()
        elif res_text.startswith("```"):
            res_text = res_text[3:-3].strip()
            
        gemini_data = json.loads(res_text)
        
        extracted_params = gemini_data.get("parameters", [])
        report_category = gemini_data.get("report_category", "Unknown Report")
        patient_details = gemini_data.get("patient_details", {"name": "", "age": "", "gender": ""})
        
        # Build the structured output exactly like ocr_extract.py
        detected_parameters = {}
        
        for p in extracted_params:
            canonical_name = str(p.get("name", "")).strip()
            value_str = str(p.get("value", "0")).strip().rstrip('.')
            
            db_param = param_lookup.get(canonical_name.lower())
            if not db_param:
                # If not recognized in our DB, we skip it (matching current behavior)
                continue
                
            try:
                val = float(value_str)
            except ValueError:
                continue

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
            
        output = {
            "report_category": report_category,
            "parameters": detected_parameters,
            "patient_details": patient_details
        }
        
        print("OCR OUTPUT:\n" + json.dumps(output))
        
    except Exception as e:
        print("OCR OUTPUT:\n" + json.dumps({"error": f"Failed during Gemini processing: {e}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
