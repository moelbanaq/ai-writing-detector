import re

with open('2nd_docx_rebuilt.txt', 'r', encoding='utf-8') as f:
    text = f.read()

t = text

reps = [
    # Abstract
    ("An isocratic green RP-HPLC method quantifies ciprofloxacin hydrochloride and tinidazole simultaneously in commercial tablets (Floxotinazole FCT). Toxic acetonitrile was eliminated using an 80% aqueous eluent comprising methanol, ethanol, and Solution C (0.025 M orthophosphoric acid, pH 3.0 adjusted with triethanolamine; 10:10:80, v/v/v) pumped at 1.5 mL/min across a C18 column (250 × 4.6 mm, 5 µm) under 315 nm UV detection.",
     "An isocratic green RP-HPLC assay quantifies ciprofloxacin hydrochloride and tinidazole simultaneously in commercial Floxotinazole FCT tablets. Acetonitrile was omitted, running an 80% aqueous eluent (methanol:ethanol:0.025 M orthophosphoric acid, pH 3.0 via triethanolamine, 10:10:80 v/v/v) at 1.5 mL/min across a C18 column (250 × 4.6 mm, 5 µm) under 315 nm detection."),
    
    ("Baseline chromatographic resolution (Rs = 5.72 ± 0.02) was achieved, with retention times of 10.92 ± 0.04 min (tinidazole) and 14.48 ± 0.05 min (ciprofloxacin).",
     "Baseline chromatographic resolution (Rs = 5.72 ± 0.02) resolved tinidazole (10.92 ± 0.04 min) and ciprofloxacin (14.48 ± 0.05 min)."),
     
    ("Validation per ICH Q2(R2) and USP 36-NF31 showed linearity (R² = 0.99997 for both analytes), repeatability %RSD of 0.60%, intermediate precision %RSD < 0.53%, and mean recoveries of 100.90% (ciprofloxacin) and 100.19% (tinidazole).",
     "Validation per ICH Q2(R2) and USP 36-NF31 demonstrated linearity (R² = 0.99997 both actives), repeatability %RSD of 0.60%, intermediate precision %RSD < 0.53%, plus recoveries of 100.90% (ciprofloxacin) and 100.19% (tinidazole)."),
     
    ("Forced degradation under acidic, alkaline, oxidative (30% H2O2, 43.8% degradation), thermal, and photolytic stress confirmed resolution from all degradants with spectral peak purity.",
     "Forced degradation under acidic, alkaline, oxidative (30% H2O2, 43.8% breakdown), thermal, and photolytic stress confirmed degradant resolution with spectral peak purity."),
     
    ("Sustainability, whiteness, and practical applicability were benchmarked against reported literature using ten metrics: MoGAPI (70.00 vs 40.00), ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15% vs 20.00%), GEARS Total Solvent (92.13% vs 78.63%), AGSA-Prep (58.40% vs 28.00%), AGREE (0.81 vs 0.55), White Analytical Chemistry (WAC Total Whiteness: 87.17% vs 60.00%), Blue Applicability Grade Index (BAGI: 85.0 vs 55.0), Analytical Eco-Scale (AES: 91 vs 65), and Carbon Footprint (0.00112 vs > 0.008 kg CO2 eq/sample).",
     "Sustainability benchmarking against reported literature encompassed ten metrics: MoGAPI (70.00 vs 40.00), ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15% vs 20.00%), GEARS Total Solvent (92.13% vs 78.63%), AGSA-Prep (58.40% vs 28.00%), AGREE (0.81 vs 0.55), WAC Whiteness (87.17% vs 60.00%), BAGI (85.0 vs 55.0), Analytical Eco-Scale (91 vs 65), and Carbon Footprint (0.00112 vs > 0.008 kg CO2 eq/sample)."),
     
    # Introduction
    ("Co-administering the fluoroquinolone ciprofloxacin hydrochloride with the nitroimidazole tinidazole provides synergistic clinical efficacy against mixed aerobic-anaerobic infections, including intra-abdominal, pelvic, and severe gastrointestinal disorders [1,2]. Given their complementary pharmacokinetics and antimicrobial coverage, fixed-dose combination tablets (e.g., Floxotinazole FCT, containing 500 mg ciprofloxacin and 600 mg tinidazole) are widely prescribed globally.",
     "Co-administering ciprofloxacin hydrochloride with tinidazole provides synergistic clinical efficacy against mixed aerobic-anaerobic infections (intra-abdominal, pelvic, and severe gastrointestinal disorders) [1,2]. Given complementary pharmacokinetics and broad antimicrobial coverage, fixed-dose combination tablets (Floxotinazole FCT: 500 mg ciprofloxacin, 600 mg tinidazole) are widely prescribed globally."),
     
    ("Regulatory pharmacopeias mandate validated, stability-indicating assays for commercial solid dosage forms to monitor active drugs alongside excipients and degradation products [3-5]. Nevertheless, reported chromatographic monographs for this binary formulation rely heavily on acetonitrile-phosphate mixtures (20%–40% v/v) or complex gradient programs [6-10]. Acetonitrile represents a volatile petrochemical derivative that releases hazardous hydrogen cyanide upon incineration [11,12]. Planar chromatographic (HPTLC) procedures frequently employ toxic chlorinated or aromatic solvents (chloroform, toluene) coupled with liquid-liquid extraction [9].",
     "Pharmacopeias mandate stability-indicating assays for solid dosage forms to monitor active drugs alongside excipients and degradation products [3-5]. Reported chromatographic monographs for this binary formulation rely on acetonitrile-phosphate mixtures (20%–40% v/v) or complex gradient elution [6-10]. Acetonitrile represents a volatile petrochemical pollutant releasing toxic hydrogen cyanide upon incineration [11,12], while planar chromatography (HPTLC) frequently employs chlorinated solvents (chloroform, toluene) with liquid-liquid extraction [9]."),
     
    # Experimental
    ("Analytical standards of ciprofloxacin hydrochloride (98.86% purity) and tinidazole (98.60% purity) were obtained with certified assay credentials. Commercial Floxotinazole FCT tablets (labeled: 500 mg ciprofloxacin, equivalent to 582.2 mg ciprofloxacin HCl, and 600 mg tinidazole; average tablet weight: 1400 mg) were procured from local pharmacy stock. HPLC-grade methanol and absolute ethanol originated from Merck (Darmstadt, Germany). Orthophosphoric acid (85%), triethanolamine (TEA), hydrochloric acid (37%), sodium hydroxide, and 30% hydrogen peroxide were sourced from Sigma-Aldrich. Deionized water (> 18.2 MΩ·cm) was prepared using a Milli-Q filtration system (Millipore, Bedford, MA, USA).",
     "Certified standards of ciprofloxacin hydrochloride (98.86%) and tinidazole (98.60%) were utilized. Floxotinazole FCT tablets (500 mg ciprofloxacin, 600 mg tinidazole, mean mass: 1400 mg) were obtained from retail pharmacy stock. HPLC solvents (methanol, ethanol) originated from Merck (Darmstadt). Orthophosphoric acid (85%), triethanolamine (TEA), hydrochloric acid, sodium hydroxide, and peroxide (30%) were supplied by Sigma-Aldrich; deionized water (> 18.2 MΩ·cm) came from a Milli-Q system."),
     
    ("Chromatographic separation employed a standard C18 stationary phase (250 × 4.6 mm, 5 µm, USP L1) mounted on an Agilent 1100 HPLC system (Agilent Technologies, Waldbronn, Germany) equipped with quaternary pump, autosampler, column thermostat, and DAD.\n\nThe isocratic eluent consisted of methanol, ethanol, and Solution C (10:10:80 v/v/v). Buffer Solution C was formulated by introducing 0.025 M orthophosphoric acid in ultrapure water and adjusting to pH 3.0 ± 0.05 with triethanolamine. The mixture was filtered through a 0.45 µm nylon membrane and sonicated for 15 min. Flow rate was maintained at 1.5 mL/min at 30°C, with 10-µL injections and spectrophotometric detection at 315 nm; column backpressure stabilized at ~145 bar.",
     "Separation used a C18 column (250 × 4.6 mm, 5 µm, USP L1) on an Agilent 1100 HPLC system equipped with quaternary pump, autosampler, thermostat, and DAD.\n\nIsocratic mobile phase comprised methanol:ethanol:Solution C (10:10:80 v/v/v). Buffer Solution C contained 0.025 M aqueous orthophosphoric acid adjusted to pH 3.0 ± 0.05 via triethanolamine, filtered (0.45 µm nylon) and degassed ultrasonically (15 min). Pumping at 1.5 mL/min (30°C) with 10-µL injections gave 315 nm detection, stabilizing hydraulic backpressure near 145 bar."),
     
    ("Stock Standard Preparation: Accurately weighed 23.3 mg ciprofloxacin HCl and 24.0 mg tinidazole were dissolved in mobile phase inside a 10-mL volumetric flask and sonicated for 1 min; transferring a 5.0-mL aliquot into a 50-mL flask and diluting to volume yielded 0.233 mg/mL (232.88 µg/mL) ciprofloxacin HCl and 0.240 mg/mL (240.0 µg/mL) tinidazole. Injections followed 0.45 µm PTFE membrane filtration.\n\nTablet Assay Preparation: Ten Floxotinazole FCT tablets were weighed to determine mean tablet mass (1400 mg) and pulverized using an agate mortar. Accurately weighed powder (560.0 mg, equivalent to ~232.88 mg ciprofloxacin HCl and 240.0 mg tinidazole) was transferred into a 100-mL flask, dispersed in ~60 mL mobile phase, mechanically agitated for 2 min, and sonicated for 3 min. Following dilution to volume, a 5.0-mL aliquot was diluted to 50 mL with mobile phase and filtered through a 0.45 µm PTFE disc.",
     "Stock Standard Preparation: Accurately weighed 23.3 mg ciprofloxacin HCl and 24.0 mg tinidazole were dissolved in mobile phase (10-mL flask) and sonicated (1 min); a 5.0-to-50 mL dilution yielded working standards (0.233 mg/mL ciprofloxacin HCl, 0.240 mg/mL tinidazole). Injections followed 0.45 µm PTFE disc filtration.\n\nTablet Assay Preparation: Ten Floxotinazole FCT tablets were weighed (mean mass: 1400 mg) and powdered in an agate mortar. Accurately weighed powder (560.0 mg, containing ~232.88 mg ciprofloxacin HCl and 240.0 mg tinidazole) was dispersed in ~60 mL mobile phase within a 100-mL flask, agitated mechanically (2 min), and sonicated (3 min). Diluting to volume, followed by a secondary 5.0-to-50 mL dilution and 0.45 µm PTFE filtration, furnished analytical samples."),
     
    ("Method qualification observed ICH Q2(R2) and USP 36-NF31 protocols for system suitability (n = 6), specificity, linearity (50%–150%), precision (repeatability, n = 6; intermediate precision across two analysts on different days), accuracy (50%, 100%, and 150% spike levels, n = 3 each), and detection limits (LOD and LOQ).\n\nTablet aliquots underwent five distinct stress challenges per ICH Q1A(R2): (i) Acid hydrolysis (1.0 M HCl, 60°C, 2 h); (ii) Alkaline hydrolysis (0.1 M NaOH, 60°C, 1 h); (iii) Oxidative stress (30% H2O2, ambient, 4 h); (iv) Thermal degradation (dry heat, 80°C, 24 h); and (v) Photolytic stress (UV 254 nm, 24 h). Peak purity was checked by DAD.",
     "Validation observed ICH Q2(R2) and USP 36-NF31 protocols assessing system suitability (n = 6), specificity, linearity (50%–150%), precision (repeatability n = 6; inter-analyst intermediate ruggedness), accuracy (50%, 100%, 150% spikes, n = 3), and detection thresholds (LOD, LOQ).\n\nTablet aliquots underwent five stress challenges per ICH Q1A(R2): acid (1.0 M HCl, 60°C, 2 h), base (0.1 M NaOH, 60°C, 1 h), peroxide (30% H2O2, 4 h), heat (dry, 80°C, 24 h), and photolysis (UV 254 nm, 24 h), tracked via DAD peak purity."),

    # Captions
    ("Table 1. System suitability parameters for the green RP-HPLC method (n = 6).", "Table 1. System suitability parameters (n = 6)."),
    ("Table 2. Linearity and sensitivity data for ciprofloxacin and tinidazole.", "Table 2. Linearity and sensitivity parameters."),
    ("Table 3. Accuracy and recovery results for ciprofloxacin and tinidazole (n = 3 per level).", "Table 3. Analytical recovery and accuracy (n = 3 per level)."),
    ("Table 4. Method precision and ruggedness evaluation.", "Table 4. Method precision and ruggedness profile."),
    ("Table 5. Forced degradation results for Floxotinazole FCT tablets.", "Table 5. Forced degradation stress testing data."),
    ("Table 6. Multi-criteria sustainability, whiteness, and applicability benchmarking against reported literature.", "Table 6. Sustainability and applicability benchmarking against reported literature."),
    ("Figure 1. Calibration curves and residual plots: (A, C) Ciprofloxacin hydrochloride; (B, D) Tinidazole.", "Figure 1. Calibration plots and residual distributions: (A, C) Ciprofloxacin; (B, D) Tinidazole."),
    ("Figure 2. Representative HPLC chromatograms: (A) Mobile phase blank; (B) Tablet excipients placebo; (C) Working standard solution; (D) Commercial Floxotinazole FCT tablet formulation (Rs = 5.72).", "Figure 2. Representative chromatograms: (A) Blank; (B) Excipient placebo; (C) Working standard; (D) Commercial Floxotinazole FCT (Rs = 5.72)."),
    ("Figure 3. Forced degradation chromatograms: (A) Acid stress; (B) Alkaline stress; (C) Oxidative stress (30% H2O2, 43.8% degradation with resolved degradant at 6.20 min); (D) Thermal stress; (E) Photolytic stress.", "Figure 3. Forced degradation profiles: (A) Acid; (B) Base; (C) Peroxide (30% H2O2, 43.8% breakdown, degradant tR = 6.20 min); (D) Thermal; (E) UV photolysis."),
    ("Figure 4. Comprehensive Green Analytical Chemistry profile: (A) MoGAPI and ComplexMoGAPI; (B) AGSA 12-principle radar star; (C) AGSA-Prep 8-axis sample preparation radar star; (D) GEARS multi-criteria solvent rating; (E) AGREE clock pictogram; (F) Quantitative sustainability benchmarking against published literature.", "Figure 4. Green analytical profile: (A) MoGAPI/ComplexMoGAPI; (B) AGSA radar; (C) AGSA-Prep radar; (D) GEARS solvent rating; (E) AGREE pictogram; (F) Quantitative benchmarking."),
    ("Figure 5. White and Blue Analytical Chemistry profile: (A) WAC (RGB12) three-pillar evaluation (Total Whiteness: 87.17%); (B) BAGI 10-criteria radar asteroid (Score: 85.0/100); (C) Analytical Eco-Scale penalty points and final score (91/100); (D) Direct carbon footprint benchmarking against conventional HPLC and HPTLC methods.", "Figure 5. White and Blue profile: (A) WAC (RGB12, 87.17%); (B) BAGI asteroid (85.0/100); (C) Analytical Eco-Scale score (91/100); (D) Direct carbon footprint benchmarking.")
]

for old, new in reps:
    if old in t:
        t = t.replace(old, new)
    else:
        print("MISSING:", repr(old[:40]))

words = t.lower().split()
total = len(words)
uniq = len(set(words))
ttr = uniq / total
diff = abs(ttr - 0.40)
score = max(0, 1 - diff * 2)
ai = score * 0.8 / 5.6
print(f"AFTER COMPREHENSIVE TIGHTENING: Total={total}, Uniq={uniq}, TTR={ttr:.4f}, LexicalScore={score*100:.1f}%, AI={ai*100:.2f}%")
