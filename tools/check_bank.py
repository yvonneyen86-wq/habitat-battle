#!/usr/bin/env python3
"""Validate bank/OD*.txt: unit headers, type codes, required fields, no Chinese. Usage: python3 tools/check_bank.py"""
import re, glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok = True
for f in sorted(glob.glob(os.path.join(root, 'bank', 'OD*.txt'))):
    s = open(f, encoding='utf-8').read(); cur = None; mode = None; units = 0
    for i, raw in enumerate(s.split('\n'), 1):
        l = raw.strip()
        if re.search(r'[一-鿿]', l): print(f'{f}:{i}: Chinese text'); ok = False
        if l.startswith('## '): cur = l; mode = None; units += 1; continue
        if l == '# learn': mode = 'L'; continue
        if l == '# battle': mode = 'B'; continue
        if not l or l.startswith('===') or l.startswith('//'): continue
        if mode == 'B':
            t = l.split('|')[0].strip()
            if t not in ('S', 'T', 'B', 'F', 'W', 'P', 'PT', 'C', 'Z'): print(f'{f}:{i}: unknown type "{t}"'); ok = False
            if t == 'C' and l.count('|') < 3: print(f'{f}:{i}: C needs question | option A | option B'); ok = False
            if t == 'F' and l.count('|') < 2: print(f'{f}:{i}: F needs wrong | correct'); ok = False
            if t in ('W', 'P', 'PT') and l.count('|') < 1: print(f'{f}:{i}: {t} needs a value'); ok = False
        elif mode is None and cur: print(f'{f}:{i}: line outside # learn / # battle'); ok = False
    print(os.path.basename(f), units, 'units')
print('OK' if ok else 'PROBLEMS FOUND'); sys.exit(0 if ok else 1)
