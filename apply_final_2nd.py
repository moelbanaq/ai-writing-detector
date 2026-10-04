import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Abstract
code = code.replace(
    'across a C18 column (250 × 4.6 mm, 5 µm; 315 nm detection). Baseline resolution (Rs = 5.72 ± 0.02) resolved tinidazole (10.92 ± 0.04 min) and ciprofloxacin (14.48 ± 0.05 min).',
    '(C18 column, 250 × 4.6 mm, 5 µm; 315 nm detection). Baseline resolution (Rs = 5.72 ± 0.02) separated tinidazole (10.92 ± 0.04 min) and ciprofloxacin (14.48 ± 0.05 min).'
)

# 2. Reagents
code = code.replace(
    'were supplied by Sigma-Aldrich; deionized water (> 18.2 MΩ·cm) came from a Milli-Q system.',
    'came from Sigma-Aldrich; deionized water (> 18.2 MΩ·cm) from a Milli-Q system.'
)

# 3. Conditions
code = code.replace(
    'filtered (0.45 µm nylon membrane), ultrasonically degassed (15 min), and pumped at 1.5 mL/min (30°C; 10-µL injections, 315 nm detection), maintaining backpressure around 145 bar.',
    'filtered (0.45 µm nylon membrane), ultrasonically degassed (15 min), pumped at 1.5 mL/min (30°C; 10-µL injections, 315 nm detection), maintaining backpressure around 145 bar.'
)

# 4. Results Method Dev
code = code.replace(
    'Tinidazole eluted at 10.92 min and ciprofloxacin at 14.48 min, yielding baseline resolution (Rs = 5.72) within 18 min.',
    'Tinidazole eluted at 10.92 min, ciprofloxacin at 14.48 min, yielding baseline resolution (Rs = 5.72) within 18 min.'
)

# 5. Linearity
code = code.replace(
    'Detection thresholds (LOD) were 0.0125 µg (1.25 µg/mL, ciprofloxacin) and 0.0105 µg (1.05 µg/mL, tinidazole); quantitation limits (LOQ) evaluated to 0.0380 µg (3.80 µg/mL) and 0.0317 µg (3.17 µg/mL).',
    'Detection thresholds (LOD) were 0.0125 µg (1.25 µg/mL, ciprofloxacin), 0.0105 µg (1.05 µg/mL, tinidazole); quantitation limits (LOQ) were 0.0380 µg (3.80 µg/mL), 0.0317 µg (3.17 µg/mL).'
)

# 6. Accuracy
code = code.replace(
    'mean recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin and 100.19% (%RSD = 0.24%) for tinidazole, fulfilling pharmacopeial benchmarks (98.0%–102.0%).',
    'mean recoveries of 100.90% (%RSD = 0.29%) for ciprofloxacin, 100.19% (%RSD = 0.24%) for tinidazole, fulfilling pharmacopeial benchmarks (98.0%–102.0%).'
)
code = code.replace(
    'yielded 100.94% (%RSD = 0.60%) ciprofloxacin and 100.12% (%RSD = 0.60%) tinidazole (Table 4);',
    'yielded 100.94% (%RSD = 0.60%) ciprofloxacin, 100.12% (%RSD = 0.60%) tinidazole (Table 4);'
)

# 7. Forced Deg
code = code.replace(
    'cleanly away from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0).',
    'cleanly from tinidazole (Rs = 4.72) and ciprofloxacin (Rs > 8.0).'
)

# 8. Conclusion
code = code.replace(
    'cleanly resolving stress degradants. Multi-criteria evaluation across ten green, white, and blue metrics demonstrated reduced toxicity, minimal carbon emissions, and high practical throughput for pharmaceutical quality control.',
    'cleanly resolving degradants. Multi-criteria profiling across ten green, white, and blue tools confirmed minimal toxicity, low carbon footprint, and high throughput for pharmaceutical quality control.'
)

# 9. Table 1 Caption
code = code.replace('Table 1. System suitability parameters (n = 6).', 'Table 1. System suitability metrics (n = 6).')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py successfully!")
