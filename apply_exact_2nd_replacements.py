file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Abstract
old_abs = '''r_ab_body = p_ab.add_run(
    "A green, stability-indicating reversed-phase HPLC method was developed and validated for the simultaneous "
    "determination of ciprofloxacin hydrochloride and tinidazole in commercial tablets (Floxotinazole FCT). Acetonitrile "
    "was eliminated, using an 80% aqueous mobile phase: methanol:ethanol:Solution C (0.025 M orthophosphoric acid, pH 3.0 adjusted "
    "with triethanolamine) (10:10:80 v/v/v) on a C18 column (250 × 4.6 mm, 5 µm) at 1.5 mL/min with UV detection at 315 nm. Baseline "
    "separation (Rs = 5.72 ± 0.02) was achieved with retention times of 10.92 ± 0.04 min (tinidazole) and 14.48 ± 0.05 min (ciprofloxacin). "
    "Validation per ICH Q2(R2) and USP 36-NF31 showed linearity (R² = 0.99997 for both analytes), repeatability %RSD of "
    "0.60%, intermediate precision %RSD < 0.53%, and mean recoveries of 100.90% (ciprofloxacin) and 100.19% (tinidazole). Forced degradation under "
    "acidic, alkaline, oxidative (30% H2O2, 43.8% degradation), thermal, and photolytic stress confirmed resolution from all degradants with spectral "
    "peak purity. Sustainability, whiteness, and practical applicability were benchmarked against reported literature using ten metrics: MoGAPI (70.00 vs 40.00), "
    "ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15% vs 20.00%), GEARS Total Solvent (92.13% vs 78.63%), AGSA-Prep (58.40% vs 28.00%), "
    "AGREE (0.81 vs 0.55), White Analytical Chemistry (WAC Total Whiteness: 87.17% vs 60.00%), Blue Applicability Grade Index (BAGI: 85.0 vs 55.0), "
    "Analytical Eco-Scale (AES: 91 vs 65), and Carbon Footprint (0.00112 vs > 0.008 kg CO2 eq/sample). The method provides an eco-friendly protocol for "
    "routine industrial batch release and stability monitoring."
)'''

new_abs = '''r_ab_body = p_ab.add_run(
    "An isocratic green RP-HPLC method quantifies ciprofloxacin hydrochloride and tinidazole simultaneously in commercial "
    "tablets (Floxotinazole FCT). Toxic acetonitrile was eliminated using an 80% aqueous eluent comprising methanol, ethanol, "
    "and Solution C (0.025 M orthophosphoric acid, pH 3.0 adjusted with triethanolamine; 10:10:80, v/v/v) pumped at 1.5 mL/min "
    "across a C18 column (250 × 4.6 mm, 5 µm) under 315 nm UV detection. Baseline chromatographic resolution (Rs = 5.72 ± 0.02) "
    "was achieved, with retention times of 10.92 ± 0.04 min (tinidazole) and 14.48 ± 0.05 min (ciprofloxacin). Validation per "
    "ICH Q2(R2) and USP 36-NF31 showed linearity (R² = 0.99997 for both analytes), repeatability %RSD of 0.60%, intermediate "
    "precision %RSD < 0.53%, and mean recoveries of 100.90% (ciprofloxacin) and 100.19% (tinidazole). Forced degradation under "
    "acidic, alkaline, oxidative (30% H2O2, 43.8% degradation), thermal, and photolytic stress confirmed resolution from all degradants "
    "with spectral peak purity. Sustainability, whiteness, and practical applicability were benchmarked against reported literature "
    "using ten metrics: MoGAPI (70.00 vs 40.00), ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15% vs 20.00%), GEARS Total Solvent "
    "(92.13% vs 78.63%), AGSA-Prep (58.40% vs 28.00%), AGREE (0.81 vs 0.55), White Analytical Chemistry (WAC Total Whiteness: "
    "87.17% vs 60.00%), Blue Applicability Grade Index (BAGI: 85.0 vs 55.0), Analytical Eco-Scale (AES: 91 vs 65), and Carbon "
    "Footprint (0.00112 vs > 0.008 kg CO2 eq/sample). This eco-friendly protocol offers robust capability for routine industrial "
    "batch release and stability testing."
)'''

assert old_abs in text, "old_abs not found"
text = text.replace(old_abs, new_abs)

# 2. Method Development and Optimization
old_dev = '''add_body(
    "Ciprofloxacin (pKa 6.09, 8.74) and tinidazole (pKa 1.3) have vastly different acid-base behaviors. Conventional methods use high "
    "concentrations of acetonitrile to pull tinidazole off the column quickly, often causing peak distortion.\\n\\n"
    "Our goal was to cut organic solvent use while preserving peak shape. Running at pH 3.0 suppressed silanol ionization on the silica "
    "surface and kept ciprofloxacin protonated. Adding triethanolamine as a base competitor masked residual silanols, which eliminated peak tailing. "
    "The ternary combination of methanol:ethanol:Solution C (10:10:80 v/v/v) gave sharp, symmetrical peaks for both compounds. Even with ethanol "
    "in the mix, the high water fraction (80%) kept column backpressure at ~145 bar. Tinidazole eluted at 10.92 min and ciprofloxacin at "
    "14.48 min, giving a baseline resolution of 5.72 within an 18-min run."
)'''

new_dev = '''add_body(
    "Ciprofloxacin (pKa 6.09, 8.74) and tinidazole (pKa 1.3) have vastly different acid-base behaviors. Conventional methods use high "
    "concentrations of acetonitrile to pull tinidazole off the column quickly, often causing peak distortion.\\n\\n"
    "Method optimization sought to minimize organic consumption while preserving chromatographic resolution. Buffering at pH 3.0 "
    "suppressed silanol ionization and maintained ciprofloxacin protonation, while triethanolamine acted as a sacrificial base competitor "
    "to eliminate peak tailing. The ternary mobile phase (methanol:ethanol:Solution C, 10:10:80 v/v/v) yielded sharp symmetrical peaks "
    "for both analytes, maintaining hydraulic backpressure at ~145 bar due to the high aqueous content (80%). Tinidazole eluted at "
    "10.92 min and ciprofloxacin at 14.48 min, achieving baseline resolution (Rs = 5.72) within an 18-min run window."
)'''

assert old_dev in text, "old_dev not found"
text = text.replace(old_dev, new_dev)

# 3. System Suitability and Specificity
old_sst = '''add_body(
    "Six replicate injections of standard solution met USP and ICH criteria (Table 1). Retention times were reproducible, "
    "with %RSD of 0.35% for both analytes. Plate counts reached 7,882 for tinidazole and 6,216 for ciprofloxacin, with USP tailing "
    "factors of 1.06 and 1.22. Area repeatability %RSD was 0.35%.\\n\\n"
    "Figure 2 compares chromatograms of mobile phase blank, placebo excipients, working standard, and tablet extract. "
    "The placebo showed no peaks in the retention windows of either drug. Diode array spectral purity checks showed uniform "
    "absorbance profiles across each peak."
)'''

new_sst = '''add_body(
    "Six consecutive standard injections satisfied USP and ICH specifications (Table 1). Retention precision gave %RSD of 0.35% "
    "for both analytes, while peak area repeatability reached 0.35% %RSD. Column efficiency reached 7,882 theoretical plates (tinidazole) "
    "and 6,216 plates (ciprofloxacin), with USP tailing factors of 1.06 and 1.22.\\n\\n"
    "Figure 2 depicts chromatograms of diluent blank, placebo excipients, working standard, and tablet extract. Placebo excipients showed "
    "zero peaks within drug retention windows, while DAD spectral purity profiling verified uniform absorbance across each peak."
)'''

assert old_sst in text, "old_sst not found"
text = text.replace(old_sst, new_sst)

# 4. Linearity
old_lin = '''add_body(
    "Calibration curves were constructed across five levels spanning 50% to 150% of the working concentrations (Table 2, Figure 1). "
    "Regression equations were y = 7,723.6x + 1,240.0 (R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) and y = 8,627.9x + 1,850.0 "
    "(R² = 0.99997) for tinidazole (120.0–360.0 µg/mL). Residual plots showed random scatter across zero. Limits of detection were "
    "0.0125 µg (1.25 µg/mL) for ciprofloxacin and 0.0105 µg (1.05 µg/mL) for tinidazole; limits of quantitation were 0.0380 µg "
    "(3.80 µg/mL) and 0.0317 µg (3.17 µg/mL)."
)'''

new_lin = '''add_body(
    "Five-point calibration plots spanned 50%–150% of target working concentrations (Table 2, Figure 1). Least-squares regression "
    "yielded y = 7,723.6x + 1,240.0 (R² = 0.99997) for ciprofloxacin (116.4–349.2 µg/mL) and y = 8,627.9x + 1,850.0 (R² = 0.99997) "
    "for tinidazole (120.0–360.0 µg/mL), with homoscedastic residual distributions. Detection limits (LOD) were 0.0125 µg "
    "(1.25 µg/mL) for ciprofloxacin and 0.0105 µg (1.05 µg/mL) for tinidazole, with quantitation limits (LOQ) of 0.0380 µg "
    "(3.80 µg/mL) and 0.0317 µg (3.17 µg/mL)."
)'''

assert old_lin in text, "old_lin not found"
text = text.replace(old_lin, new_lin)

# 5. Accuracy & Precision
old_acc = '''add_body(
    "Recovery was evaluated at 50%, 100%, and 150% spike levels in triplicate (n = 9, Table 3). Mean recovery was 100.90% "
    "(%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, within the 98.0%–102.0% acceptance window.\\n\\n"
    "Six independent tablet preparations yielded mean assay values of 100.94% (%RSD = 0.60%) for ciprofloxacin and 100.12% "
    "(%RSD = 0.60%) for tinidazole (Table 4). Intermediate precision tested across two analysts on different days showed %RSD "
    "values below 0.53%, confirming method ruggedness."
)'''

new_acc = '''add_body(
    "Spiking inactive excipient blends across 50%, 100%, and 150% levels (n = 9, Table 3) demonstrated mean analytical recoveries of "
    "100.90% (%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, satisfying standard regulatory limits "
    "(98.0%–102.0%).\\n\\n"
    "Assaying six commercial tablet preparations yielded mean contents of 100.94% (%RSD = 0.60%) for ciprofloxacin and 100.12% "
    "(%RSD = 0.60%) for tinidazole (Table 4); inter-analyst intermediate precision across separate operating sessions retained %RSD below 0.53%."
)'''

assert old_acc in text, "old_acc not found"
text = text.replace(old_acc, new_acc)

# 6. Degradation
old_deg = '''add_body(
    "Stress studies exposed tablet formulations to five degradation conditions (Table 5, Figure 3). Both drugs resisted acid, "
    "thermal, and photolytic stress (loss < 5%). Alkaline conditions (0.1 M NaOH at 60°C) produced moderate loss (< 8%). "
    "In contrast, 30% H2O2 provoked 43.8% degradation, generating a major degradation product at 6.20 min. This degradant peak "
    "resolved cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). PDA peak purity angles remained below purity "
    "thresholds throughout, proving the assay is stability-indicating."
)'''

new_deg = '''add_body(
    "Forced degradation trials subjected tablet formulations to five stress environments (Table 5, Figure 3). Both actives resisted "
    "acidic, thermal, and photolytic degradation (loss < 5%), while alkaline digestion (0.1 M NaOH at 60°C) induced moderate loss "
    "(< 8%). In contrast, 30% H2O2 provoked 43.8% degradation, forming a prominent breakdown product at 6.20 min that resolved "
    "cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0). DAD spectral purity angles remained strictly below purity "
    "thresholds throughout, establishing stability-indicating capability."
)'''

assert old_deg in text, "old_deg not found"
text = text.replace(old_deg, new_deg)

# 7. Green Assessment
old_gm = '''add_body(
    "We compared the method against three published procedures: conventional isocratic HPLC [6], gradient HPLC [7], "
    "and planar HPTLC [9] (Table 6, Figures 4 and 5).\\n\\n"
    "The 80% aqueous mobile phase raised the GEARS total solvent score to 92.13%, compared to 78.63% for conventional ACN "
    "methods and 31.40% for HPTLC. MoGAPI and ComplexMoGAPI scores reached 70.0 and 72.5, driven by minimal sample preparation "
    "and safe waste streams. AGSA and AGSA-Prep star areas were 42.15% and 58.40%, showing balanced coverage across the 12 GAC "
    "principles. AGREE scored 0.81.\\n\\n"
    "Under White Analytical Chemistry (WAC / RGB12), total whiteness reached 87.17% (Red: 91.0%, Green: 88.0%, Blue: 82.5%). "
    "BAGI blueness was 85.0 / 100, reflecting routine C18 availability and dilute-and-shoot simplicity. Deducting 9 penalty points "
    "gave an Analytical Eco-Scale score of 91 / 100. Direct carbon emissions were 0.00112 kg CO2 eq/sample, seven times lower than "
    "conventional HPLC (0.00820 kg CO2 eq)."
)'''

new_gm = '''add_body(
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

assert old_gm in text, "old_gm not found"
text = text.replace(old_gm, new_gm)

# 8. Conclusion
old_concl = '''add_body(
    "An isocratic RP-HPLC assay was developed and validated for the simultaneous determination of ciprofloxacin hydrochloride "
    "and tinidazole in commercial tablets. Using an 80% aqueous buffer with 10% ethanol and 10% methanol eliminated acetonitrile "
    "while maintaining baseline separation (Rs = 5.72). The method fulfilled ICH Q2(R2) and USP 36-NF31 criteria and resolved "
    "all degradation products under five stress conditions. Assessment across ten sustainability, whiteness, and applicability metrics "
    "showed lower solvent hazards, reduced waste, and operational simplicity relative to reported monographs, making the procedure "
    "suitable for routine batch release and stability testing."
)'''

new_concl = '''add_body(
    "This study established and validated an isocratic RP-HPLC assay for quantifying ciprofloxacin hydrochloride and tinidazole "
    "in commercial tablets. Formulating an 80% aqueous eluent with 10% bio-ethanol and 10% methanol omitted acetonitrile whilst "
    "maintaining baseline chromatographic resolution (Rs = 5.72). Validation fulfilled ICH Q2(R2) and USP 36-NF31 specifications, "
    "cleanly separating degradants across five stress challenges. Comprehensive evaluation across ten sustainability, whiteness, "
    "and blueness metrics verified lower solvent hazards, reduced waste, and superior operational simplicity over reported "
    "monographs, confirming suitability for routine release and stability monitoring."
)'''

assert old_concl in text, "old_concl not found"
text = text.replace(old_concl, new_concl)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Successfully replaced all 8 target blocks in create_docx_2nd.py")
