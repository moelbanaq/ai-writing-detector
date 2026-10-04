import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Method Development & Optimization (lines 226-235)
old_1 = '''add_heading_2("Method Development and Optimization")
add_body(
    "Ciprofloxacin (pKa 6.09, 8.74) and tinidazole (pKa 1.3) have vastly different acid-base behaviors. Conventional methods use high "
    "concentrations of acetonitrile to pull tinidazole off the column quickly, often causing peak distortion.\\n\\n"
    "Method optimization sought to minimize organic consumption while preserving chromatographic resolution. Buffering at pH 3.0 "
    "suppressed silanol ionization and maintained ciprofloxacin protonation, while triethanolamine acted as a sacrificial base competitor "
    "to eliminate peak tailing. The ternary mobile phase (methanol:ethanol:Solution C, 10:10:80 v/v/v) yielded sharp symmetrical peaks "
    "for both analytes, maintaining hydraulic backpressure at ~145 bar due to the high aqueous content (80%). Tinidazole eluted at "
    "10.92 min and ciprofloxacin at 14.48 min, achieving baseline resolution (Rs = 5.72) within an 18-min run window."
)'''

new_1 = '''add_heading_2("Method Development and Optimization")
add_body(
    "Ciprofloxacin (pKa 6.09, 8.74) versus tinidazole (pKa 1.3) exhibit divergent ionization traits. Published monographs consume heavy "
    "acetonitrile fractions to elute tinidazole, risking band distortion.\\n\\n"
    "Method screening suppressed petrochemical waste while securing baseline resolution. Maintaining pH 3.0 masked accessible silanols to "
    "preserve cationic ciprofloxacin, whilst triethanolamine competed against silanol sites to abolish peak asymmetry. The ternary mobile phase "
    "(methanol-ethanol-Solution C, 10:10:80 v/v/v) furnished sharp symmetric peaks under ~145 bar column pressure. Tinidazole eluted at "
    "10.92 min and ciprofloxacin at 14.48 min, yielding baseline resolution (Rs = 5.72) within 18 min."
)'''

# 2. System Suitability & Specificity (lines 237-244)
old_2 = '''add_heading_2("System Suitability and Specificity")
add_body(
    "Six consecutive standard injections satisfied USP and ICH specifications (Table 1). Retention precision gave %RSD of 0.35% "
    "for both analytes, while peak area repeatability reached 0.35% %RSD. Column efficiency reached 7,882 theoretical plates (tinidazole) "
    "and 6,216 plates (ciprofloxacin), with USP tailing factors of 1.06 and 1.22.\\n\\n"
    "Figure 2 depicts chromatograms of diluent blank, placebo excipients, working standard, and tablet extract. Placebo excipients showed "
    "zero peaks within drug retention windows, while DAD spectral purity profiling verified uniform absorbance across each peak."
)'''

new_2 = '''add_heading_2("System Suitability and Specificity")
add_body(
    "Six replicate standard injections met USP and ICH criteria (Table 1). Retention time precision exhibited 0.35% %RSD across both "
    "analytes; peak area repeatability similarly scored 0.35% %RSD. Efficiency reached 7,882 theoretical plates (tinidazole) and 6,216 plates "
    "(ciprofloxacin), alongside USP tailing factors of 1.06 and 1.22.\\n\\n"
    "Representative chromatograms (Figure 2) verify blank diluent and excipient placebo selectivity: no interfering peaks co-eluted within "
    "analyte windows, while diode array spectral purity confirmed homogeneous absorbance across all peak profiles."
)'''

# 3. Linearity (lines 285-292)
old_3 = '''add_heading_2("Linearity, Range, and Sensitivity")
add_body(
    "Five-point calibration plots spanned 50%–150% of target working concentrations (Table 2, Figure 1). Least-squares regression "
    "yielded y = 7,723.6x + 1,240.0 (R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) and y = 8,627.9x + 1,850.0 (R² = 0.99997) "
    "for tinidazole (120.0–360.0 µg/mL), with homoscedastic residual distributions. Detection limits (LOD) were 0.0125 µg "
    "(1.25 µg/mL) for ciprofloxacin and 0.0105 µg (1.05 µg/mL) for tinidazole, with quantitation limits (LOQ) of 0.0380 µg "
    "(3.80 µg/mL) and 0.0317 µg (3.17 µg/mL)."
)'''

new_3 = '''add_heading_2("Linearity, Range, and Sensitivity")
add_body(
    "Five-point calibration curves spanned 50%–150% target ranges (Table 2, Figure 1). Linear calibrations yielded y = 7,723.6x + 1,240.0 "
    "(R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) alongside y = 8,627.9x + 1,850.0 (R² = 0.99997) for tinidazole (120.0–360.0 µg/mL), "
    "exhibiting homoscedastic variance. Detection thresholds (LOD) were 0.0125 µg (1.25 µg/mL, ciprofloxacin) and 0.0105 µg (1.05 µg/mL, tinidazole); "
    "quantitation limits (LOQ) evaluated to 0.0380 µg (3.80 µg/mL) and 0.0317 µg (3.17 µg/mL)."
)'''

# 4. Accuracy & Precision (lines 333-340)
old_4 = '''add_heading_2("Accuracy, Precision, and Ruggedness")
add_body(
    "Spiking inactive excipient blends across 50%, 100%, and 150% levels (n = 9, Table 3) demonstrated mean analytical recoveries of "
    "100.90% (%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, satisfying standard regulatory limits "
    "(98.0%–102.0%).\\n\\n"
    "Assaying six commercial tablet preparations yielded mean contents of 100.94% (%RSD = 0.60%) for ciprofloxacin and 100.12% "
    "(%RSD = 0.60%) for tinidazole (Table 4); inter-analyst intermediate precision across separate operating sessions retained %RSD below 0.53%."
)'''

new_4 = '''add_heading_2("Accuracy, Precision, and Ruggedness")
add_body(
    "Spike-recovery assays across 50%, 100%, 150% concentrations (n = 9, Table 3) yielded mean recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin "
    "and 100.19% (%RSD = 0.24%) for tinidazole, fulfilling pharmacopeial benchmarks (98.0%–102.0%).\\n\\n"
    "Assaying commercial Floxotinazole FCT tablets (n = 6) yielded 100.94% (%RSD = 0.60%) ciprofloxacin and 100.12% (%RSD = 0.60%) tinidazole "
    "(Table 4); inter-analyst ruggedness remained < 0.53% %RSD across distinct test days."
)'''

# 5. Forced Degradation (lines 384-391)
old_5 = '''add_heading_2("Stability-Indicating Forced Degradation Studies")
add_body(
    "Forced degradation trials subjected tablet formulations to five stress environments (Table 5, Figure 3). Both actives resisted "
    "acidic, thermal, and photolytic degradation (loss < 5%), while alkaline digestion (0.1 M NaOH at 60°C) induced moderate loss "
    "(< 8%). In contrast, 30% H2O2 provoked 43.8% degradation, forming a prominent breakdown product at 6.20 min that resolved "
    "cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). DAD spectral purity angles remained strictly below purity "
    "thresholds throughout, establishing stability-indicating capability."
)'''

new_5 = '''add_heading_2("Stability-Indicating Forced Degradation Studies")
add_body(
    "Stress challenges tested product stability across five destructive conditions (Table 5, Figure 3). Active molecules withstood acid, "
    "thermal stress, and photolysis (< 5% breakdown), with minor alkaline loss (< 8% in 0.1 M NaOH at 60°C). In contrast, 30% H2O2 caused "
    "43.8% oxidative degradation, resolving a single degradant band at 6.20 min cleanly away from tinidazole (Rs = 4.72) and ciprofloxacin "
    "(Rs > 8.0). Spectral purity angles remained below purity thresholds across all peaks, proving stability-indicating selectivity."
)'''

# 6. Multi-Dimensional Assessment (lines 430-442)
old_6 = '''add_heading_2("Multi-Dimensional Green, White, and Blue Assessment")
add_body(
    "We compared the method against three published procedures: conventional isocratic HPLC [6], gradient HPLC [7], "
    "and planar HPTLC [9] (Table 6, Figures 4 and 5).\\n\\n"
    "Formulating an 80% aqueous eluent elevated the GEARS solvent score to 92.13%, outperforming conventional acetonitrile "
    "methods (78.63%) and planar HPTLC (31.40%). MoGAPI and ComplexMoGAPI ratings reached 70.00 and 72.50, driven by direct "
    "sample preparation and environmentally benign waste streams. AGSA and AGSA-Prep polygonal star areas attained 42.15% "
    "and 58.40%, while the AGREE greenness metric scored 0.81.\\n\\n"
    "Evaluation via White Analytical Chemistry (WAC / RGB12) registered 87.17% total whiteness (Red: 91.0%, Green: 88.0%, "
    "Blue: 82.5%), whereas the BAGI blueness index scored 85.0/100, driven by direct C18 compatibility and dilute-and-shoot execution. "
    "Deducting 9 penalty points afforded an Analytical Eco-Scale rating of 91/100, and carbon emission profiling indicated 0.00112 kg "
    "CO2 eq/sample—seven-fold below conventional HPLC (0.00820 kg CO2 eq)."
)'''

new_6 = '''add_heading_2("Multi-Dimensional Green, White, and Blue Assessment")
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

# 7. Conclusion (lines 512-520)
old_7 = '''add_heading_1("Conclusion")
add_body(
    "This study established and validated an isocratic RP-HPLC assay for quantifying ciprofloxacin hydrochloride and tinidazole "
    "in commercial tablets. Formulating an 80% aqueous eluent with 10% bio-ethanol and 10% methanol omitted acetonitrile whilst "
    "maintaining baseline chromatographic resolution (Rs = 5.72). Validation fulfilled ICH Q2(R2) and USP 36-NF31 specifications, "
    "cleanly separating degradants across five stress challenges. Comprehensive evaluation across ten sustainability, whiteness, "
    "and blueness metrics verified lower solvent hazards, reduced waste, and superior operational simplicity over reported "
    "monographs, confirming suitability for routine release and stability monitoring."
)'''

new_7 = '''add_heading_1("Conclusion")
add_body(
    "An isocratic green RP-HPLC assay successfully quantifies ciprofloxacin hydrochloride and tinidazole in commercial Floxotinazole FCT tablets. "
    "Utilizing an 80% aqueous buffer with renewable ethanol and methanol excluded hazardous acetonitrile while achieving baseline chromatographic "
    "separation (Rs = 5.72). Method qualification fulfilled ICH Q2(R2) and USP 36-NF31 standards, cleanly resolving stress degradants. Multi-criteria "
    "evaluation across ten green, white, and blue metrics demonstrated reduced toxicity, minimal carbon emissions, and high practical throughput for "
    "pharmaceutical quality control."
)'''

pairs = [(old_1, new_1, "Method Dev"), (old_2, new_2, "Sys Suit"), (old_3, new_3, "Linearity"),
         (old_4, new_4, "Accuracy"), (old_5, new_5, "Forced Deg"), (old_6, new_6, "Multi-Dim"), (old_7, new_7, "Conclusion")]

for o, n, label in pairs:
    if o in code:
        code = code.replace(o, n)
        print(f"SUCCESS: Replaced {label}")
    else:
        print(f"FAILED: Could not find {label}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py successfully!")
