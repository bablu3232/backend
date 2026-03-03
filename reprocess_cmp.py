import sys
import os
import json
import mysql.connector
import subprocess

# Connect to database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="drugssearch"
)
cursor = conn.cursor(dictionary=True)

# Fetch latest report
cursor.execute("SELECT id, file_path FROM reports WHERE id=173")
row = cursor.fetchone()

if row:
    report_id = row['id']
    file_path_rel = row['file_path']
    abs_path = os.path.join("C:/xampp/htdocs/drugssearch", file_path_rel)
    
    print(f"Reprocessing Report {report_id}: {abs_path}")
    
    # Execute the XAMPP ocrspace_extract.py on this file!
    script_path = "C:/xampp/htdocs/drugssearch/ocrspace_extract.py"
    try:
        result = subprocess.run(['python', script_path, abs_path], capture_output=True, text=True)
        out = result.stdout
        # print("RAW SCRIPT OUTPUT:", out)
        
        # Parse output
        if "OCR OUTPUT:" in out:
            json_text = out.split("OCR OUTPUT:")[1].strip()
            
            # Verify if Bilirubin is in JSON
            if "Total Bilirubin" in json_text:
                print("SUCCESS: Bilirubin was successfully extracted!")
            if "Serum Albumin" in json_text:
                print("SUCCESS: Albumin was successfully extracted!")
            if "Glucose" in json_text:
                print("SUCCESS: Glucose was successfully extracted!")
            
            # Update DB!
            cursor.execute("UPDATE reports SET extracted_text = %s WHERE id = %s", (json_text, report_id))
            conn.commit()
            print("Successfully updated database with the new JSON data.")
        else:
            print("Failed to find OCR OUTPUT in script execution. Here is raw output:")
            print(out)
    except Exception as e:
        print("Error:", e)
        
conn.close()
