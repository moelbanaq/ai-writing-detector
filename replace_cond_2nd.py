import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

old_cond_pattern = re.search(r'add_heading_2\("Chromatographic Conditions"\)\s*add_body\((.*?)\)\s*add_heading_2\("Standard and Sample Preparation"\)', code, re.DOTALL)

if old_cond_pattern:
    new_cond = '''add_heading_2("Chromatographic Conditions")
add_body(
    "Liquid chromatography was conducted using an Agilent 1100 HPLC unit (C18 column, 250 × 4.6 mm, 5 µm, USP L1) equipped with quaternary pump, "
    "autosampler, thermostat compartment, and DAD optics.\\n\\n"
    "The ternary mobile phase blended HPLC methanol, absolute ethanol, and aqueous modifier Solution C (10:10:80 v/v/v). Buffer Solution C comprised "
    "0.025 M orthophosphoric acid titrated to pH 3.0 ± 0.05 via triethanolamine, vacuum-clarified (0.45 µm nylon membrane), cavitation-degassed "
    "(15 min), and delivered isocratically at 1.5 mL/min (30°C; 10-µL loops, 315 nm detection), maintaining backpressure around 145 bar."
)

add_heading_2("Standard and Sample Preparation")'''
    code = code[:old_cond_pattern.start()] + new_cond + code[old_cond_pattern.end():]
    print("Replaced Chromatographic Conditions via regex successfully!")
else:
    print("Could not find Chromatographic Conditions regex pattern!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py")
