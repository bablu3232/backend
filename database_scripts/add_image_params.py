import mysql.connector

# New parameters derived from user images
new_parameters = [
    {
        "parameter_name": "RDW",
        "category": "Complete Blood Count",
        "unit": "%",
        "min_value": 11.6,
        "max_value": 14.0,
        "condition_if_abnormal": "Anisocytosis, possible anemia (iron deficiency, B12/folate deficiency)",
        "drug_category": "Vitamins/Minerals",
        "example_drugs": "Iron supplements, Vitamin B12, Folic acid",
        "summary": "RDW measures the variation in red blood cell volume and size."
    },
    {
        "parameter_name": "Chloride",
        "category": "Metabolic Panel",
        "unit": "mmol/L",
        "min_value": 96,
        "max_value": 106,
        "condition_if_abnormal": "Acid-base imbalance, dehydration, kidney issues",
        "drug_category": "Electrolytes",
        "example_drugs": "IV fluids, Electrolyte replacement",
        "summary": "Chloride is an important electrolyte that helps keep the amount of fluid inside and outside of your cells in balance."
    },
    {
        "parameter_name": "Carbon dioxide",
        "category": "Metabolic Panel",
        "unit": "mmol/L",
        "min_value": 23,
        "max_value": 29,
        "condition_if_abnormal": "Metabolic acidosis/alkalosis, respiratory issues",
        "drug_category": "Alkalinizing agents",
        "example_drugs": "Sodium Bicarbonate",
        "summary": "Measures the amount of carbon dioxide (in the form of bicarbonate) in the blood, indicating acid-base balance."
    },
    {
        "parameter_name": "Lipoprotein(a)",
        "category": "Lipid Profile",
        "unit": "mg/dL",
        "min_value": 0,
        "max_value": 30, # Often < 30 is considered normal
        "condition_if_abnormal": "Increased risk of cardiovascular disease",
        "drug_category": "PCSK9 Inhibitors / Niacin",
        "example_drugs": "Niacin, Repatha (Evolocumab)",
        "summary": "Lipoprotein(a) is a variant of LDL cholesterol. High levels are an independent risk factor for heart disease."
    },
    {
        "parameter_name": "Blood Urea",
        "category": "Renal Panel",
        "unit": "mg/dL",
        "min_value": 10,
        "max_value": 50,
        "condition_if_abnormal": "Kidney dysfunction, dehydration",
        "drug_category": "Diuretics / IV Fluids",
        "example_drugs": "Furosemide, IV Saline",
        "summary": "Measures the amount of urea in the blood. Elevated levels may indicate kidney impairment."
    }
]

def seed_missing_parameters():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="drugssearch"
        )
        cursor = conn.cursor()
        
        insert_query = """
        INSERT INTO lab_parameters 
        (parameter_name, category, unit, min_value, max_value, condition_if_abnormal, drug_category, example_drugs, summary) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        count = 0
        for param in new_parameters:
            # Check if parameter already exists to prevent duplicate insertion
            cursor.execute("SELECT id FROM lab_parameters WHERE parameter_name = %s", (param["parameter_name"],))
            if cursor.fetchone() is None:
                cursor.execute(insert_query, (
                    param["parameter_name"],
                    param["category"],
                    param["unit"],
                    param["min_value"],
                    param["max_value"],
                    param["condition_if_abnormal"],
                    param["drug_category"],
                    param["example_drugs"],
                    param["summary"]
                ))
                count += 1
                
        conn.commit()
        print(f"Successfully inserted {count} new missing parameters.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    print("Injecting missing parameters...")
    seed_missing_parameters()
