import sys
import json
import mysql.connector

# Debug Logger
def log_debug(message):
    try:
        # Use an absolute path in a user-writable directory
        with open(r"C:\Users\Nikhil M\drugssearch_backend_debug.log", "a") as f:
            f.write(message + "\n")
    except:
        pass

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
        log_debug(f"DB Error: {e}")
        return []

# -------------------------------
# MAIN ANALYSIS LOGIC
# -------------------------------
def analyze(input_json):
    log_debug(f"Input received: {input_json}")
    try:
        data = json.loads(input_json)
        input_category = data.get("category", "General")
        input_parameters = data.get("parameters", [])
        patient_details = data.get("patient_details", {
            "name": "",
            "age": "",
            "gender": ""
        })
        
        lab_parameters = get_db_parameters()
        log_debug(f"Fetched {len(lab_parameters)} DB parameters")
        
        # Create a lookup dictionary for lab parameters for faster access
        # Key: parameter name (lowercase for case-insensitive matching)
        param_lookup = {p['parameter_name'].lower(): p for p in lab_parameters}

        detected_parameters = {}
        
        for param in input_parameters:
            name = param.get("name")
            value_str = str(param.get("value", "0"))
            
            # Basic validation
            if not name:
                continue
                
            try:
                value = float(value_str)
            except ValueError:
                value = 0.0

            # Find matching DB parameter
            db_param = param_lookup.get(name.lower())
            
            status = "Normal"
            condition = ""
            recommendation = None
            
            if db_param:
                min_val = float(db_param['min_value'])
                max_val = float(db_param['max_value'])
                
                deviation = 0.0
                risk_level = "None"

                if value < min_val:
                    status = "Low"
                    deviation = ((min_val - value) / min_val) * 100
                    condition = db_param['condition_if_abnormal'] or "Low Level"
                elif value > max_val:
                    status = "High"
                    deviation = ((value - max_val) / max_val) * 100
                    condition = db_param['condition_if_abnormal'] or "High Level"
                
                # Add recommendation info if abnormal
                if status != "Normal":
                     risk_level = "High" if deviation > 15 else "Moderate"
                     recommendation = {
                         "category": db_param['drug_category'],
                         "drugs": db_param['example_drugs']
                     }

                detected_parameters[name] = {
                    "value": value,
                    "unit": db_param['unit'],
                    "status": status,
                    "risk_level": risk_level,
                    "deviation": round(deviation, 1),
                    "category": db_param['category'] if db_param['category'] else input_category,
                    "condition": condition,
                    "recommendation": recommendation,
                    "summary": db_param['summary'] if 'summary' in db_param else ""
                }
            else:
                log_debug(f"Parameter not found in DB: {name} - Skipping.")

        output = {
            "report_category": input_category,
            "parameters": detected_parameters,
            "patient_details": patient_details
        }
        
        json_output = json.dumps(output)
        log_debug(f"Output generated: {json_output}")
        print(json_output)

    except Exception as e:
        error_msg = json.dumps({"error": str(e)})
        log_debug(f"Error: {str(e)}")
        print(error_msg)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_arg = sys.argv[1]
        # Check if input_arg is a file path
        import os
        if os.path.exists(input_arg) and os.path.isfile(input_arg):
            try:
                with open(input_arg, 'r') as f:
                    file_content = f.read()
                analyze(file_content)
            except Exception as e:
                log_debug(f"Failed to read input file: {e}")
                print(json.dumps({"error": f"Failed to read input file: {e}"}))
        else:
            # Treat as raw JSON string
            analyze(input_arg)
    else:
        # Read from stdin (alternative)
        input_data = sys.stdin.read()
        analyze(input_data)
