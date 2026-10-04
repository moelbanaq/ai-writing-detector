import re
import sys

def optimize_1st_text(text):
    t = text
    
    # Redundant filler removals & conciseness
    reps = [
        # Abstract
        ('We developed an isocratic green RP-HPLC method to quantify', 'An isocratic green RP-HPLC method quantifies'),
        ('our mobile phase pairs bio-ethanol and water (5:95, v/v).', 'the mobile phase combines bio-ethanol and water (5:95, v/v).'),
        ('the two pyrethroids are cleanly resolved within 22 min', 'both pyrethroids resolve cleanly within 22 min'),
        ('The assay met all ICH Q2(R2) criteria:', 'Validation followed ICH Q2(R2) criteria:'),
        ('Mean recoveries reached 99.02% and 100.46%.', 'Mean recoveries were 99.02% and 100.46%.'),
        ('Sustainability was benchmarked using five modern assessment tools:', 'Sustainability benchmarking via five modern assessment frameworks yielded:'),
        ('The method provides a clean, reliable alternative for industrial aerosol release testing.', 'This green assay offers an efficient, low-waste protocol for industrial release testing.'),
        
        # Introduction
        ('Pressurized domestic insect sprays routinely pair a fast-acting knockdown pyrethroid with a persistent killing agent.',
         'Pressurized household insecticides frequently pair fast-acting knockdown pyrethroids with persistent lethal actives.'),
        ('In KIROX MD aerosols, D-tetramethrin (type I) delivers the initial knockdown, while trans-cyphenothrin (type II) ensures mortality [1–5].',
         'In commercial KIROX MD aerosols, D-tetramethrin (type I) provides rapid knockdown while trans-cyphenothrin (type II) secures mortality [1–5].'),
        ('Analyzing these active ingredients in finished aerosol products is practically challenging.',
         'Assaying both actives within commercial dispensers poses analytical challenges.'),
        ('The active pyrethroids make up only 0.1% to 3.0% w/v of the formulation, dispersed within heavy petroleum distillates and liquefied hydrocarbon propellants like propane and butane [6].',
         'Formulations contain merely 0.1–3.0% w/v active ingredients dispersed across heavy petroleum distillates and pressurized liquefied propellants [6].'),
        ('Their ester linkages can hydrolyze during prolonged shelf storage [7].',
         'Ester linkages remain susceptible to hydrolytic cleavage during prolonged storage [7].'),
        ('For routine quality control, manufacturers require stability-indicating methods that separate both actives from oily matrix excipients and breakdown products in line with ICH Q1A(R2) and Q2(R2) guidelines [8,9].',
         'Manufacturing release requires stability-indicating procedures that resolve both pyrethroids from matrix excipients and degradation products per ICH Q1A(R2)/Q2(R2) directives [8,9].'),
        
        # Paragraph 2
        ('Published analytical methods for pyrethroid aerosols carry substantial environmental and operational burdens.',
         'Reported analytical methodologies for pyrethroid aerosols incur notable environmental and operational burdens.'),
        ('Gas chromatography-mass spectrometry (GC-MS) protocols [2] demand extensive electrical power (> 3 kWh per run) and multi-step liquid-liquid extraction using chlorinated solvents or n-hexane.',
         'Gas chromatography-mass spectrometry (GC-MS) [2] requires high electrical energy (> 3 kWh/run) and multi-step extraction utilizing chlorinated solvents or n-hexane.'),
        ('High-performance thin-layer chromatography (HPTLC) methods [29] consume hazardous solvents such as toluene and diethyl ether.',
         'Thin-layer chromatography (HPTLC) [29] consumes hazardous toluene and diethyl ether.'),
        ('Standard HPLC monographs [27] rely predominantly on acetonitrile.',
         'Conventional HPLC monographs [27] rely upon toxic acetonitrile.'),
        ('Acetonitrile is a fossil-derived solvent that generates toxic cyanide gas during thermal waste treatment.',
         'Acetonitrile represents a petroleum derivative generating toxic cyanide vapors upon incineration.'),
        ('Under Green Analytical Chemistry (GAC) [10,11] and White Analytical Chemistry (WAC) [12] frameworks, bio-ethanol is an attractive, renewable substitute with minimal toxicity [13–16].',
         'Within Green Analytical Chemistry (GAC) [10,11] and White Analytical Chemistry (WAC) [12] principles, bio-ethanol serves as an attractive renewable alternative [13–16].'),
        ('Ethanol\'s viscosity at room temperature is higher than that of acetonitrile (1.08 vs 0.34 mPa·s at 25 °C), generating greater backpressure.',
         'Higher solvent viscosity (1.08 vs 0.34 mPa·s at 25 °C) increases hydrodynamic backpressure.'),
        ('However, this hydrodynamic challenge can be managed through column selection and sensible flow control.',
         'Nevertheless, appropriate column dimensions and flow settings readily accommodate this pressure profile.'),
        
        # Paragraph 3
        ('Early greenness assessment tools like the Analytical Eco-Scale [23] and original GAPI [24] provide useful broad scores, but they miss key aspects of sample preparation hazard, solvent supply chains, and balance across green principles.',
         'While the Analytical Eco-Scale [23] and original GAPI [24] offer foundational scores, they overlook sample preparation hazards, solvent supply life cycles, and principle balancing.'),
        ('More recent metric systems resolve these limitations: Modified GAPI (MoGAPI) [17], Complex Modified GAPI (ComplexMoGAPI) [18], Analytical Green Star Area (AGSA) [19], Green Environmental Assessment and Rating for Solvents (GEARS) [20], and AGSA for Sample Preparation (AGSA-Prep) [21].',
         'Advanced metric systems address these gaps: Modified GAPI (MoGAPI) [17], Complex Modified GAPI (ComplexMoGAPI) [18], Analytical Green Star Area (AGSA) [19], Green Environmental Assessment and Rating for Solvents (GEARS) [20], and AGSA for Sample Preparation (AGSA-Prep) [21].'),
        ('We established and qualified an isocratic bio-ethanol RP-HPLC protocol for quantifying both actives in retail dispensers, contrasting its footprint against five sustainability frameworks.',
         'This study establishes an isocratic bio-ethanol RP-HPLC method quantifying both pyrethroids in retail dispensers, benchmarking its footprint across five sustainability frameworks.'),
    ]
    
    for old, new in reps:
        t = t.replace(old, new)
        
    return t

with open('1st_enriched.txt', 'r', encoding='utf-8') as f:
    text = f.read()

opt = optimize_1st_text(text)
with open('1st_opt_test.txt', 'w', encoding='utf-8') as f:
    f.write(opt)

print('Saved 1st_opt_test.txt')
