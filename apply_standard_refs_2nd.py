import re

file_path = r'q:\Google Antigravity\Scientific Research\2nd research\create_docx_2nd.py'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

old_refs_block = re.search(r'# 6\. References\s*# -------------------------------------------------------------\s*add_heading_1\("References"\)\s*refs = \[(.*?)\]\s*for ref in refs:', code, re.DOTALL)

if old_refs_block:
    new_refs = '''# 6. References
# -------------------------------------------------------------
add_heading_1("References")
refs = [
    "[1] P. Ball, J. Antimicrob. Chemother. 46 (2000) 17–24.",
    "[2] D.I. Edwards, J. Antimicrob. Chemother. 31 (1993) 9–20.",
    "[3] ICH, Guideline Q1A(R2): Stability Testing of New Drug Substances and Products, Geneva, 2003.",
    "[4] ICH, Guideline Q2(R2): Validation of Analytical Procedures, Geneva, 2023.",
    "[5] United States Pharmacopeial Convention, USP 36–NF 31, Rockville, MD, 2013.",
    "[6] A.A. Shirkhedkar, S.J. Surana, E-J. Chem. 4 (2007) 341–346.",
    "[7] B.V.V.R. Kumar, B.S. Rao, K.R.S.S. Rao, C.S. Rao, S. Vidyadhara, Int. J. Pharm. Pharm. Sci. 2 (2010) 107–111.",
    "[8] R. Sahu, V.B. Patel, Indian J. Pharm. Sci. 73 (2011) 347–350.",
    "[9] K.R. Mahadik, H. Aggarwal, N. Kaul, J. Planar Chromatogr. 16 (2003) 306–310.",
    "[10] A.M. El-Walily, S.F. Belal, R.S. Bakry, J. Pharm. Biomed. Anal. 30 (2002) 1083–1092.",
    "[11] C.J. Welch, N. Wu, M. Biba, et al., TrAC Trends Anal. Chem. 29 (2010) 667–680.",
    "[12] F. Pena-Pereira, A. Kloskowski, J. Namieśnik, TrAC Trends Anal. Chem. 72 (2015) 3–11.",
    "[13] A. Gałuszka, Z. Migaszewski, J. Namieśnik, TrAC Trends Anal. Chem. 50 (2013) 78–84.",
    "[14] P.M. Nowak, R. Wietecha-Posłuszny, J. Pawliszyn, TrAC Trends Anal. Chem. 138 (2021) 116223.",
    "[15] C. Toledo-Neira, A. Alvarez-Lueje, J. Chromatogr. A 1678 (2022) 463365.",
    "[16] J. Płotka-Wasylka, W. Wojnowski, Green Chem. 23 (2021) 8657–8665.",
    "[17] J. Płotka-Wasylka, E. Kłodzińska, C. Morrison, J. Namieśnik, TrAC Trends Anal. Chem. 157 (2022) 116744.",
    "[18] T.A. Duarte, C. Welz, D. Galzerani, C. Manera, Sustain. Chem. Pharm. 21 (2021) 100431.",
    "[19] M. Gamal, G. Magdy, F. Belal, Green Chem. 24 (2022) 5870–5884.",
    "[20] S.R. Al-Mhyawi, M. Gamal, A.M. Abdel-Megied, Microchem. J. 181 (2022) 107786.",
    "[21] F. Pena-Pereira, W. Wojnowski, M. Tobiszewski, Anal. Chem. 92 (2020) 10076–10082.",
    "[22] N. Manousi, W. Wojnowski, J. Płotka-Wasylka, Green Chem. 25 (2023) 7598–7604.",
    "[23] A. Gałuszka, Z.M. Migaszewski, P. Konieczka, J. Namieśnik, TrAC Trends Anal. Chem. 37 (2012) 61–72.",
    "[24] M. Pojedyńska, R. Wietecha-Posłuszny, Separations 9 (2022) 220."
]

for ref in refs:'''
    code = code[:old_refs_block.start()] + new_refs + code[old_refs_block.end():]
    print("Replaced References with clean standard format!")
else:
    print("Could not find old references block!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved create_docx_2nd.py")
