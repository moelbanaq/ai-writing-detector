import re

fpath = r'C:\Users\Mano\.gemini\antigravity\brain\d34f820c-a801-46a8-91fa-e53f95b4910a\scratch\build_manuscript_docx.py'

with open(fpath, 'r', encoding='utf-8') as f:
    code = f.read()

reps = [
    ('''Analytical standards of D-tetramethrin (98.2% certified purity) and trans-cyphenothrin (98.5% certified purity) originated from "
    "Sumitomo Chemical Co., Ltd. (Tokyo, Japan). Commercial KIROX MD aerosol canisters (labeled: 2.7% w/v D-tetramethrin, 0.9% w/v "
    "trans-cyphenothrin; Batch NOM4, Misr Detergents) were procured from local retail stock. Absolute ethanol (HPLC grade, ≥ 99.8%) "
    "and acetone (analytical grade) were acquired from Merck (Darmstadt, Germany). Hydrochloric acid (37%), sodium hydroxide pellets, "
    "and hydrogen peroxide (30%) were supplied by Sigma-Aldrich. Ultrapure water (> 18.2 MΩ·cm) was dispensed by a Milli-Q purification "
    "unit (Millipore, Bedford, MA, USA). Chromatographic instrumentation comprised an Agilent 1100 HPLC system (Agilent Technologies, "
    "Waldbronn, Germany) equipped with a G1311A quaternary pump, G1313A autosampler, G1316A column compartment, and G1315B diode array "
    "detector (DAD), controlled via ChemStation software.''',
     '''Sumitomo Chemical Co., Ltd. (Tokyo, Japan) supplied certified standards of D-tetramethrin (98.2%) and trans-cyphenothrin (98.5%). "
    "Commercial KIROX MD aerosols (labeled: 2.7% w/v D-tetramethrin, 0.9% w/v trans-cyphenothrin; Batch NOM4, Misr Detergents) were procured "
    "locally. HPLC ethanol (≥ 99.8%) and acetone came from Merck (Darmstadt); acid (37%), base pellets, and peroxide (30%) were from Sigma-Aldrich; "
    "ultrapure water (> 18.2 MΩ·cm) was from a Milli-Q system. Liquid chromatography was performed on an Agilent 1100 HPLC system equipped with quaternary "
    "pump, autosampler, column oven, and DAD operated via ChemStation.'''),

    ('''Standard Stock Formulation: Accurately weighed 225.0 mg D-tetramethrin and 75.0 mg trans-cyphenothrin were transferred into a "
    "100-mL volumetric flask, dissolved in acetone, sonicated for 10 min, and diluted to volume. Working Standard Preparation: A 5.0-mL "
    "aliquot of stock solution was transferred into a 50-mL flask and diluted with acetone, yielding 225.0 µg/mL D-tetramethrin and "
    "75.0 µg/mL trans-cyphenothrin. The resulting mixture was filtered through a 0.45 µm PTFE disc prior to chromatographic injection. "
    "Canister Sampling: Aerosol units stood upright inside an exhaust hood and were depressurized gradually without agitation until "
    "propellant discharge ceased completely. A 5.0-mL portion of remaining liquid concentrate was transferred into a 25-mL volumetric flask, "
    "dissolved in acetone, sonicated for 10 min, and brought to mark; subsequent 5.0-to-10 mL dilution with acetone and 0.45 µm PTFE "
    "filtration completed sample preparation.''',
     '''Stock Formulation: Accurately weighed 225.0 mg D-tetramethrin and 75.0 mg trans-cyphenothrin dissolved in acetone within a 100-mL flask, "
    "sonicated (10 min), and diluted to volume. Working Standard: Diluting a 5.0-mL stock aliquot to 50 mL with acetone furnished working standards "
    "(225.0 µg/mL D-tetramethrin, 75.0 µg/mL trans-cyphenothrin) filtered through 0.45 µm PTFE discs. Canister Sampling: Aerosols were depressurized "
    "upright in a fume hood without agitation. Concentrated liquid (5.0 mL) was dissolved in acetone (25-mL flask, sonicated 10 min, brought to mark); "
    "subsequent 5.0-to-10 mL dilution with acetone and 0.45 µm PTFE disc filtration completed preparation.'''),

    ('''Method sustainability was evaluated through five modern analytical metrics: (i) MoGAPI [17], which assigns a 0 to 100 overall score "
    "across 15 green analytical parameters; (ii) ComplexMoGAPI [18], which appends a 10-segment hexagon dedicated to sample preparation; "
    "(iii) AGSA [19], which calculates the polygon area of a 12-ray radar star representing the 12 GAC principles (Area = 0.5 · sin(2π/12) · "
    "Σ r_i · r_{i+1}); (iv) GEARS [20], which evaluates solvent safety across health, physical hazard, environmental persistence, and lifecycle; "
    "and (v) AGSA-Prep [21], which measures the greenness profile of sample preparation on an 8-axis star.''',
     '''Method greenness was evaluated across five metrics: MoGAPI [17] (0–100 score over 15 parameters), ComplexMoGAPI [18] (including 10-segment "
    "sample prep hexagon), AGSA [19] (12-principle radar polygon area), GEARS [20] (solvent multi-criteria hazard rating), and AGSA-Prep [21] (8-axis "
    "sample prep radar star).'''),

    ('''abs_text = (
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
)''',
     '''abs_text = (
    "An isocratic green RP-HPLC method quantifies D-tetramethrin and trans-cyphenothrin simultaneously in commercial insecticidal "
    "aerosols. Toxic acetonitrile was omitted, utilizing bio-ethanol:water (5:95, v/v) at 1.5 mL/min across an Inertsil ODS-3V C18 column "
    "(250 × 4.6 mm, 5 µm; 220 nm detection). Both pyrethroids resolved cleanly within 22 min (Rs = 13.52 ± 0.17), eluting at 8.63 min "
    "(D-tetramethrin) and 18.60 min (trans-cyphenothrin). Validation adhered to ICH Q2(R2): linearity spanned 50%–150% (R² = 0.9911 D-tetramethrin, "
    "0.9992 trans-cyphenothrin), repeatability RSD was < 0.40%, intermediate precision was < 0.60%, with recoveries of 99.02% and 100.46%. "
    "Stress challenges (acid, base, peroxide, heat, UV) showed clean degradant separation (Rs ≥ 1.40). Sustainability benchmarking across "
    "five tools yielded: MoGAPI (60.00 vs 28.5–38.0 in literature), ComplexMoGAPI (63.00 vs 30.2–40.5), AGSA star area (36.31% vs 15.2%–22.4%), "
    "GEARS rating (79.81% vs 32.5%–43.0%), and AGSA-Prep (53.22% vs 24.5%–38.0%), establishing an eco-friendly protocol for aerosol release."
)''')
]

for idx, (o, n) in enumerate(reps):
    if o in code:
        code = code.replace(o, n)
        print(f"Replaced block {idx+1}")
    else:
        print(f"FAILED block {idx+1}")

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved updated build_manuscript_docx.py")
