import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace keywords
code = code.replace(
    'r_kw_body = p_kw.add_run("Ciprofloxacin Hydrochloride; Tinidazole; Floxotinazole FCT; Green HPLC; 80% Aqueous Buffer; Stability-Indicating; WAC (RGB12); BAGI; AES; Carbon Footprint; MoGAPI; ComplexMoGAPI; AGSA; GEARS; AGREE.")',
    'r_kw_body = p_kw.add_run("Ciprofloxacin HCl; Tinidazole; Floxotinazole FCT; Green HPLC; Aqueous Buffer; Stability-Indicating; WAC RGB12; BAGI; AES; Carbon Footprint; MoGAPI; ComplexMoGAPI; AGSA; GEARS; AGREE.")'
)

# Replace Standard and Sample prep
old_prep = '''add_heading_2("Standard and Sample Preparation")
add_body(
    "Stock Standard Preparation: Accurately weighed 23.3 mg ciprofloxacin HCl and 24.0 mg tinidazole dissolved in eluent (10-mL flask, sonicated 1 min); "
    "subsequent 5.0-to-50 mL dilution gave working standards (0.233 mg/mL ciprofloxacin HCl, 0.240 mg/mL tinidazole) filtered through 0.45 µm PTFE discs.\\n\\n"
    "Tablet Assay Preparation: Ten Floxotinazole FCT tablets (mean weight: 1400 mg) were powdered in an agate mortar. Accurately weighed powder "
    "(560.0 mg, containing ~232.88 mg ciprofloxacin HCl and 240.0 mg tinidazole) was dispersed in ~60 mL eluent within a 100-mL flask, agitated (2 min), "
    "and sonicated (3 min). Volumetric dilution, followed by secondary 5.0-to-50 mL dilution and 0.45 µm PTFE filtration, furnished test specimens."
)'''

new_prep = '''add_heading_2("Standard and Sample Preparation")
add_body(
    "Stock Standard Preparation: Weighed 23.3 mg ciprofloxacin HCl and 24.0 mg tinidazole dissolved in eluent (10-mL flask, sonicated 1 min); "
    "5.0-to-50 mL dilution gave working standards (0.233 mg/mL ciprofloxacin HCl, 0.240 mg/mL tinidazole) filtered through 0.45 µm PTFE discs.\\n\\n"
    "Tablet Assay Preparation: Ten Floxotinazole FCT tablets (mean weight: 1400 mg) were pulverized. Powder (560.0 mg, containing ~232.88 mg "
    "ciprofloxacin HCl, 240.0 mg tinidazole) was dispersed in ~60 mL eluent (100-mL flask), agitated (2 min), and sonicated (3 min). Bringing to mark, "
    "secondary 5.0-to-50 mL dilution, and 0.45 µm PTFE filtration furnished test specimens."
)'''

code = code.replace(old_prep, new_prep)

# Replace Validation and Forced Deg
old_val = '''add_heading_2("Method Validation and Forced Degradation")
add_body(
    "Validation observed ICH Q2(R2) and USP 36-NF31 protocols assessing system suitability (n = 6), specificity, linearity (50%–150%), "
    "precision (repeatability n = 6; inter-analyst intermediate ruggedness), accuracy (50%, 100%, 150% spikes, n = 3), and detection thresholds (LOD, LOQ).\\n\\n"
    "Tablet aliquots underwent five stress challenges per ICH Q1A(R2): acid (1.0 M HCl, 60°C, 2 h), base (0.1 M NaOH, 60°C, 1 h), "
    "peroxide (30% H2O2, 4 h), heat (dry, 80°C, 24 h), plus UV photolysis (254 nm, 24 h), monitored via DAD photodiode purity."
)'''

new_val = '''add_heading_2("Method Validation and Forced Degradation")
add_body(
    "Validation observed ICH Q2(R2) and USP 36-NF31 protocols for system suitability (n = 6), specificity, linearity (50%–150%), "
    "precision (repeatability n = 6; intermediate ruggedness), accuracy (50%, 100%, 150% spikes, n = 3), and thresholds (LOD, LOQ).\\n\\n"
    "Tablet aliquots underwent five stress challenges per ICH Q1A(R2): acid (1.0 M HCl, 60°C, 2 h), alkali (0.1 M NaOH, 60°C, 1 h), "
    "peroxide (30% H2O2, 4 h), heat (80°C, 24 h), and UV photolysis (254 nm, 24 h), monitored via DAD purity."
)'''

code = code.replace(old_val, new_val)

# Replace Multi-Dimensional Assessment
old_multi = '''add_heading_2("Multi-Dimensional Green, White, and Blue Assessment")
add_body(
    "The developed assay was benchmarked against reported isocratic HPLC [6], gradient HPLC [7], and planar HPTLC [9] monographs "
    "(Table 6, Figures 4 and 5).\\n\\n"
    "Employing an 80% aqueous eluent elevated GEARS solvent evaluation to 92.13%, surpassing traditional acetonitrile assays (78.63%) "
    "and planar TLC (31.40%). MoGAPI and ComplexMoGAPI reached 70.00 and 72.50 via dilute-and-shoot preparation and safe effluent streams. "
    "AGSA and AGSA-Prep polygonal star indices attained 42.15% and 58.40%, alongside an AGREE score of 0.81.\\n\\n"
    "White Analytical Chemistry (RGB12) calculated 87.17% total whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), while BAGI practical "
    "blueness registered 85.0/100. Analytical Eco-Scale tallied 91/100 (9 penalty points), and carbon emissions totaled 0.00112 kg CO2 "
    "eq/sample—over seven-fold lower than conventional HPLC (0.00820 kg CO2 eq)."
)'''

new_multi = '''add_heading_2("Multi-Dimensional Green, White, and Blue Assessment")
add_body(
    "The developed assay was benchmarked against reported isocratic HPLC [6], gradient HPLC [7], and planar HPTLC [9] monographs "
    "(Table 6, Figures 4 and 5).\\n\\n"
    "Employing an 80% aqueous eluent elevated GEARS solvent score to 92.13%, surpassing traditional acetonitrile assays (78.63%) "
    "and planar TLC (31.40%). MoGAPI and ComplexMoGAPI scored 70.00 and 72.50 via dilute-and-shoot preparation and benign waste. "
    "AGSA and AGSA-Prep star areas reached 42.15% and 58.40%, alongside an AGREE rating of 0.81.\\n\\n"
    "White Analytical Chemistry (RGB12) gave 87.17% whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), while BAGI blueness registered "
    "85.0/100. Analytical Eco-Scale scored 91/100 (9 penalty points), with carbon emissions of 0.00112 kg CO2 eq/sample—seven-fold "
    "below conventional HPLC (0.00820 kg CO2 eq)."
)'''

code = code.replace(old_multi, new_multi)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py successfully!")
