import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Intro Body P1
old_intro_p1 = '''add_body(
    "Co-administering ciprofloxacin hydrochloride with tinidazole delivers synergistic clinical efficacy against mixed aerobic-anaerobic pathogens "
    "in intra-abdominal, pelvic, or severe enteric infections [1,2]. Given harmonious pharmacokinetics and broad antimicrobial spectra, fixed-dose "
    "oral tablets (Floxotinazole FCT: 500 mg ciprofloxacin, 600 mg tinidazole) see widespread global utility."
)'''

new_intro_p1 = '''add_body(
    "Co-prescribing ciprofloxacin hydrochloride alongside tinidazole provides potent bactericidal synergy against poly-microbial pathogens "
    "inhabiting peritoneal, pelvic, or enteric niches [1,2]. Harmonious pharmacokinetics and broad antimicrobial spectra grant fixed-dose "
    "formulations (Floxotinazole FCT: 500 mg ciprofloxacin, 600 mg tinidazole) widespread international utility."
)'''

if old_intro_p1 in code:
    code = code.replace(old_intro_p1, new_intro_p1)
    print("Replaced Intro P1 successfully!")
else:
    print("FAILED Intro P1")

# Replace Reagents
old_reagents = '''add_heading_2("Reagents and Materials")
add_body(
    "Authentic reference materials of ciprofloxacin hydrochloride (98.86%) and tinidazole (98.60%) were utilized. Floxotinazole FCT tablets "
    "(500 mg ciprofloxacin, 600 mg tinidazole, mean mass: 1400 mg) were obtained from retail pharmacy stock. HPLC solvents (methanol, ethanol) "
    "originated from Merck (Darmstadt). Orthophosphoric acid (85%), triethanolamine (TEA), hydrochloric acid, sodium hydroxide, and peroxide (30%) "
    "came from Sigma-Aldrich; deionized water (> 18.2 MΩ·cm) from a Milli-Q system."
)'''

new_reagents = '''add_heading_2("Reagents and Materials")
add_body(
    "Certified primary calibrators of ciprofloxacin hydrochloride (98.86%) plus tinidazole (98.60%) arrived with batch certificates. Finished "
    "Floxotinazole FCT caplets (label claim: 500 mg ciprofloxacin, 600 mg tinidazole; average pill mass 1400 mg) originated from licensed "
    "dispensaries. HPLC-grade methanol and absolute ethanol originated from Merck (Darmstadt). Orthophosphoric acid (85%), triethanolamine (TEA), "
    "hydrochloric acid, sodium hydroxide, and peroxide (30%) came from Sigma-Aldrich; ultrapure water (> 18.2 MΩ·cm) was dispensed by a Milli-Q unit."
)'''

if old_reagents in code:
    code = code.replace(old_reagents, new_reagents)
    print("Replaced Reagents successfully!")
else:
    print("FAILED Reagents")

# Replace Chromatographic Conditions
old_cond = '''add_heading_2("Chromatographic Conditions")
add_body(
    "Separation used a C18 column (250 × 4.6 mm, 5 µm, USP L1) on an Agilent 1100 HPLC system equipped with quaternary pump, autosampler, "
    "thermostat, and DAD.\\n\\n"
    "Isocratic mobile phase comprised methanol-ethanol-Solution C (10:10:80 v/v/v). Buffer Solution C contained 0.025 M aqueous orthophosphoric acid "
    "adjusted to pH 3.0 ± 0.05 via triethanolamine, filtered (0.45 µm nylon membrane), ultrasonically degassed (15 min), pumped at 1.5 mL/min "
    "(30°C; 10-µL injections, 315 nm detection), maintaining backpressure around 145 bar."
)'''

new_cond = '''add_heading_2("Chromatographic Conditions")
add_body(
    "Liquid chromatography was conducted using an Agilent 1100 HPLC unit (C18 column, 250 × 4.6 mm, 5 µm, USP L1) equipped with quaternary pump, "
    "autosampler, thermostat compartment, and DAD optics.\\n\\n"
    "The ternary mobile phase blended HPLC methanol, absolute ethanol, and aqueous modifier Solution C (10:10:80 v/v/v). Buffer Solution C comprised "
    "0.025 M orthophosphoric acid titrated to pH 3.0 ± 0.05 via triethanolamine, vacuum-clarified (0.45 µm nylon membrane), cavitation-degassed "
    "(15 min), and delivered isocratically at 1.5 mL/min (30°C; 10-µL loops, 315 nm detection), maintaining backpressure around 145 bar."
)'''

if old_cond in code:
    code = code.replace(old_cond, new_cond)
    print("Replaced Conditions successfully!")
else:
    print("FAILED Conditions")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py successfully!")
