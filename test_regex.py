import re

line_stripped = "Hemoglobin (Hb)  12.5  Low 13.0 - 17.0  g/dL"
match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s{2,}([\d.]+)', line_stripped)
if match:
    print("Match 1:", match.group(1))
    print("Match 2:", match.group(2))
else:
    print("No Match A")

line_stripped = "Packed Cell Volume (PCV)  57.5  High 40 - 50  %"
match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s{2,}([\d.]+)', line_stripped)
if match:
    print("Match 1:", match.group(1))
    print("Match 2:", match.group(2))
else:
    print("No Match A")

line_stripped = "Mean Corpuscular Volume (MCV)  87.75  83 - 101  fL"
match = re.search(r'^([A-Za-z][A-Za-z\s.\-\'/!()]+?)\s{2,}([\d.]+)', line_stripped)
if match:
    print("Match 1:", match.group(1))
    print("Match 2:", match.group(2))
else:
    print("No Match A")
