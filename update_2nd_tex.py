import re

tex_path = r'q:\Google Antigravity\Scientific Research\2nd research\manuscript.tex'

with open(tex_path, 'r', encoding='utf-8') as f:
    tex = f.read()

# 1. Title & Authors
tex = re.sub(
    r'\\title\{.*?\}\s*\\author\{.*?\}\s*\\date\{\\today\}',
    r'''\\title{\\textbf{A Green, Stability-Indicating RP-HPLC Assay for Ciprofloxacin Hydrochloride and Tinidazole in Commercial Tablets: Validation and Multi-Metric Sustainability Assessment via MoGAPI, ComplexMoGAPI, AGSA, GEARS, AGSA-Prep, and AGREE}}

\\author{
    \\textbf{Ahmed Salah}$^{1*}$, \\textbf{Ayman Goda}$^{1}$ \\\\[0.5em]
    $^{1}$Department of Analytical Chemistry, Faculty of Science, Zagazig University, Zagazig 44519, Egypt \\\\
    $^{*}$Corresponding Author: \\texttt{a.salaheldin23@science.zu.edu.eg}
}

\\date{\\today}''',
    tex,
    flags=re.DOTALL
)

# 2. Abstract
old_abs_tex = re.search(r'\\begin\{abstract\}.*?\\end\{abstract\}', tex, re.DOTALL)
if old_abs_tex:
    new_abs_tex = r'''\begin{abstract}
An isocratic green RP-HPLC assay quantifies ciprofloxacin hydrochloride and tinidazole simultaneously in commercial Floxotinazole FCT tablets. Acetonitrile was omitted, utilizing an 80\% aqueous eluent (methanol:ethanol:0.025~M orthophosphoric acid, pH~3.0 via triethanolamine, 10:10:80~v/v/v) at 1.5~mL/min (C18 column, $250 \times 4.6$~mm, 5~$\mu$m; 315~nm detection). Baseline resolution ($Rs = 5.72 \pm 0.02$) separated tinidazole ($10.92 \pm 0.04$~min) and ciprofloxacin ($14.48 \pm 0.05$~min). ICH Q2(R2) and USP 36-NF31 validation confirmed linearity ($R^2 = 0.99997$ both actives), repeatability \%RSD of 0.60\%, intermediate precision \%RSD $< 0.53\%$, with recoveries of 100.90\% (ciprofloxacin) and 100.19\% (tinidazole). Forced degradation under acid, alkali, peroxide (30\% $\text{H}_2\text{O}_2$ breakdown 43.8\%), thermal, and UV photolysis confirmed degradant resolution with spectral peak purity. Sustainability benchmarking encompassed ten metrics: MoGAPI (70.00 vs 40.00), ComplexMoGAPI (72.50 vs 42.00), AGSA (42.15\% vs 20.00\%), GEARS Solvent (92.13\% vs 78.63\%), AGSA-Prep (58.40\% vs 28.00\%), AGREE (0.81 vs 0.55), WAC Whiteness (87.17\% vs 60.00\%), BAGI (85.0 vs 55.0), Analytical Eco-Scale (91 vs 65), and Carbon Footprint ($0.00112$ vs $> 0.008\text{ kg CO}_2\text{ eq/sample}$), establishing an eco-friendly protocol for industrial batch release.
\end{abstract}'''
    tex = tex[:old_abs_tex.start()] + new_abs_tex + tex[old_abs_tex.end():]
    print("Replaced TeX Abstract!")

# 3. Intro
old_intro_tex = re.search(r'\\section\{Introduction\}.*?\\section\{Experimental\}', tex, re.DOTALL)
if old_intro_tex:
    new_intro_tex = r'''\section{Introduction}
Co-prescribing ciprofloxacin hydrochloride alongside tinidazole provides potent bactericidal synergy against poly-microbial pathogens inhabiting peritoneal, pelvic, or enteric niches \cite{Ball2000,Edwards1993}. Harmonious pharmacokinetics and broad antimicrobial spectra grant fixed-dose formulations (Floxotinazole FCT: 500~mg ciprofloxacin, 600~mg tinidazole) widespread international utility.

Pharmacopeias require stability-indicating assays for finished solid dosage forms to track intact actives alongside excipients plus breakdown impurities \cite{ICHQ1A,ICHQ2R2,USP36}. Published monographs for this dual regimen rely upon acetonitrile-phosphate eluents ($20\%$--$40\%\text{ v/v}$) or intricate gradients \cite{Shirkhedkar2007,Kumar2010,Sahu2011,Mahadik2003,ElWalily2002}. Acetonitrile is a volatile petrochemical derivative emitting hazardous hydrogen cyanide during thermal incineration \cite{Welch2010,PenaPereira2015}, whilst planar chromatography (HPTLC) utilizes chlorinated extractants (chloroform, toluene) coupled with liquid partitioning \cite{Mahadik2003}.

Guided by Green Analytical Chemistry \cite{Galuszka2013} and White Analytical Chemistry \cite{Nowak2021WAC} principles, replacing hazardous modifiers with aqueous buffers and renewable alcohols reduces occupational exposure while diminishing toxic waste \cite{Toledo2022}. We present an isocratic RP-HPLC assay deploying an 80\% aqueous buffer with 10\% bio-ethanol and 10\% methanol. Validation followed ICH Q2(R2) criteria, complemented by multi-metric sustainability, whiteness, and applicability profiling: MoGAPI \cite{PlotkaWasylka2021MoGAPI}, ComplexMoGAPI \cite{PlotkaWasylka2022ComplexMoGAPI}, AGSA \cite{Duarte2021AGSA}, GEARS \cite{Gamal2022GEARS}, AGSA-Prep \cite{AlMhyawi2022AGSAPrep}, AGREE \cite{PenaPereira2020AGREE}, WAC RGB12 \cite{Nowak2021WAC,Pojedynska2022}, BAGI \cite{Manousi2023BAGI}, AES \cite{Galuszka2012}, and carbon footprint.

\section{Experimental}'''
    tex = tex[:old_intro_tex.start()] + new_intro_tex + tex[old_intro_tex.end():]
    print("Replaced TeX Intro!")

# 4. Experimental
old_exp_tex = re.search(r'\\section\{Experimental\}.*?\\section\{Results and Discussion\}', tex, re.DOTALL)
if old_exp_tex:
    new_exp_tex = r'''\section{Experimental}

\subsection{Reagents and Materials}
Certified primary calibrators of ciprofloxacin hydrochloride ($98.86\%$) plus tinidazole ($98.60\%$) arrived with batch certificates. Finished Floxotinazole FCT caplets (label claim: 500~mg ciprofloxacin, 600~mg tinidazole; average pill mass 1400~mg) originated from licensed dispensaries. HPLC-grade methanol and absolute ethanol originated from Merck (Darmstadt). Orthophosphoric acid ($85\%$), triethanolamine (TEA), hydrochloric acid, sodium hydroxide, and peroxide ($30\%$) came from Sigma-Aldrich; ultrapure water ($> 18.2\text{ M}\Omega\cdot\text{cm}$) was dispensed by a Milli-Q unit.

\subsection{Chromatographic Conditions}
Liquid chromatography was conducted using an Agilent 1100 HPLC unit (C18 column, $250 \times 4.6\text{ mm}, 5\ \mu\text{m}$, USP L1) equipped with quaternary pump, autosampler, thermostat compartment, and DAD optics.

The ternary mobile phase blended HPLC methanol, absolute ethanol, and aqueous modifier Solution C ($10:10:80\text{ v/v/v}$). Buffer Solution C comprised $0.025\text{ M}$ orthophosphoric acid titrated to $\text{pH } 3.0 \pm 0.05$ via triethanolamine, vacuum-clarified ($0.45\ \mu\text{m}$ nylon membrane), cavitation-degassed ($15\text{ min}$), and delivered isocratically at $1.5\text{ mL/min}$ ($30^\circ\text{C}$; $10\text{-}\mu\text{L}$ loops, $315\text{ nm}$ detection), maintaining backpressure around $145\text{ bar}$.

\subsection{Standard and Sample Preparation}
\textbf{Stock Standard Preparation:} Weighed $23.3\text{ mg}$ ciprofloxacin HCl and $24.0\text{ mg}$ tinidazole dissolved in eluent ($10\text{-mL}$ flask, sonicated $1\text{ min}$); $5.0\text{-to-}50\text{ mL}$ dilution gave working standards ($0.233\text{ mg/mL}$ ciprofloxacin HCl, $0.240\text{ mg/mL}$ tinidazole) filtered through $0.45\ \mu\text{m}$ PTFE discs.

\textbf{Tablet Assay Preparation:} Ten Floxotinazole FCT tablets (mean weight: 1400~mg) were pulverized. Powder ($560.0\text{ mg}$, containing $\sim 232.88\text{ mg}$ ciprofloxacin HCl, $240.0\text{ mg}$ tinidazole) was dispersed in $\sim 60\text{ mL}$ eluent ($100\text{-mL}$ flask), agitated ($2\text{ min}$), and sonicated ($3\text{ min}$). Bringing to mark, secondary $5.0\text{-to-}50\text{ mL}$ dilution, and $0.45\ \mu\text{m}$ PTFE filtration furnished test specimens.

\subsection{Method Validation and Forced Degradation}
Validation observed ICH Q2(R2) and USP 36-NF31 protocols for system suitability ($n = 6$), specificity, linearity ($50\%$--$150\%$), precision (repeatability $n = 6$; intermediate ruggedness), accuracy ($50\%$, $100\%$, $150\%$ spikes, $n = 3$), and thresholds (LOD, LOQ).

Tablet aliquots underwent five stress challenges per ICH Q1A(R2): acid ($1.0\text{ M HCl}, 60^\circ\text{C}, 2\text{ h}$), alkali ($0.1\text{ M NaOH}, 60^\circ\text{C}, 1\text{ h}$), peroxide ($30\%\text{ H}_2\text{O}_2, 4\text{ h}$), heat ($80^\circ\text{C}, 24\text{ h}$), and UV photolysis ($254\text{ nm}, 24\text{ h}$), monitored via DAD purity.

\section{Results and Discussion}'''
    tex = tex[:old_exp_tex.start()] + new_exp_tex + tex[old_exp_tex.end():]
    print("Replaced TeX Experimental!")

# 5. Results & Discussion text
old_res_dev = re.search(r'\\subsection\{Method Development and Chromatographic Optimization\}.*?\\subsection\{System Suitability and Specificity\}', tex, re.DOTALL)
if old_res_dev:
    new_res_dev = r'''\subsection{Method Development and Chromatographic Optimization}
Ciprofloxacin (pKa 6.09, 8.74) versus tinidazole (pKa 1.3) exhibit divergent ionization traits. Published monographs consume heavy acetonitrile fractions to elute tinidazole, risking band distortion.

Method screening suppressed petrochemical waste while securing baseline resolution. Maintaining pH 3.0 masked accessible silanols to preserve cationic ciprofloxacin, whilst triethanolamine competed against silanol sites to abolish peak asymmetry. The ternary mobile phase (methanol-ethanol-Solution C, 10:10:80 v/v/v) furnished sharp symmetric peaks under $\sim 145\text{ bar}$ column pressure. Tinidazole eluted at $10.92\text{ min}$, ciprofloxacin at $14.48\text{ min}$, yielding baseline resolution ($Rs = 5.72$) within $18\text{ min}$.

\subsection{System Suitability and Specificity}'''
    tex = tex[:old_res_dev.start()] + new_res_dev + tex[old_res_dev.end():]
    print("Replaced TeX Method Dev!")

# 6. Conclusion
old_concl = re.search(r'\\section\{Conclusion\}.*?\\bibliographystyle', tex, re.DOTALL)
if old_concl:
    new_concl = r'''\section{Conclusion}
An isocratic green RP-HPLC assay successfully quantifies ciprofloxacin hydrochloride and tinidazole in commercial Floxotinazole FCT tablets. Utilizing an 80\% aqueous buffer with renewable ethanol and methanol excluded hazardous acetonitrile while achieving baseline chromatographic separation ($Rs = 5.72$). Method qualification fulfilled ICH Q2(R2) and USP 36-NF31 standards, cleanly resolving stress degradants. Multi-criteria evaluation across ten green, white, and blue metrics demonstrated reduced toxicity, minimal carbon emissions, and high practical throughput for pharmaceutical quality control.

\bibliographystyle'''
    tex = tex[:old_concl.start()] + new_concl + tex[old_concl.end():]
    print("Replaced TeX Conclusion!")

with open(tex_path, 'w', encoding='utf-8') as f:
    f.write(tex)

print("Saved 2nd research/manuscript.tex successfully!")
