#!/usr/bin/env python3
"""Rebuild the built-in question bank inside index.html from bank/OD*.txt.
Usage: python3 tools/build_bank.py   (run from the repo root)
The hosted site also reads bank/*.txt live, so this only refreshes the offline fallback."""
import re, json, glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS = {'# learn': 'learn', '# battle': 'battle', '# words': 'words', '# reading': 'reading', '# grammar': 'grammar', '# speak-write': 'sw',
            '# sound': 'sound', '# story': 'story', '# sort': 'sort', '# pairs': 'pairs', '# build': 'build'}
bank = {}
for f in sorted(glob.glob(os.path.join(root, 'bank', 'OD*.txt')) + glob.glob(os.path.join(root, 'bank', 'OPW*.txt'))):
    lv = os.path.basename(f)[:-4]
    units = []; cur = None; mode = None
    for raw in open(f, encoding='utf-8').read().split('\n'):
        l = raw.strip()
        if l.startswith('## '):
            parts = [x.strip() for x in l[3:].split('|')]
            m = re.search(r'\d+', parts[0])
            if not m: continue
            partial = '(partial)' in parts[0] or '(partial)' in (parts[1] if len(parts) > 1 else '')
            cur = {'n': int(m.group()), 'title': (parts[1] if len(parts) > 1 else '').replace('(partial)', '').strip(),
                   'bq': parts[2] if len(parts) > 2 else '', 'learn': [], 'battle': [], 'words': [], 'reading': [], 'grammar': [], 'sw': [],
                   'sound': [], 'story': [], 'sort': [], 'pairs': [], 'build': [], 'partial': partial}
            units.append(cur); mode = None; continue
        if l in SECTIONS: mode = SECTIONS[l]; continue
        if not l or l.startswith('===') or l.startswith('//') or not cur or not mode: continue
        cur[mode].append(l)
    units.sort(key=lambda u: u['n'])
    bank[lv] = {'units': units}
    print(lv, len(units), 'units', sum(1 for u in units if u['words'] or u['reading'] or u['story']), 'with Learning Time activities')
js = 'const OD_BANK=' + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) + ';'
p = os.path.join(root, 'index.html'); s = open(p, encoding='utf-8').read()
if not re.search(r'const OD_BANK=\{.*?\};\n', s, flags=re.S): sys.exit('OD_BANK block not found')
new = re.sub(r'const OD_BANK=\{.*?\};\n', lambda m: js + '\n', s, count=1, flags=re.S)
open(p, 'w', encoding='utf-8').write(new); print('index.html updated')
