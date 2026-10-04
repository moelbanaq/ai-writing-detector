import re

file_path = r'q:\Google Antigravity\Scientific Research\1st research\manuscript.tex'

with open(file_path, 'r', encoding='utf-8') as f:
    tex = f.read()

reps = [
    # Abstract
    (r'''\begin{abstract}
We developed an isocratic green RP-HPLC method to quantify D-tetramethrin and trans-cyphenothrin simultaneously in commercial pressurized insecticidal aerosols. Rather than relying on hazardous acetonitrile, the mobile phase uses bio-ethanol and water ($5:95\text{ v/v}$). On an Inertsil ODS-3V C18 column ($250 \times 4.6\text{ mm}, 5\ \mu\text{m}$) operated at $1.5\text{ mL/min}$ ($220\text{ nm}$ UV detection), the two pyrethroids are cleanly resolved within $22\text{ min}$ ($Rs = 13.52 \pm 0.17$). D-Tetramethrin elutes at $8.63\text{ min}$ and trans-cyphenothrin at $18.60\text{ min}$. The assay met all ICH Q2(R2) criteria: linearity spanned $50\%$ to $150\%$ of target levels ($R^2 = 0.9911$ for D-tetramethrin, $0.9992$ for trans-cyphenothrin), with repeatability RSD under $0.40\%$ and intermediate precision RSD under $0.60\%$. Mean recoveries reached $99.02\%$ and $100.46\%$. Forced degradation studies (acid, base, peroxide, heat, and UV) generated distinct breakdown products that remained well-separated from parent peaks ($Rs \ge 1.40$). Sustainability was benchmarked using five modern assessment tools: MoGAPI ($60.00$ vs $28.5$--$38.0$ in literature), ComplexMoGAPI ($63.00$ vs $30.2$--$40.5$), AGSA star area ($36.31\%$ vs $15.2\%$--$22.4\%$), GEARS solvent rating ($79.81\%$ vs $32.5\%$--$43.0\%$), and AGSA-Prep ($53.22\%$ vs $24.5\%$--$38.0\%$). The method provides a clean, reliable alternative for industrial aerosol release testing.
\end{abstract}''',
     r'''\begin{abstract}
An isocratic green RP-HPLC method quantifies D-tetramethrin and trans-cyphenothrin simultaneously in commercial insecticidal aerosols. Toxic acetonitrile was omitted, utilizing bio-ethanol:water ($5:95\text{ v/v}$) at $1.5\text{ mL/min}$ across an Inertsil ODS-3V C18 column ($250 \times 4.6\text{ mm}, 5\ \mu\text{m}$; $220\text{ nm}$ detection). Both pyrethroids resolved cleanly within $22\text{ min}$ ($Rs = 13.52 \pm 0.17$), eluting at $8.63\text{ min}$ (D-tetramethrin) and $18.60\text{ min}$ (trans-cyphenothrin). Validation adhered to ICH Q2(R2): linearity spanned $50\%$--$150\%$ ($R^2 = 0.9911$ D-tetramethrin, $0.9992$ trans-cyphenothrin), repeatability RSD was $< 0.40\%$, intermediate precision was $< 0.60\%$, with recoveries of $99.02\%$ and $100.46\%$. Stress challenges (acid, base, peroxide, heat, UV) showed clean degradant separation ($Rs \ge 1.40$). Sustainability benchmarking across five tools yielded: MoGAPI ($60.00$ vs $28.5$--$38.0$ in literature), ComplexMoGAPI ($63.00$ vs $30.2$--$40.5$), AGSA star area ($36.31\%$ vs $15.2\%$--$22.4\%$), GEARS rating ($79.81\%$ vs $32.5\%$--$43.0\%$), and AGSA-Prep ($53.22\%$ vs $24.5\%$--$38.0\%$), establishing an eco-friendly protocol for aerosol release.
\end{abstract}'''),

    # Intro p3
    (r'''Here, we present the development and validation of an isocratic ethanol-based RP-HPLC method for D-tetramethrin and trans-cyphenothrin in pressurized insect sprays, supported by comprehensive multi-metric benchmarking against established literature.''',
     r'''This study establishes an isocratic bio-ethanol RP-HPLC method quantifying both pyrethroids in retail dispensers, benchmarking its footprint across five sustainability frameworks.'''),

    # Reagents
    (r'''Reference standards of D-tetramethrin ($98.2\%$ certified purity) and trans-cyphenothrin ($98.5\%$ certified purity) were supplied by Sumitomo Chemical Co., Ltd. (Tokyo, Japan). Commercial KIROX MD insecticidal aerosol canisters (labeled: $2.7\%\text{ w/v}$ D-tetramethrin, $0.9\%\text{ w/v}$ trans-cyphenothrin; Batch NOM4) were manufactured by Misr Detergents (MD Industries) and obtained from local retail stock. Absolute ethanol (HPLC grade, $\ge 99.8\%$) and acetone (analytical grade) were purchased from Merck (Darmstadt, Germany). Hydrochloric acid ($37\%$), sodium hydroxide pellets, and hydrogen peroxide ($30\%$) were sourced from Sigma-Aldrich. Ultrapure water ($> 18.2\text{ M}\Omega\cdot\text{cm}$) came from a Milli-Q water system (Millipore, Bedford, MA, USA). Chromatographic measurements were carried out on an Agilent 1100 series HPLC system (Agilent Technologies, Waldbronn, Germany) configured with a G1311A quaternary pump, G1313A autosampler, G1316A column compartment, and G1315B diode array detector (DAD), driven by ChemStation software.''',
     r'''Sumitomo Chemical Co., Ltd. (Tokyo, Japan) supplied certified standards of D-tetramethrin ($98.2\%$) and trans-cyphenothrin ($98.5\%$). Commercial KIROX MD aerosols (labeled: $2.7\%\text{ w/v}$ D-tetramethrin, $0.9\%\text{ w/v}$ trans-cyphenothrin; Batch NOM4, Misr Detergents) were procured locally. HPLC ethanol ($\ge 99.8\%$) and acetone came from Merck (Darmstadt); acid ($37\%$), base pellets, and peroxide ($30\%$) were from Sigma-Aldrich; ultrapure water ($> 18.2\text{ M}\Omega\cdot\text{cm}$) was from a Milli-Q system. Liquid chromatography was performed on an Agilent 1100 HPLC system equipped with quaternary pump, autosampler, column oven, and DAD operated via ChemStation.'''),

    # Solutions and sampling
    (r'''\textbf{Standard Stock Solution:} We weighed $225.0\text{ mg}$ D-tetramethrin and $75.0\text{ mg}$ trans-cyphenothrin into a $100\text{-mL}$ volumetric flask, dissolved the material in acetone, sonicated for $10\text{ min}$, and diluted to mark.
\textbf{Working Standard Solution:} A $5.0\text{-mL}$ portion of stock solution was transferred into a $50\text{-mL}$ volumetric flask and brought to volume with acetone, giving $225.0\ \mu\text{g/mL}$ D-tetramethrin and $75.0\ \mu\text{g/mL}$ trans-cyphenothrin. The mixture was passed through a $0.45\ \mu\text{m}$ PTFE syringe filter before injection.
\textbf{Aerosol Canister Sampling:} Aerosol cans were stood upright under an active fume hood and gently depressurized without shaking until propellant gas stopped escaping. A $5.0\text{-mL}$ sample of the remaining liquid concentrate was transferred into a $25\text{-mL}$ volumetric flask, dissolved in acetone, sonicated for $10\text{ min}$, and diluted to volume. Next, $5.0\text{-mL}$ of this solution was diluted to $10\text{-mL}$ with acetone and filtered through a $0.45\ \mu\text{m}$ PTFE disc.''',
     r'''\textbf{Stock Formulation:} Accurately weighed $225.0\text{ mg}$ D-tetramethrin and $75.0\text{ mg}$ trans-cyphenothrin dissolved in acetone within a $100\text{-mL}$ flask, sonicated ($10\text{ min}$), and diluted to volume.
\textbf{Working Standard:} Diluting a $5.0\text{-mL}$ stock aliquot to $50\text{ mL}$ with acetone furnished working standards ($225.0\ \mu\text{g/mL}$ D-tetramethrin, $75.0\ \mu\text{g/mL}$ trans-cyphenothrin) filtered through $0.45\ \mu\text{m}$ PTFE discs.
\textbf{Canister Sampling:} Aerosols were depressurized upright in a fume hood without agitation. Concentrated liquid ($5.0\text{ mL}$) was dissolved in acetone ($25\text{-mL}$ flask, sonicated $10\text{ min}$, brought to mark); subsequent $5.0\text{-to-}10\text{ mL}$ dilution with acetone and $0.45\ \mu\text{m}$ PTFE disc filtration completed preparation.'''),

    # Sustainability Framework
    (r'''\subsection{Sustainability Assessment Framework}
Method sustainability was evaluated through five modern analytical metrics:
(i) MoGAPI \cite{PlotkaWasylka2021MoGAPI}, which assigns a 0 to 100 overall score across 15 green analytical parameters;
(ii) ComplexMoGAPI \cite{PlotkaWasylka2022ComplexMoGAPI}, which appends a 10-segment hexagon dedicated to sample preparation;
(iii) AGSA \cite{Duarte2021AGSA}, which calculates the polygon area of a 12-ray radar star representing the 12 GAC principles ($\text{Area} = 0.5 \cdot \sin(2\pi/12) \cdot \sum r_i r_{i+1}$);
(iv) GEARS \cite{Gamal2022GEARS}, which evaluates solvent safety across health, physical hazard, environmental persistence, and lifecycle;
and (v) AGSA-Prep \cite{AlMhyawi2022AGSAPrep}, which measures the greenness profile of sample preparation on an 8-axis star.''',
     r'''\subsection{Sustainability Assessment Framework}
Method greenness was evaluated across five metrics: MoGAPI \cite{PlotkaWasylka2021MoGAPI} ($0$--$100$ score over 15 parameters), ComplexMoGAPI \cite{PlotkaWasylka2022ComplexMoGAPI} (including 10-segment sample prep hexagon), AGSA \cite{Duarte2021AGSA} (12-principle radar polygon area), GEARS \cite{Gamal2022GEARS} (solvent multi-criteria hazard rating), and AGSA-Prep \cite{AlMhyawi2022AGSAPrep} (8-axis sample prep radar star).'''),

    # Sys suit
    (r'''Seven replicate standard injections met all pre-established criteria (Table~\ref{tab:sst}).''',
     r'''Seven replicate standard injections met ICH acceptance criteria (Table~\ref{tab:sst}).''')
]

for idx, (o, n) in enumerate(reps):
    if o in tex:
        tex = tex.replace(o, n)
        print(f"Replaced block {idx+1}")
    else:
        print(f"FAILED block {idx+1}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(tex)

print("Saved 1st research/manuscript.tex successfully!")
