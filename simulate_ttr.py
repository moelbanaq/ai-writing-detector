import re

def test_ttr(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        text = f.read()
    words = text.lower().split()
    total = len(words)
    uniq = len(set(words))
    ttr = uniq / total
    diff = abs(ttr - 0.40)
    score = max(0, 1 - diff * 2)
    ai = score * 0.8 / 5.6
    print(f"{fpath}: Total={total}, Uniq={uniq}, TTR={ttr:.4f}, LexicalScore={score*100:.1f}%, AI={ai*100:.2f}%")
    return text

print("--- CURRENT DOCX TEXTS ---")
t1 = test_ttr('1st_docx_rebuilt.txt')
t2 = test_ttr('2nd_docx_rebuilt.txt')
