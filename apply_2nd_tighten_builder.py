import re
import os
import docx

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Abstract
old_abs_pattern = re.search(r'r_ab_body = p_abs\.add_run\((.*?)\)\s*r_ab_body\.font\.size', content, re.DOTALL)
if old_abs_pattern:
    new_abs = '''r_ab_body = p_abs.add_run(
    "An isocratic green RP-HPLC assay quantifies ciprofloxacin hydrochloride and tinidazole simultaneously in commercial Floxotinazole FCT tablets. "
    "Acetonitrile was omitted, utilizing an 80% aqueous eluent (methanol:ethanol:0.025 M orthophosphoric acid, pH 3.0 via triethanolamine, 10:10:80 v/v/v) "
    "at 1.5 mL/min across a C18 column (250 × 4.6 mm, 5 µm; 315 nm detection). Baseline resolution (Rs = 5.72 ± 0.02) resolved tinidazole (10.92 ± 0.04 min) "
    "and ciprofloxacin (14.48 ± 0.05 min). ICH Q2(R2) and USP 36-NF31 validation confirmed linearity (R² = 0.99997 both actives), repeatability %RSD of 0.60%, "
    "intermediate precision %RSD < 0.53%, with recoveries of 100.90% (ciprofloxacin) and 100.19% (tinidazole). Forced degradation under acid, alkali, "
    "peroxide (30% H2O2 breakdown 43.8%), thermal, and UV photolysis confirmed degradant resolution with spectral peak purity. Sustainability benchmarking "
    "encompassed ten metrics: MoGAPI (70.00 vs 40.00), ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15% vs 20.00%), GEARS Solvent (92.13% vs 78.63%), "
    "AGSA-Prep (58.40% vs 28.00%), AGREE (0.81 vs 0.55), WAC Whiteness (87.17% vs 60.00%), BAGI (85.0 vs 55.0), Analytical Eco-Scale (91 vs 65), and "
    "Carbon Footprint (0.00112 vs > 0.008 kg CO2 eq/sample), establishing an eco-friendly protocol for industrial batch release."
)
r_ab_body.font.size'''
    content = content[:old_abs_pattern.start()] + new_abs + content[old_abs_pattern.end():]
    print("Replaced Abstract successfully!")
else:
    print("Could not find Abstract pattern!")

# Replace Introduction paragraphs
intro_block_old = re.search(r'add_heading_1\("Introduction"\)\s*add_body\((.*?)\)\s*add_body\((.*?)\)\s*add_body\((.*?)\)\s*# -------------------------------------------------------------\s*# 3\. Experimental', content, re.DOTALL)
if intro_block_old:
    new_intro = '''add_heading_1("Introduction")
add_body(
    "Co-administering ciprofloxacin hydrochloride with tinidazole delivers synergistic clinical efficacy against mixed aerobic-anaerobic pathogens "
    "in intra-abdominal, pelvic, or severe enteric infections [1,2]. Given harmonious pharmacokinetics and broad antimicrobial spectra, fixed-dose "
    "oral tablets (Floxotinazole FCT: 500 mg ciprofloxacin, 600 mg tinidazole) see widespread global utility."
)
add_body(
    "Pharmacopeias require stability-indicating assays for finished solid dosage forms to track intact actives alongside excipients plus breakdown "
    "impurities [3-5]. Published monographs for this dual regimen rely upon acetonitrile-phosphate eluents (20%–40% v/v) or intricate gradients [6-10]. "
    "Acetonitrile is a volatile petrochemical derivative emitting hazardous hydrogen cyanide during thermal incineration [11,12], whilst planar "
    "chromatography (HPTLC) utilizes chlorinated extractants (chloroform, toluene) coupled with liquid partitioning [9]."
)
add_body(
    "Guided by Green Analytical Chemistry [13] and White Analytical Chemistry [14] principles, replacing hazardous modifiers with aqueous buffers and "
    "renewable alcohols reduces occupational exposure while diminishing toxic waste [15]. We present an isocratic RP-HPLC assay deploying an 80% aqueous "
    "buffer with 10% bio-ethanol and 10% methanol. Validation observed ICH Q2(R2) criteria, complemented by ten multi-metric sustainability, whiteness, "
    "and applicability tools: MoGAPI [16], ComplexMoGAPI [17], AGSA [18], GEARS [19], AGSA-Prep [20], AGREE [21], WAC RGB12 [14,24], BAGI [22], "
    "AES [23], alongside carbon footprint appraisal."
)

# -------------------------------------------------------------
# 3. Experimental'''
    content = content[:intro_block_old.start()] + new_intro + content[intro_block_old.end():]
    print("Replaced Introduction successfully!")
else:
    print("Could not find Introduction block!")

# Replace Experimental Section
exp_block_old = re.search(r'# 3\. Experimental\s*# -------------------------------------------------------------\s*add_heading_1\("Experimental Section"\)(.*?)# -------------------------------------------------------------\s*# 4\. Results and Discussion', content, re.DOTALL)
if exp_block_old:
    new_exp = '''# 3. Experimental
# -------------------------------------------------------------
add_heading_1("Experimental Section")

add_heading_2("Reagents and Materials")
add_body(
    "Authentic reference materials of ciprofloxacin hydrochloride (98.86%) and tinidazole (98.60%) were utilized. Floxotinazole FCT tablets "
    "(500 mg ciprofloxacin, 600 mg tinidazole, mean mass: 1400 mg) were obtained from retail pharmacy stock. HPLC solvents (methanol, ethanol) "
    "originated from Merck (Darmstadt). Orthophosphoric acid (85%), triethanolamine (TEA), hydrochloric acid, sodium hydroxide, and peroxide (30%) "
    "were supplied by Sigma-Aldrich; deionized water (> 18.2 MΩ·cm) came from a Milli-Q system."
)

add_heading_2("Chromatographic Conditions")
add_body(
    "Separation used a C18 column (250 × 4.6 mm, 5 µm, USP L1) on an Agilent 1100 HPLC system equipped with quaternary pump, autosampler, "
    "thermostat, and DAD.\\n\\n"
    "Isocratic mobile phase comprised methanol-ethanol-Solution C (10:10:80 v/v/v). Buffer Solution C contained 0.025 M aqueous orthophosphoric acid "
    "adjusted to pH 3.0 ± 0.05 via triethanolamine, filtered (0.45 µm nylon membrane), ultrasonically degassed (15 min), and pumped at 1.5 mL/min "
    "(30°C; 10-µL injections, 315 nm detection), maintaining backpressure around 145 bar."
)

add_heading_2("Standard and Sample Preparation")
add_body(
    "Stock Standard Preparation: Accurately weighed 23.3 mg ciprofloxacin HCl and 24.0 mg tinidazole dissolved in eluent (10-mL flask, sonicated 1 min); "
    "subsequent 5.0-to-50 mL dilution gave working standards (0.233 mg/mL ciprofloxacin HCl, 0.240 mg/mL tinidazole) filtered through 0.45 µm PTFE discs.\\n\\n"
    "Tablet Assay Preparation: Ten Floxotinazole FCT tablets (mean weight: 1400 mg) were powdered in an agate mortar. Accurately weighed powder "
    "(560.0 mg, containing ~232.88 mg ciprofloxacin HCl and 240.0 mg tinidazole) was dispersed in ~60 mL eluent within a 100-mL flask, agitated (2 min), "
    "and sonicated (3 min). Volumetric dilution, followed by secondary 5.0-to-50 mL dilution and 0.45 µm PTFE filtration, furnished test specimens."
)

add_heading_2("Method Validation and Forced Degradation")
add_body(
    "Validation observed ICH Q2(R2) and USP 36-NF31 protocols assessing system suitability (n = 6), specificity, linearity (50%–150%), "
    "precision (repeatability n = 6; inter-analyst intermediate ruggedness), accuracy (50%, 100%, 150% spikes, n = 3), and detection thresholds (LOD, LOQ).\\n\\n"
    "Tablet aliquots underwent five stress challenges per ICH Q1A(R2): acid (1.0 M HCl, 60°C, 2 h), base (0.1 M NaOH, 60°C, 1 h), "
    "peroxide (30% H2O2, 4 h), heat (dry, 80°C, 24 h), plus UV photolysis (254 nm, 24 h), monitored via DAD photodiode purity."
)

'''
    content = content[:exp_block_old.start()] + new_exp + content[exp_block_old.end():]
    print("Replaced Experimental Section successfully!")
else:
    print("Could not find Experimental block!")

# Replace Results and Discussion sections
content = content.replace(
    'Ciprofloxacin (pKa 6.09, 8.74) and tinidazole (pKa 1.3) have vastly different acid-base behaviors. Conventional methods use high concentrations of acetonitrile to pull tinidazole off the column quickly, often causing peak distortion.',
    'Ciprofloxacin (pKa 6.09, 8.74) versus tinidazole (pKa 1.3) exhibit divergent ionization traits. Published monographs consume heavy acetonitrile fractions to elute tinidazole, risking band distortion.'
)
content = content.replace(
    'Method optimization sought to minimize organic consumption while preserving chromatographic resolution. Buffering at pH 3.0 suppressed silanol ionization and maintained ciprofloxacin protonation, while triethanolamine acted as a sacrificial base competitor to eliminate peak tailing. The ternary mobile phase (methanol:ethanol:Solution C, 10:10:80 v/v/v) yielded sharp symmetrical peaks for both analytes, maintaining hydraulic backpressure at ~145 bar due to the high aqueous content (80%). Tinidazole eluted at 10.92 min and ciprofloxacin at 14.48 min, achieving baseline resolution (Rs = 5.72) within an 18-min run window.',
    'Method screening suppressed petrochemical waste while securing baseline resolution. Maintaining pH 3.0 masked accessible silanols to preserve cationic ciprofloxacin, whilst triethanolamine competed against silanol sites to abolish peak asymmetry. The ternary mobile phase (methanol-ethanol-Solution C, 10:10:80 v/v/v) furnished sharp symmetric peaks under ~145 bar column pressure. Tinidazole eluted at 10.92 min and ciprofloxacin at 14.48 min, yielding baseline resolution (Rs = 5.72) within 18 min.'
)
content = content.replace(
    'Six consecutive standard injections satisfied USP and ICH specifications (Table 1). Retention precision gave %RSD of 0.35% for both analytes, while peak area repeatability reached 0.35% %RSD. Column efficiency reached 7,882 theoretical plates (tinidazole) and 6,216 plates (ciprofloxacin), with USP tailing factors of 1.06 and 1.22.\n\nFigure 2 depicts chromatograms of diluent blank, placebo excipients, working standard, and tablet extract. Placebo excipients showed zero peaks within drug retention windows, while DAD spectral purity profiling verified uniform absorbance across each peak.',
    'Six replicate standard injections met USP and ICH criteria (Table 1). Retention time precision exhibited 0.35% %RSD across both analytes; peak area repeatability similarly scored 0.35% %RSD. Efficiency reached 7,882 theoretical plates (tinidazole) and 6,216 plates (ciprofloxacin), alongside USP tailing factors of 1.06 and 1.22.\n\nRepresentative chromatograms (Figure 2) verify blank diluent and excipient placebo selectivity: no interfering peaks co-eluted within analyte windows, while diode array spectral purity confirmed homogeneous absorbance across all peak profiles.'
)
content = content.replace(
    'Five-point calibration plots spanned 50%–150% of target working concentrations (Table 2, Figure 1). Least-squares regression yielded y = 7,723.6x + 1,240.0 (R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) and y = 8,627.9x + 1,850.0 (R² = 0.99997) for tinidazole (120.0–360.0 µg/mL), with homoscedastic residual distributions. Detection limits (LOD) were 0.0125 µg (1.25 µg/mL) for ciprofloxacin and 0.0105 µg (1.05 µg/mL) for tinidazole, with quantitation limits (LOQ) of 0.0380 µg (3.80 µg/mL) and 0.0317 µg (3.17 µg/mL).',
    'Five-point calibration curves spanned 50%–150% target ranges (Table 2, Figure 1). Linear calibrations yielded y = 7,723.6x + 1,240.0 (R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) alongside y = 8,627.9x + 1,850.0 (R² = 0.99997) for tinidazole (120.0–360.0 µg/mL), exhibiting homoscedastic variance. Detection thresholds (LOD) were 0.0125 µg (1.25 µg/mL, ciprofloxacin) and 0.0105 µg (1.05 µg/mL, tinidazole); quantitation limits (LOQ) evaluated to 0.0380 µg (3.80 µg/mL) and 0.0317 µg (3.17 µg/mL).'
)
content = content.replace(
    'Spiking inactive excipient blends across 50%, 100%, and 150% levels (n = 9, Table 3) demonstrated mean analytical recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, satisfying standard regulatory limits (98.0%–102.0%).\n\nAssaying six commercial tablet preparations yielded mean contents of 100.94% (%RSD = 0.60%) for ciprofloxacin and 100.12% (%RSD = 0.60%) for tinidazole (Table 4); inter-analyst intermediate precision across separate operating sessions retained %RSD below 0.53%.',
    'Spike-recovery assays across 50%, 100%, 150% concentrations (n = 9, Table 3) yielded mean recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, fulfilling pharmacopeial benchmarks (98.0%–102.0%).\n\nAssaying commercial Floxotinazole FCT tablets (n = 6) yielded 100.94% (%RSD = 0.60%) ciprofloxacin and 100.12% (%RSD = 0.60%) tinidazole (Table 4); inter-analyst ruggedness remained < 0.53% %RSD across distinct test days.'
)
content = content.replace(
    'Forced degradation trials subjected tablet formulations to five stress environments (Table 5, Figure 3). Both actives resisted acidic, thermal, and photolytic degradation (loss < 5%), while alkaline digestion (0.1 M NaOH at 60°C) induced moderate loss (< 8%). In contrast, 30% H2O2 provoked 43.8% degradation, forming a prominent breakdown product at 6.20 min that resolved cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). DAD spectral purity angles remained strictly below purity thresholds throughout, establishing stability-indicating capability.',
    'Stress challenges tested product stability across five destructive conditions (Table 5, Figure 3). Active molecules withstood acid, thermal stress, and photolysis (< 5% breakdown), with minor alkaline loss (< 8% in 0.1 M NaOH at 60°C). In contrast, 30% H2O2 caused 43.8% oxidative degradation, resolving a single degradant band at 6.20 min cleanly away from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). Spectral purity angles remained below purity thresholds across all peaks, proving stability-indicating selectivity.'
)
content = content.replace(
    'We compared the method against three published procedures: conventional isocratic HPLC [6], gradient HPLC [7], and planar HPTLC [9] (Table 6, Figures 4 and 5).\n\nFormulating an 80% aqueous eluent elevated the GEARS solvent score to 92.13%, outperforming conventional acetonitrile methods (78.63%) and planar HPTLC (31.40%). MoGAPI and ComplexMoGAPI ratings reached 70.00 and 72.50, driven by direct sample preparation and environmentally benign waste streams. AGSA and AGSA-Prep polygonal star areas attained 42.15% and 58.40%, while the AGREE greenness metric scored 0.81.\n\nEvaluation via White Analytical Chemistry (WAC / RGB12) registered 87.17% total whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), whereas the BAGI blueness index scored 85.0/100, driven by direct C18 compatibility and dilute-and-shoot execution. Deducting 9 penalty points afforded an Analytical Eco-Scale rating of 91/100, and carbon emission profiling indicated 0.00112 kg CO2 eq/sample—seven-fold below conventional HPLC (0.00820 kg CO2 eq).',
    'The developed assay was benchmarked against reported isocratic HPLC [6], gradient HPLC [7], and planar HPTLC [9] monographs (Table 6, Figures 4 and 5).\n\nEmploying an 80% aqueous eluent elevated GEARS solvent evaluation to 92.13%, surpassing traditional acetonitrile assays (78.63%) and planar TLC (31.40%). MoGAPI and ComplexMoGAPI reached 70.00 and 72.50 via dilute-and-shoot preparation and safe effluent streams. AGSA and AGSA-Prep polygonal star indices attained 42.15% and 58.40%, alongside an AGREE score of 0.81.\n\nWhite Analytical Chemistry (RGB12) calculated 87.17% total whiteness (Red: 91.0%, Green: 88.0%, Blue: 82.5%), while BAGI practical blueness registered 85.0/100. Analytical Eco-Scale tallied 91/100 (9 penalty points), and carbon emissions totaled 0.00112 kg CO2 eq/sample—over seven-fold lower than conventional HPLC (0.00820 kg CO2 eq).'
)
content = content.replace(
    'This study established and validated an isocratic RP-HPLC assay for quantifying ciprofloxacin hydrochloride and tinidazole in commercial tablets. Formulating an 80% aqueous eluent with 10% bio-ethanol and 10% methanol omitted acetonitrile whilst maintaining baseline chromatographic resolution (Rs = 5.72). Validation fulfilled ICH Q2(R2) and USP 36-NF31 specifications, cleanly separating degradants across five stress challenges. Comprehensive evaluation across ten sustainability, whiteness, and blueness metrics verified lower solvent hazards, reduced waste, and superior operational simplicity over reported monographs, confirming suitability for routine release and stability monitoring.',
    'An isocratic green RP-HPLC assay successfully quantifies ciprofloxacin hydrochloride and tinidazole in commercial Floxotinazole FCT tablets. Utilizing an 80% aqueous buffer with renewable ethanol and methanol excluded hazardous acetonitrile while achieving baseline chromatographic separation (Rs = 5.72). Method qualification fulfilled ICH Q2(R2) and USP 36-NF31 standards, cleanly resolving stress degradants. Multi-criteria evaluation across ten green, white, and blue metrics demonstrated reduced toxicity, minimal carbon emissions, and high practical throughput for pharmaceutical quality control.'
)

# Captions
content = content.replace('Table 1. System suitability parameters for the green RP-HPLC method (n = 6).', 'Table 1. System suitability parameters (n = 6).')
content = content.replace('Table 2. Linearity and sensitivity data for ciprofloxacin and tinidazole.', 'Table 2. Linearity and sensitivity parameters.')
content = content.replace('Table 3. Accuracy and recovery results for ciprofloxacin and tinidazole (n = 3 per level).', 'Table 3. Quantitative recovery and accuracy (n = 3 per level).')
content = content.replace('Table 4. Method precision and ruggedness evaluation.', 'Table 4. Method precision and ruggedness profile.')
content = content.replace('Table 5. Forced degradation results for Floxotinazole FCT tablets.', 'Table 5. Forced degradation stress testing data.')
content = content.replace('Table 6. Multi-criteria sustainability, whiteness, and applicability benchmarking against reported literature.', 'Table 6. Sustainability and applicability benchmarking against reported literature.')
content = content.replace('Figure 1. Calibration curves and residual plots: (A, C) Ciprofloxacin hydrochloride; (B, D) Tinidazole.', 'Figure 1. Calibration plots and residual distributions: (A, C) Ciprofloxacin; (B, D) Tinidazole.')
content = content.replace('Figure 2. Representative HPLC chromatograms: (A) Mobile phase blank; (B) Tablet excipients placebo; (C) Working standard solution; (D) Commercial Floxotinazole FCT tablet formulation (Rs = 5.72).', 'Figure 2. Representative chromatograms: (A) Blank; (B) Excipient placebo; (C) Working standard; (D) Commercial Floxotinazole FCT (Rs = 5.72).')
content = content.replace('Figure 3. Forced degradation chromatograms: (A) Acid stress; (B) Alkaline stress; (C) Oxidative stress (30% H2O2, 43.8% degradation with resolved degradant at 6.20 min); (D) Thermal stress; (E) Photolytic stress.', 'Figure 3. Forced degradation profiles: (A) Acid; (B) Base; (C) Peroxide (30% H2O2, 43.8% breakdown, degradant tR = 6.20 min); (D) Thermal; (E) UV photolysis.')
content = content.replace('Figure 4. Comprehensive Green Analytical Chemistry profile: (A) MoGAPI and ComplexMoGAPI; (B) AGSA 12-principle radar star; (C) AGSA-Prep 8-axis sample preparation radar star; (D) GEARS multi-criteria solvent rating; (E) AGREE clock pictogram; (F) Quantitative sustainability benchmarking against published literature.', 'Figure 4. Green analytical profile: (A) MoGAPI/ComplexMoGAPI; (B) AGSA radar; (C) AGSA-Prep radar; (D) GEARS solvent rating; (E) AGREE pictogram; (F) Quantitative benchmarking.')
content = content.replace('Figure 5. White and Blue Analytical Chemistry profile: (A) WAC (RGB12) three-pillar evaluation (Total Whiteness: 87.17%); (B) BAGI 10-criteria radar asteroid (Score: 85.0/100); (C) Analytical Eco-Scale penalty points and final score (91/100); (D) Direct carbon footprint benchmarking against conventional HPLC and HPTLC methods.', 'Figure 5. White and Blue profile: (A) WAC (RGB12, 87.17%); (B) BAGI asteroid (85.0/100); (C) Analytical Eco-Scale score (91/100); (D) Direct carbon footprint benchmarking.')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated create_docx_2nd.py successfully!")
