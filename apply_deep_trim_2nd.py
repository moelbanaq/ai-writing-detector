import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Authors
code = code.replace(
    'add_authors(\n    "Ahmed Salah1*, Ayman Goda1",\n    "1 Department of Analytical Chemistry, Faculty of Science, Zagazig University, Zagazig 44519, Egypt",\n    "Corresponding Author: a.salaheldin23@science.zu.edu.eg"\n)',
    'add_authors(\n    "Ahmed Salah* and Ayman Goda",\n    "Department of Analytical Chemistry, Faculty of Science, Zagazig University, Zagazig 44519, Egypt",\n    "Correspondence: a.salaheldin23@science.zu.edu.eg"\n)'
)

# Keywords
code = code.replace(
    'r_kw_body = p_kw.add_run("Ciprofloxacin HCl; Tinidazole; Floxotinazole FCT; Green HPLC; Aqueous Buffer; Stability-Indicating; WAC RGB12; BAGI; AES; Carbon Footprint; MoGAPI; ComplexMoGAPI; AGSA; GEARS; AGREE.")',
    'r_kw_body = p_kw.add_run("Ciprofloxacin HCl; Tinidazole; Green HPLC; WAC; BAGI; AES; MoGAPI; AGSA; GEARS.")'
)

# Intro P3
code = code.replace(
    '"Validation observed ICH Q2(R2) criteria, complemented by ten multi-metric sustainability, whiteness, "\n    "and applicability tools: MoGAPI [16], ComplexMoGAPI [17], AGSA [18], GEARS [19], AGSA-Prep [20], AGREE [21], WAC RGB12 [14,24], BAGI [22], "\n    "AES [23], alongside carbon footprint appraisal."',
    '"Validation followed ICH Q2(R2) criteria, complemented by multi-metric sustainability, whiteness, "\n    "and applicability profiling: MoGAPI [16], ComplexMoGAPI [17], AGSA [18], GEARS [19], AGSA-Prep [20], AGREE [21], WAC RGB12 [14,24], BAGI [22], "\n    "AES [23], and carbon footprint."'
)

# Accuracy
code = code.replace(
    '"Spike-recovery assays across 50%, 100%, 150% concentrations (n = 9, Table 3) yielded mean recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin "\n    "and 100.19% (%RSD = 0.24%) for tinidazole, fulfilling pharmacopeial benchmarks (98.0%–102.0%).\\n\\n"\n    "Assaying commercial Floxotinazole FCT tablets (n = 6) yielded 100.94% (%RSD = 0.60%) ciprofloxacin, 100.12% (%RSD = 0.60%) tinidazole "\n    "(Table 4); inter-analyst ruggedness remained < 0.53% %RSD across distinct test days."',
    '"Spike-recovery assays across 50%, 100%, 150% concentrations (n = 9, Table 3) yielded mean recoveries of 100.90% (%RSD 0.29%, ciprofloxacin) "\n    "and 100.19% (%RSD 0.24%, tinidazole), meeting 98.0%–102.0% limits.\\n\\n"\n    "Commercial Floxotinazole FCT tablet assays (n = 6) gave 100.94% (%RSD 0.60%) ciprofloxacin and 100.12% (%RSD 0.60%) tinidazole "\n    "(Table 4); intermediate precision remained < 0.53% %RSD across days."'
)

# Forced Deg
code = code.replace(
    '"Stress challenges tested product stability across five destructive conditions (Table 5, Figure 3). Active molecules withstood acid, "\n    "thermal stress, and photolysis (< 5% breakdown), with minor alkaline loss (< 8% in 0.1 M NaOH at 60°C). In contrast, 30% H2O2 caused "\n    "43.8% oxidative degradation, resolving a single degradant band at 6.20 min cleanly away from tinidazole (Rs = 4.72) and ciprofloxacin "\n    "(Rs > 8.0). Spectral purity angles remained below purity thresholds across all peaks, proving stability-indicating selectivity."',
    '"Stress challenges tested stability across five conditions (Table 5, Figure 3). Active drugs withstood acid, heat, and photolysis (< 5% loss), "\n    "with minor alkaline loss (< 8% in 0.1 M NaOH at 60°C). In contrast, 30% H2O2 provoked 43.8% oxidative degradation, resolving a degradant at 6.20 min "\n    "cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). Spectral purity angles remained below thresholds across all peaks, confirming stability-indicating selectivity."'
)

# Multi-Dim
code = code.replace(
    '"Employing an 80% aqueous eluent elevated GEARS solvent evaluation to 92.13%, surpassing traditional acetonitrile assays (78.63%) "\n    "and planar TLC (31.40%). MoGAPI and ComplexMoGAPI reached 70.00 and 72.50 via dilute-and-shoot preparation and safe effluent streams. "\n    "AGSA and AGSA-Prep polygonal star indices attained 42.15% and 58.40%, alongside an AGREE score of 0.81.\\n\\n"\n    "White Analytical Chemistry (RGB12) calculated 87.17% total whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), while BAGI practical "\n    "blueness registered 85.0/100. Analytical Eco-Scale tallied 91/100 (9 penalty points), and carbon emissions totaled 0.00112 kg CO2 "\n    "eq/sample—over seven-fold lower than conventional HPLC (0.00820 kg CO2 eq)."',
    '"Formulating an 80% aqueous eluent elevated GEARS solvent evaluation to 92.13%, surpassing conventional acetonitrile assays (78.63%) "\n    "and planar TLC (31.40%). MoGAPI and ComplexMoGAPI reached 70.00 and 72.50 via dilute-and-shoot preparation; AGSA and AGSA-Prep star areas "\n    "reached 42.15% and 58.40%, with AGREE scoring 0.81.\\n\\n"\n    "White Analytical Chemistry (RGB12) gave 87.17% whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), while BAGI registered 85.0/100. "\n    "Analytical Eco-Scale scored 91/100 (9 penalty points); carbon emissions were 0.00112 kg CO2 eq/sample—seven-fold below conventional HPLC (0.00820 kg CO2 eq)."'
)

# Fig 4 & 5 Captions
code = code.replace(
    'Figure 4. Green analytical profile: (A) MoGAPI/ComplexMoGAPI; (B) AGSA radar; (C) AGSA-Prep radar; (D) GEARS solvent rating; (E) AGREE pictogram; (F) Quantitative benchmarking.',
    'Figure 4. Green analytical profile: (A) MoGAPI/ComplexMoGAPI; (B) AGSA; (C) AGSA-Prep; (D) GEARS rating; (E) AGREE pictogram; (F) Benchmarking.'
)
code = code.replace(
    'Figure 5. White and Blue profile: (A) WAC (RGB12, 87.17%); (B) BAGI asteroid (85.0/100); (C) Analytical Eco-Scale score (91/100); (D) Direct carbon footprint benchmarking.',
    'Figure 5. White and Blue profile: (A) WAC (87.17%); (B) BAGI (85.0/100); (C) Analytical Eco-Scale (91/100); (D) Carbon footprint benchmarking.'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py with deep trimming successfully!")
