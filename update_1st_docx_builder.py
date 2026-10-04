import re

file_path = r'C:\Users\Mano\.gemini\antigravity\brain\d34f820c-a801-46a8-91fa-e53f95b4910a\scratch\build_manuscript_docx.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Heading replacements
content = content.replace('add_heading_1("1. Introduction")', 'add_heading_1("Introduction")')
content = content.replace('add_heading_1("2. Experimental")', 'add_heading_1("Experimental Section")')
content = content.replace('add_heading_2("2.1. Reagents and Apparatus")', 'add_heading_2("Reagents and Apparatus")')
content = content.replace('add_heading_2("2.2. Chromatographic Conditions")', 'add_heading_2("Chromatographic Conditions")')
content = content.replace('add_heading_2("2.3. Preparation of Solutions and Aerosol Sampling")', 'add_heading_2("Preparation of Solutions and Aerosol Sampling")')
content = content.replace('add_heading_2("2.4. Validation and Forced Degradation Protocols")', 'add_heading_2("Validation and Forced Degradation Protocols")')
content = content.replace('add_heading_2("2.5. Sustainability Assessment Framework")', 'add_heading_2("Sustainability Assessment Framework")')
content = content.replace('add_heading_1("3. Results and Discussion")', 'add_heading_1("Results and Discussion")')
content = content.replace('add_heading_2("3.1. Method Development and Optimization")', 'add_heading_2("Method Development and Optimization")')
content = content.replace('add_heading_2("3.2. System Suitability and Specificity")', 'add_heading_2("System Suitability and Specificity")')
content = content.replace('add_heading_2("3.3. Linearity, Range, and Sensitivity")', 'add_heading_2("Linearity, Range, and Sensitivity")')
content = content.replace('add_heading_2("3.4. Accuracy, Precision, and Ruggedness")', 'add_heading_2("Accuracy, Precision, and Ruggedness")')
content = content.replace('add_heading_2("3.5. Forced Degradation and Stability-Indicating Profiling")', 'add_heading_2("Forced Degradation and Stability-Indicating Profiling")')
content = content.replace('add_heading_2("3.6. Multi-Metric Greenness Assessment and Literature Benchmarking")', 'add_heading_2("Multi-Metric Greenness Assessment and Literature Benchmarking")')
content = content.replace('add_heading_2("3.7. Multi-Dimensional Sustainability, Whiteness, and Practicality Assessment")', 'add_heading_2("Multi-Dimensional Sustainability, Whiteness, and Practicality Assessment")')
content = content.replace('add_heading_2("3.8. Application to Commercial Aerosol Formulation")', 'add_heading_2("Application to Commercial Aerosol Formulation")')
content = content.replace('add_heading_1("4. Conclusion")', 'add_heading_1("Conclusion")')

# Paragraph replacements
old_abs = '''abs_text = (
    "We developed an isocratic green RP-HPLC method to quantify D-tetramethrin and trans-cyphenothrin simultaneously "
    "in commercial pressurized insecticidal aerosols. Rather than relying on hazardous acetonitrile, the mobile phase "
    "uses bio-ethanol and water (5:95, v/v). On an Inertsil ODS-3V C18 column (250 × 4.6 mm, 5 µm) operated at 1.5 mL/min "
    "(220 nm UV detection), the two pyrethroids are cleanly resolved within 22 min (Rs = 13.52 ± 0.17). D-Tetramethrin elutes "
    "at 8.63 min and trans-cyphenothrin at 18.60 min. The assay met all ICH Q2(R2) criteria: linearity spanned 50% to 150% "
    "of target levels (R² = 0.9911 for D-tetramethrin, 0.9992 for trans-cyphenothrin), with repeatability RSD under 0.40% "
    "and intermediate precision RSD under 0.60%. Mean recoveries reached 99.02% and 100.46%. Forced degradation studies "
    "(acid, base, peroxide, heat, and UV) generated distinct breakdown products that remained well-separated from parent peaks "
    "(Rs ≥ 1.40). Sustainability was benchmarked using five modern assessment tools: MoGAPI (60.00 vs 28.5–38.0 in literature), "
    "ComplexMoGAPI (63.00 vs 30.2–40.5), AGSA star area (36.31% vs 15.2%–22.4%), GEARS solvent rating (79.81% vs 32.5%–43.0%), "
    "and AGSA-Prep (53.22% vs 24.5%–38.0%). The method provides a clean, reliable alternative for industrial aerosol release testing."
)'''

new_abs = '''abs_text = (
    "An isocratic green RP-HPLC method quantifies D-tetramethrin and trans-cyphenothrin simultaneously in commercial pressurized "
    "insecticidal aerosols. Acetonitrile was eliminated, utilizing an eluent combining bio-ethanol and water (5:95, v/v). "
    "On an Inertsil ODS-3V C18 column (250 × 4.6 mm, 5 µm) operated at 1.5 mL/min under 220 nm UV detection, both pyrethroids resolve "
    "cleanly within 22 min (Rs = 13.52 ± 0.17), eluting at 8.63 min (D-tetramethrin) and 18.60 min (trans-cyphenothrin). "
    "Validation followed ICH Q2(R2) criteria: linearity spanned 50% to 150% of target levels (R² = 0.9911 for D-tetramethrin, "
    "0.9992 for trans-cyphenothrin), with repeatability RSD under 0.40% and intermediate precision RSD below 0.60%. Mean recoveries "
    "were 99.02% and 100.46%. Forced degradation trials (acid, base, peroxide, heat, and UV) generated distinct breakdown products "
    "resolving cleanly from parent peaks (Rs ≥ 1.40). Sustainability benchmarking via five modern assessment frameworks yielded: "
    "MoGAPI (60.00 vs 28.5–38.0 in literature), ComplexMoGAPI (63.00 vs 30.2–40.5), AGSA star area (36.31% vs 15.2%–22.4%), "
    "GEARS solvent rating (79.81% vs 32.5%–43.0%), and AGSA-Prep (53.22% vs 24.5%–38.0%). This green assay offers an efficient, "
    "low-waste protocol for industrial release testing."
)'''

content = content.replace(old_abs, new_abs)

old_intro = '''intro_p1 = (
    "Pressurized domestic insect sprays routinely pair a fast-acting knockdown pyrethroid with a persistent killing agent. "
    "In KIROX MD aerosols, D-tetramethrin (type I) delivers the initial knockdown, while trans-cyphenothrin (type II) ensures "
    "mortality [1–5]. Analyzing these active ingredients in finished aerosol products is practically challenging. The active "
    "pyrethroids make up only 0.1% to 3.0% w/v of the formulation, dispersed within heavy petroleum distillates and liquefied "
    "hydrocarbon propellants like propane and butane [6]. Furthermore, both compounds are highly lipophilic (log P > 4.5) and "
    "share overlapping UV absorption bands between 220 and 230 nm. Their ester linkages can hydrolyze during prolonged shelf "
    "storage [7]. For routine quality control, manufacturers require stability-indicating methods that separate both actives "
    "from oily matrix excipients and breakdown products in line with ICH Q1A(R2) and Q2(R2) guidelines [8,9]."
)
doc.add_paragraph(intro_p1)

intro_p2 = (
    "Published analytical methods for pyrethroid aerosols carry substantial environmental and operational burdens. "
    "Gas chromatography-mass spectrometry (GC-MS) protocols [2] demand extensive electrical power (> 3 kWh per run) and "
    "multi-step liquid-liquid extraction using chlorinated solvents or n-hexane. High-performance thin-layer chromatography "
    "(HPTLC) methods [29] consume hazardous solvents such as toluene and diethyl ether. Standard HPLC monographs [27] rely "
    "predominantly on acetonitrile. Acetonitrile is a fossil-derived solvent that generates toxic cyanide gas during thermal waste "
    "treatment. Under Green Analytical Chemistry (GAC) [10,11] and White Analytical Chemistry (WAC) [12] frameworks, bio-ethanol "
    "is an attractive, renewable substitute with minimal toxicity [13–16]. Ethanol's viscosity at room temperature is higher "
    "than that of acetonitrile (1.08 vs 0.34 mPa·s at 25 °C), generating greater backpressure. However, this hydrodynamic "
    "challenge can be managed through column selection and sensible flow control."
)
doc.add_paragraph(intro_p2)

intro_p3 = (
    "Early greenness assessment tools like the Analytical Eco-Scale [23] and original GAPI [24] provide useful broad scores, "
    "but they miss key aspects of sample preparation hazard, solvent supply chains, and balance across green principles. More "
    "recent metric systems resolve these limitations: Modified GAPI (MoGAPI) [17], Complex Modified GAPI (ComplexMoGAPI) [18], "
    "Analytical Green Star Area (AGSA) [19], Green Environmental Assessment and Rating for Solvents (GEARS) [20], and AGSA for "
    "Sample Preparation (AGSA-Prep) [21]. Here, we present the development and validation of an isocratic ethanol-based RP-HPLC "
    "method for D-tetramethrin and trans-cyphenothrin in pressurized insect sprays, supported by comprehensive multi-metric "
    "benchmarking against established literature."
)'''

new_intro = '''intro_p1 = (
    "Pressurized household insecticides frequently pair fast-acting knockdown pyrethroids with persistent lethal actives. "
    "In commercial KIROX MD aerosols, D-tetramethrin (type I) provides rapid knockdown, while trans-cyphenothrin (type II) "
    "secures mortality [1–5]. Assaying both actives within commercial dispensers poses analytical challenges. Active ingredients "
    "comprise merely 0.1%–3.0% w/v, dispersed within heavy petroleum distillates and liquefied hydrocarbon propellants [6]. "
    "Both pyrethroids exhibit hydrophobic properties (log P > 4.5) alongside spectral overlap across 220–230 nm. Ester linkages "
    "remain susceptible to hydrolytic cleavage during prolonged shelf storage [7]. Industrial quality control demands stability-indicating "
    "protocols that separate both pyrethroids from oily matrix components and degradation products per ICH Q1A(R2)/Q2(R2) directives [8,9]."
)
doc.add_paragraph(intro_p1)

intro_p2 = (
    "Reported analytical methodologies for pyrethroid aerosols incur notable environmental and operational burdens. "
    "Gas chromatography-mass spectrometry (GC-MS) [2] requires elevated electrical energy (> 3 kWh/run) and multi-step extraction "
    "utilizing chlorinated solvents or n-hexane. Thin-layer chromatography (HPTLC) [29] consumes hazardous toluene and diethyl ether. "
    "Conventional HPLC monographs [27] rely upon toxic acetonitrile. Acetonitrile represents a petroleum derivative generating "
    "toxic cyanide vapors upon incineration. Within Green Analytical Chemistry (GAC) [10,11] and White Analytical Chemistry (WAC) [12] "
    "principles, bio-ethanol serves as an attractive renewable alternative [13–16]. Higher solvent viscosity (1.08 vs 0.34 mPa·s at 25 °C) "
    "increases hydrodynamic backpressure. Nevertheless, appropriate column dimensions and flow settings readily accommodate this pressure profile."
)
doc.add_paragraph(intro_p2)

intro_p3 = (
    "While the Analytical Eco-Scale [23] and original GAPI [24] offer foundational scores, they overlook sample preparation hazards, "
    "solvent supply life cycles, and principle balancing. Advanced metric systems resolve these limitations: Modified GAPI (MoGAPI) [17], "
    "Complex Modified GAPI (ComplexMoGAPI) [18], Analytical Green Star Area (AGSA) [19], Green Environmental Assessment and Rating for "
    "Solvents (GEARS) [20], and AGSA for Sample Preparation (AGSA-Prep) [21]. This study establishes an isocratic bio-ethanol RP-HPLC "
    "method quantifying both pyrethroids in retail dispensers, benchmarking its footprint across five sustainability frameworks."
)'''

content = content.replace(old_intro, new_intro)

old_exp = '''exp_p1 = (
    "Reference standards of D-tetramethrin (98.2% certified purity) and trans-cyphenothrin (98.5% certified purity) were "
    "supplied by Sumitomo Chemical Co., Ltd. (Tokyo, Japan). Commercial KIROX MD insecticidal aerosol canisters (labeled: 2.7% w/v "
    "D-tetramethrin, 0.9% w/v trans-cyphenothrin; Batch NOM4) were manufactured by Misr Detergents (MD Industries) and obtained "
    "from local retail stock. Absolute ethanol (HPLC grade, ≥ 99.8%) and acetone (analytical grade) were purchased from Merck "
    "(Darmstadt, Germany). Hydrochloric acid (37%), sodium hydroxide pellets, and hydrogen peroxide (30%) were sourced from "
    "Sigma-Aldrich. Ultrapure water (> 18.2 MΩ·cm) came from a Milli-Q water system (Millipore, Bedford, MA, USA). "
    "Chromatographic measurements were carried out on an Agilent 1100 series HPLC system (Agilent Technologies, Waldbronn, Germany) "
    "configured with a G1311A quaternary pump, G1313A autosampler, G1316A column compartment, and G1315B diode array detector (DAD), "
    "driven by ChemStation software."
)
doc.add_paragraph(exp_p1)

add_heading_2("Chromatographic Conditions")
exp_p2 = (
    "Separation was carried out on an Inertsil ODS-3V C18 column (250 × 4.6 mm, 5 µm, GL Sciences, Tokyo, Japan). The mobile phase "
    "was water:ethanol (5:95, v/v), filtered through a 0.45 µm nylon membrane filter and degassed by ultrasonic bath for 15 min. "
    "Isocratic elution ran at 1.5 mL/min with the column compartment held at 25 ± 2 °C. The injection volume was 20 µL, UV detection "
    "was monitored at 220 nm, and each run took 22.0 min. System backpressure remained steady around 172 bar (~2500 psi)."
)
doc.add_paragraph(exp_p2)

add_heading_2("Preparation of Solutions and Aerosol Sampling")
exp_p3 = (
    "Standard Stock Solution: We weighed 225.0 mg D-tetramethrin and 75.0 mg trans-cyphenothrin into a 100-mL volumetric flask, "
    "dissolved the material in acetone, sonicated for 10 min, and diluted to mark. Working Standard Solution: A 5.0-mL portion of stock "
    "solution was transferred into a 50-mL volumetric flask and brought to volume with acetone, giving 225.0 µg/mL D-tetramethrin and "
    "75.0 µg/mL trans-cyphenothrin. The mixture was passed through a 0.45 µm PTFE syringe filter before injection. Aerosol Canister "
    "Sampling: Aerosol cans were stood upright under an active fume hood and gently depressurized without shaking until propellant gas "
    "stopped escaping. A 5.0-mL sample of the remaining liquid concentrate was transferred into a 25-mL volumetric flask, dissolved "
    "in acetone, sonicated for 10 min, and diluted to volume. Next, 5.0-mL of this solution was diluted to 10-mL with acetone and "
    "filtered through a 0.45 µm PTFE disc."
)
doc.add_paragraph(exp_p3)

add_heading_2("Validation and Forced Degradation Protocols")
exp_p4 = (
    "Method validation followed ICH Q2(R2) recommendations [9], testing system suitability (n = 7), specificity (blank and placebo "
    "solutions), linearity (50%–150% range, 5 concentrations in triplicate), accuracy (50%, 100%, and 150% spike levels, n = 9), and "
    "precision (repeatability n = 6; intermediate precision across two analysts, two days, and two column lots, evaluated by one-way "
    "ANOVA). Forced degradation trials followed ICH Q1A(R2) guidelines [8]: acid stress (1.0 M HCl, 4 h), alkali stress (0.1 M NaOH, 1 h), "
    "oxidative stress (3% H2O2, 6 h), dry heat (60 °C, 6 h), and ultraviolet exposure (254 nm, 24 h). Peak purity was checked across "
    "all stressed runs with the diode array detector."
)'''

new_exp = '''exp_p1 = (
    "Analytical standards of D-tetramethrin (98.2% certified purity) and trans-cyphenothrin (98.5% certified purity) originated from "
    "Sumitomo Chemical Co., Ltd. (Tokyo, Japan). Commercial KIROX MD aerosol canisters (labeled: 2.7% w/v D-tetramethrin, 0.9% w/v "
    "trans-cyphenothrin; Batch NOM4, Misr Detergents) were procured from local retail stock. Absolute ethanol (HPLC grade, ≥ 99.8%) "
    "and acetone (analytical grade) were acquired from Merck (Darmstadt, Germany). Hydrochloric acid (37%), sodium hydroxide pellets, "
    "and hydrogen peroxide (30%) were supplied by Sigma-Aldrich. Ultrapure water (> 18.2 MΩ·cm) was dispensed by a Milli-Q purification "
    "unit (Millipore, Bedford, MA, USA). Chromatographic instrumentation comprised an Agilent 1100 HPLC system (Agilent Technologies, "
    "Waldbronn, Germany) equipped with a G1311A quaternary pump, G1313A autosampler, G1316A column compartment, and G1315B diode array "
    "detector (DAD), controlled via ChemStation software."
)
doc.add_paragraph(exp_p1)

add_heading_2("Chromatographic Conditions")
exp_p2 = (
    "Chromatographic separation utilized an Inertsil ODS-3V C18 column (250 × 4.6 mm, 5 µm, GL Sciences, Tokyo, Japan). The binary "
    "eluent contained water:ethanol (5:95, v/v), vacuum-filtered through a 0.45 µm nylon membrane and degassed ultrasonically for 15 min. "
    "Isocratic elution proceeded at 1.5 mL/min with column temperature maintained at 25 ± 2 °C. Injections of 20 µL were monitored "
    "spectrophotometrically at 220 nm across 22.0-min run intervals. Operating hydraulic pressure stabilized near 172 bar (~2500 psi)."
)
doc.add_paragraph(exp_p2)

add_heading_2("Preparation of Solutions and Aerosol Sampling")
exp_p3 = (
    "Standard Stock Formulation: Accurately weighed 225.0 mg D-tetramethrin and 75.0 mg trans-cyphenothrin were transferred into a "
    "100-mL volumetric flask, dissolved in acetone, sonicated for 10 min, and diluted to volume. Working Standard Preparation: A 5.0-mL "
    "aliquot of stock solution was transferred into a 50-mL flask and diluted with acetone, yielding 225.0 µg/mL D-tetramethrin and "
    "75.0 µg/mL trans-cyphenothrin. The resulting mixture was filtered through a 0.45 µm PTFE disc prior to chromatographic injection. "
    "Canister Sampling: Aerosol units stood upright inside an exhaust hood and were depressurized gradually without agitation until "
    "propellant discharge ceased completely. A 5.0-mL portion of remaining liquid concentrate was transferred into a 25-mL volumetric flask, "
    "dissolved in acetone, sonicated for 10 min, and brought to mark; subsequent 5.0-to-10 mL dilution with acetone and 0.45 µm PTFE "
    "filtration completed sample preparation."
)
doc.add_paragraph(exp_p3)

add_heading_2("Validation and Forced Degradation Protocols")
exp_p4 = (
    "Analytical validation adhered to ICH Q2(R2) directives [9], appraising system suitability (n = 7), specificity (blank and placebo "
    "solutions), linearity (50%–150% range, 5 concentrations in triplicate), accuracy (50%, 100%, and 150% spikes, n = 9), and precision "
    "(repeatability n = 6; intermediate precision across two analysts, days, and column lots via one-way ANOVA). Forced degradation "
    "followed ICH Q1A(R2) guidelines [8]: acid (1.0 M HCl, 4 h), alkali (0.1 M NaOH, 1 h), oxidative (3% H2O2, 6 h), thermal (60 °C, 6 h), "
    "and photolytic stress (254 nm, 24 h), with DAD peak purity monitoring."
)'''

content = content.replace(old_exp, new_exp)

old_res = '''res_p1 = (
    "Switching from acetonitrile to ethanol required balancing chromatographic retention against solvent viscosity. Initial runs using "
    "water:ethanol ratios between 80:20 and 90:10 (v/v) produced excessively broad peaks and pushed trans-cyphenothrin retention past 30 min. "
    "Raising the ethanol proportion to 95% (5:95, v/v) sharply improved peak symmetry and pulled both compounds into a practical 22-min window. "
    "D-Tetramethrin eluted at 8.63 min and trans-cyphenothrin at 18.60 min, yielding a baseline resolution of 13.52. System backpressure held "
    "near 172 bar, well below the equipment's 400-bar rating. Measuring absorbance at 220 nm gave strong analyte responses while avoiding "
    "ethanol's lower UV cutoff threshold (~205–210 nm)."
)
doc.add_paragraph(res_p1)

add_heading_2("System Suitability and Specificity")
res_p2 = (
    "Seven replicate standard injections met all pre-established criteria (Table 1). Retention times showed %RSD values of 0.75% for "
    "D-tetramethrin and 0.65% for trans-cyphenothrin. Peak area repeatability gave %RSDs of 1.75% and 2.26%. Plate counts averaged above 5,600 "
    "and 5,900, while tailing factors remained below 1.30. Specificity tests (Figure 2) showed no interfering signals from the solvent blank "
    "or placebo mixture in the elution windows of either active ingredient. Diode array spectral purity plots confirmed that both analyte peaks "
    "were spectrally homogeneous, with purity angles falling well within their purity thresholds."
)'''

new_res = '''res_p1 = (
    "Replacing acetonitrile with ethanol required balancing chromatographic retention against eluent viscosity. Initial trials using "
    "water:ethanol ratios (80:20 to 90:10, v/v) yielded broad peaks and delayed trans-cyphenothrin retention beyond 30 min. Raising ethanol "
    "content to 95% (5:95, v/v) optimized chromatographic symmetry, resolving both targets inside 22 min (D-tetramethrin: 8.63 min; "
    "trans-cyphenothrin: 18.60 min; Rs = 13.52). Hydraulic backpressure stabilized near 172 bar—well within equipment limits (400 bar). "
    "Spectrophotometric tracking at 220 nm maximized analyte sensitivity while avoiding ethanol's UV cutoff (~205–210 nm)."
)
doc.add_paragraph(res_p1)

add_heading_2("System Suitability and Specificity")
res_p2 = (
    "Seven replicate standard injections met ICH acceptance criteria (Table 1). Retention time precision (%RSD) reached 0.75% "
    "(D-tetramethrin) and 0.65% (trans-cyphenothrin), with peak area %RSDs of 1.75% and 2.26%. Theoretical plate counts exceeded 5,600 "
    "and 5,900, while peak tailing remained below 1.30. Specificity testing (Figure 2) revealed no interfering peaks from blank diluent or "
    "placebo matrix within analyte windows, with DAD purity angles confirming spectral homogeneity."
)'''

content = content.replace(old_res, new_res)

old_res345 = '''res_p3 = (
    "Five-point calibration curves showed good linearity from 50% to 150% of target concentrations (Table 2, Figure 1). Least-squares "
    "regression produced y = 52,258.49 x - 576,219.33 (R² = 0.9911) for D-tetramethrin (112.5–337.5 µg/mL) and y = 44,443.04 x + 118,031.51 "
    "(R² = 0.9992) for trans-cyphenothrin (37.5–112.5 µg/mL). Residual analysis confirmed homoscedastic variance across the tested concentration span. "
    "Detection limits (LOD) were 42.84 µg/mL for D-tetramethrin and 4.23 µg/mL for trans-cyphenothrin, with quantitation limits (LOQ) of 129.82 µg/mL "
    "and 12.82 µg/mL."
)
doc.add_paragraph(res_p3)'''

new_res345 = '''res_p3 = (
    "Five-point calibration plots exhibited linear responses spanning 50%–150% of target levels (Table 2, Figure 1). Least-squares regression "
    "yielded y = 52,258.49 x - 576,219.33 (R² = 0.9911) for D-tetramethrin (112.5–337.5 µg/mL) and y = 44,443.04 x + 118,031.51 (R² = 0.9992) "
    "for trans-cyphenothrin (37.5–112.5 µg/mL). Residual analysis confirmed homoscedastic error distributions. Detection limits (LOD) were "
    "42.84 µg/mL (D-tetramethrin) and 4.23 µg/mL (trans-cyphenothrin), with corresponding quantitation limits (LOQ) of 129.82 µg/mL and 12.82 µg/mL."
)
doc.add_paragraph(res_p3)'''

content = content.replace(old_res345, new_res345)

old_res4 = '''res_p4 = (
    "Method accuracy was confirmed by spiking inactive matrix at 50%, 100%, and 150% of nominal levels (Table 3). Across nine determinations, "
    "mean recoveries were 99.02% (%RSD = 0.94%) for D-tetramethrin and 100.46% (%RSD = 0.44%) for trans-cyphenothrin, well within standard "
    "regulatory bounds (98.0%–102.0%). Precision assessments (Table 4) showed repeatability RSDs of 0.39% (D-tetramethrin) and 0.24% "
    "(trans-cyphenothrin). Intermediate precision across different operators, days, and column serial numbers yielded RSDs below 0.60%. "
    "One-way ANOVA tests showed no significant difference between test days (F = 0.698, p = 0.423 for D-tetramethrin; F = 0.812, p = 0.388 "
    "for trans-cyphenothrin), demonstrating method ruggedness."
)'''

new_res4 = '''res_p4 = (
    "Accuracy trials spiking placebo matrix across 50%, 100%, and 150% levels (n = 9, Table 3) demonstrated mean analytical recoveries "
    "of 99.02% (%RSD = 0.94%) for D-tetramethrin and 100.46% (%RSD = 0.44%) for trans-cyphenothrin, satisfying regulatory limits (98.0%–102.0%). "
    "Precision assessments (Table 4) gave repeatability RSDs of 0.39% (D-tetramethrin) and 0.24% (trans-cyphenothrin). Intermediate ruggedness "
    "across operators, days, and column batches retained RSDs below 0.60%, with one-way ANOVA indicating no significant inter-day variation "
    "(F = 0.698, p = 0.423 for D-tetramethrin; F = 0.812, p = 0.388 for trans-cyphenothrin)."
)'''

content = content.replace(old_res4, new_res4)

old_res5 = '''res_p5 = (
    "Forced degradation experiments confirmed that intact active ingredients separate cleanly from decomposition products under all stress "
    "conditions (Table 5, Figure 3). Acid treatment (1.0 M HCl) degraded 13.80% of D-tetramethrin (Rs = 7.85) and 27.57% of trans-cyphenothrin "
    "(Rs = 1.47). Alkaline exposure (0.1 M NaOH) caused 6.14% and 8.31% loss (Rs = 3.50 and 1.40). Peroxide oxidation (3% H2O2) broke down "
    "28.49% of trans-cyphenothrin (Rs = 1.50) and 8.70% of D-tetramethrin (Rs = 3.52). Thermal stress at 60 °C caused 22.39% loss of "
    "trans-cyphenothrin (Rs = 1.28) and 3.50% of D-tetramethrin (Rs = 2.39). Both actives proved photostable under UV light, with less than "
    "3% degradation. In every instance, diode array peak purity verified that no breakdown products co-eluted with parent compounds, confirming "
    "the stability-indicating capability of the assay."
)'''

new_res5 = '''res_p5 = (
    "Forced degradation experiments confirmed baseline separation between intact pyrethroids and breakdown products across all stress "
    "conditions (Table 5, Figure 3). Acidic exposure (1.0 M HCl) degraded 13.80% D-tetramethrin (Rs = 7.85) and 27.57% trans-cyphenothrin "
    "(Rs = 1.47). Alkaline hydrolysis (0.1 M NaOH) induced 6.14% and 8.31% decomposition (Rs = 3.50 and 1.40). Peroxide oxidation (3% H2O2) "
    "degraded 28.49% trans-cyphenothrin (Rs = 1.50) and 8.70% D-tetramethrin (Rs = 3.52). Thermal stress (60 °C) triggered 22.39% loss in "
    "trans-cyphenothrin (Rs = 1.28) and 3.50% in D-tetramethrin (Rs = 2.39). UV irradiation revealed robust photostability (< 3% loss). "
    "Throughout all challenges, DAD spectral purity verified absence of co-eluting degradants."
)'''

content = content.replace(old_res5, new_res5)

old_res6 = '''res_p6 = (
    "We compared the green RP-HPLC method against the conventional acetonitrile method and published literature (GC-MS [2], HPTLC [29], "
    "and conventional HPLC [27]) using five advanced metrics (Tables 6–8, Figures 4–8):\\n"
    "• GEARS: Bio-ethanol scored 78.75% compared to 28.75% for acetonitrile. The total mobile phase scored 79.81%, compared to 43.00% for the "
    "legacy HPLC eluent and 32.5%–38.0% for GC-MS and HPTLC protocols reliant on dichloromethane, hexane, or toluene (Table 8, Figure 8C).\\n"
    "• AGSA: The 12-principle star area almost doubled, jumping from 18.65% (0.559/3.000) to 36.31% (1.089/3.000) through the switch to a "
    "renewable modifier, reduced toxicity, and safer handling (Figure 5C, Figure 7C). Literature GC-MS (15.2%) and HPTLC (22.4%) scored far lower.\\n"
    "• AGSA-Prep: Direct canister depressurization followed by solvent dilution achieved an AGSA-Prep area of 53.22% (1.505/2.828), vs 31.12% for "
    "conventional testing and 24.5%–38.0% for published extraction procedures (Figure 8A, B).\\n"
    "• MoGAPI and ComplexMoGAPI: Overall scores rose from 33.33 to 60.00 on MoGAPI and from 35.83 to 63.00 on ComplexMoGAPI, outperforming "
    "published pyrethroid assays (28.5–40.5) (Figure 7A, B).\\n"
    "• General Metrics: The AGREE score advanced from 0.47 to 0.77 (Figure 7D), the Analytical Eco-Scale score rose from 72 to 88 (a 57% reduction "
    "in penalty points), and WAC whiteness climbed from 71.2% to 86.0% (Table 6, Figure 4)."
)'''

new_res6 = '''res_p6 = (
    "We compared the green RP-HPLC method against the conventional acetonitrile method and published literature (GC-MS [2], HPTLC [29], "
    "and conventional HPLC [27]) using five advanced metrics (Tables 6–8, Figures 4–8). "
    "Regarding solvent greenness via GEARS, bio-ethanol scored 78.75% versus 28.75% for acetonitrile. The overall binary mobile phase registered "
    "79.81%, whereas conventional HPLC eluent attained 43.00% and literature GC-MS/HPTLC protocols reliant on dichloromethane, hexane, or toluene "
    "scored 32.5%–38.0% (Table 8, Figure 8C). In AGSA polygonal evaluation, the 12-principle star area reached 36.31% (1.089/3.000) compared to "
    "18.65% (0.559/3.000) for traditional HPLC, driven by renewable solvent sourcing, reduced toxicity, and safer laboratory handling (Figure 5C, "
    "Figure 7C); literature GC-MS (15.2%) and HPTLC (22.4%) exhibited substantially smaller areas. For sample preparation greenness, direct canister "
    "depressurization followed by dilution attained an AGSA-Prep coverage of 53.22% (1.505/2.828), outperforming conventional testing (31.12%) "
    "and literature extraction workflows (24.5%–38.0%) (Figure 8A, B). Assessment with MoGAPI and ComplexMoGAPI yielded overall scores of 60.00 "
    "and 63.00, respectively, markedly exceeding legacy HPLC (33.33 and 35.83) and published pyrethroid assays (28.5–40.5) (Figure 7A, B). "
    "Consensus across general metrics demonstrated substantial gains: the AGREE score reached 0.77 versus 0.47 (Figure 7D), the Analytical Eco-Scale "
    "score attained 88 versus 72 (a 57% decrease in penalty points), and total WAC whiteness reached 86.0% compared to 71.2% (Table 6, Figure 4)."
)'''

content = content.replace(old_res6, new_res6)

old_wac = '''res_wac = (
    "To evaluate the assay beyond ecological impact alone, we applied White Analytical Chemistry (WAC / RGB12 model), the Blue "
    "Applicability Grade Index (BAGI), the Analytical Eco-Scale (AES), and direct carbon footprint estimation (Figure 5). Total WAC "
    "whiteness reached 83.33%, combining strong analytical validation (Red: 88.5%), environmental responsibility (Green: 82.5%), "
    "and economic feasibility (Blue: 79.0%). BAGI scored 80.0 / 100, credited to simple dilute-and-shoot sample preparation, room temperature "
    "operation, and an ordinary C18 column. The Analytical Eco-Scale earned an 88/100 rating with only 12 penalty points deducted. Direct carbon "
    "footprint calculations indicated 0.00145 kg CO2 eq/sample—a twelve-fold reduction compared to literature GC-MS methods (0.01850 kg CO2 eq/sample)."
)
doc.add_paragraph(res_wac)'''

new_wac = '''res_wac = (
    "Holistic sustainability profiling beyond greenness integrated White Analytical Chemistry (WAC / RGB12), the Blue Applicability Grade "
    "Index (BAGI), Analytical Eco-Scale (AES), and carbon footprint estimation (Figure 5). Overall WAC whiteness reached 83.33% (Red: 88.5%, "
    "Green: 82.5%, Blue: 79.0%). BAGI scored 80.0/100, reflecting dilute-and-shoot execution, ambient column operation, and standard C18 hardware. "
    "Analytical Eco-Scale evaluation afforded 88/100 (12 penalty points). Direct carbon emissions totaled 0.00145 kg CO2 eq/sample—a twelve-fold "
    "reduction relative to published GC-MS workflows (0.01850 kg CO2 eq/sample)."
)
doc.add_paragraph(res_wac)'''

content = content.replace(old_wac, new_wac)

old_p7 = '''res_p7 = (
    "We tested the method on commercial KIROX MD canisters. Assays of six separate containers yielded mean recoveries of 100.2 ± 0.4% "
    "for D-tetramethrin and 100.5 ± 0.3% for trans-cyphenothrin, meeting commercial release specifications (90.0%–110.0%). No interference "
    "from container propellant or aerosol propellants was observed, confirming the assay's fitness for routine batch testing."
)
doc.add_paragraph(res_p7)

# 4. CONCLUSION
add_heading_1("4. Conclusion")
concl_text = (
    "We developed and validated an isocratic RP-HPLC method for analyzing D-tetramethrin and trans-cyphenothrin in commercial pressurized "
    "aerosols. Switching from acetonitrile to bio-ethanol eliminated toxic cyanide waste streams while maintaining complete chromatographic "
    "separation (Rs = 13.52). The method complied with all ICH Q2(R2) requirements and cleanly separated breakdown products across five "
    "forced degradation conditions. Comprehensive evaluation across ten greenness, whiteness, and blueness metrics confirmed clear ecological "
    "and practical benefits over existing GC-MS, HPTLC, and conventional HPLC protocols, offering an efficient, low-waste procedure for "
    "routine industrial release."
)'''

new_p7 = '''res_p7 = (
    "Real-world applicability was verified by assaying commercial KIROX MD aerosol canisters. Six independent containers demonstrated mean "
    "recoveries of 100.2 ± 0.4% (D-tetramethrin) and 100.5 ± 0.3% (trans-cyphenothrin), satisfying commercial release specifications "
    "(90.0%–110.0%). Excipient propellants exhibited zero chromatographic interference, verifying fitness for routine batch release."
)
doc.add_paragraph(res_p7)

# 4. CONCLUSION
add_heading_1("Conclusion")
concl_text = (
    "This study developed and qualified an isocratic RP-HPLC assay for quantifying D-tetramethrin and trans-cyphenothrin within commercial aerosols. "
    "Replacing acetonitrile with bio-ethanol eliminated toxic cyanide waste streams whilst maintaining baseline chromatographic resolution "
    "(Rs = 13.52). Analytical validation complied with ICH Q2(R2) criteria, cleanly separating degradants across five stress challenges. "
    "Comprehensive benchmarking across ten sustainability, whiteness, and blueness frameworks verified ecological superiority over legacy "
    "GC-MS, HPTLC, and conventional HPLC methods, providing an efficient, low-waste procedure for industrial quality assurance."
)'''

content = content.replace(old_p7, new_p7)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated build_manuscript_docx.py successfully.")
