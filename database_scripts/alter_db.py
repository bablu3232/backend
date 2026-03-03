import mysql.connector
import sys

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="", # Assuming default XAMPP password
        database="drugssearch"
    )
    cursor = conn.cursor()

    # Add recommendation column
    try:
        cursor.execute("ALTER TABLE report_parameters ADD COLUMN recommendation TEXT DEFAULT NULL")
        print("Column 'recommendation' added successfully.")
    except mysql.connector.Error as err:
        print(f"Error adding 'recommendation': {err}")

    # Drop is_normal column
    try:
        cursor.execute("ALTER TABLE report_parameters DROP COLUMN is_normal")
        print("Column 'is_normal' dropped successfully.")
    except mysql.connector.Error as err:
        print(f"Error dropping 'is_normal': {err}")

    conn.close()

except mysql.connector.Error as err:
    print(f"Error connecting to DB: {err}")
