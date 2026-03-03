import sys
import os

with open("C:/xampp/htdocs/drugssearch/ocrspace_extract.py", "r", encoding="utf-8") as f:
    code = f.read()

# Modify the code to use ocr_debug.txt instead of calling the API
# Find the extract_text_with_ocrspace block and replace it
code = code.replace(
    'raw_text = extract_text_with_ocrspace(file_path)',
    'with open("C:/xampp/htdocs/drugssearch/ocr_debug.txt", "r", encoding="utf-8") as rf:\n    raw_text = rf.read()\nprint("Loaded raw_text of length:", len(raw_text))'
)

# Insert print statements into try_add_parameter
code = code.replace(
    'def try_add_parameter(canonical_name, value, db_param):',
    'def try_add_parameter(canonical_name, value, db_param):\n    print(f"TRY ADD: {canonical_name}, {value}")'
)

code = code.replace(
    'value_str = match.group(2).rstrip(\'.\')',
    'value_str = match.group(2).rstrip(\'.\')\n    print(f"REGEX MATCHED: {param_name_raw} = {value_str}")'
)

with open("C:/xampp/htdocs/drugssearch/test_diag.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Wrote diagnostic script")
