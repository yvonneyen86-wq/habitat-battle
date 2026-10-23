#!/usr/bin/env python3
"""Validate bank/OD*.txt: unit headers, type codes, required fields, no Chinese. Usage: python3 tools/check_bank.py"""
import re, glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS = {'# learn': 'L', '# battle': 'B', '# words': 'W', '# reading': 'R', '# grammar': 'G', '# speak-write': 'S'}
ok = True
def bad(msg):
    global ok
    print(msg); ok = False
for f in sorted(glob.glob(os.path.join(root, 'bank', 'OD*.txt'))):
    s = open(f, encoding='utf-8').read(); cur = None; mode = None; units = 0; rq = None; lt = 0
    def close_unit():
        if rq is not None and rq and len(rq) != 8: bad(f'{f}: {cur} reading has {len(rq)} questions (want 8: RC x3, RT x3, RS x2)')
    for i, raw in enumerate(s.split('\n'), 1):
        l = raw.strip()
        if re.search(r'[一-鿿]', l): bad(f'{f}:{i}: Chinese text')
        if l.startswith('## '): close_unit(); cur = l; mode = None; units += 1; rq = None; continue
        if l in SECTIONS:
            mode = SECTIONS[l]
            if mode == 'R': rq = []; lt += 1
            continue
        if not l or l.startswith('===') or l.startswith('//'): continue
        n = l.count('|'); t = l.split('|')[0].strip()
        if mode == 'B':
            if t not in ('S', 'T', 'B', 'F', 'W', 'P', 'PT', 'C', 'Z'): bad(f'{f}:{i}: unknown type "{t}"')
            if t == 'C' and n < 3: bad(f'{f}:{i}: C needs question | option A | option B')
            if t == 'F' and n < 2: bad(f'{f}:{i}: F needs wrong | correct')
            if t in ('W', 'P', 'PT') and n < 1: bad(f'{f}:{i}: {t} needs a value')
        elif mode == 'W':
            p = [x.strip() for x in l.split('|')]
            if n < 2: bad(f'{f}:{i}: words need word | syl·la·bles | chu/nks | emoji'); continue
            w, syl, ch = p[0], p[1].split('·'), p[2].split('/')
            if ''.join(syl).lower() != w.lower(): bad(f'{f}:{i}: syllables "{p[1]}" do not spell "{w}"')
            if ''.join(ch).lower() != w.lower(): bad(f'{f}:{i}: chunks "{p[2]}" do not spell "{w}"')
            if len(ch) < 2: bad(f'{f}:{i}: "{w}" needs at least 2 chunks')
            # every syllable boundary must also be a chunk boundary
            cuts = set(); acc = 0
            for c in ch: acc += len(c); cuts.add(acc)
            acc = 0
            for sy in syl[:-1]:
                acc += len(sy)
                if acc not in cuts: bad(f'{f}:{i}: chunk cut missing at syllable break "{p[1]}" vs "{p[2]}"')
        elif mode == 'R':
            if l.startswith('>'): continue
            if t not in ('RC', 'RT', 'RS'): bad(f'{f}:{i}: reading lines are > text, RC, RT or RS'); continue
            rq.append(t)
            if t == 'RC' and n < 3: bad(f'{f}:{i}: RC needs question | correct | wrong | wrong')
            if t == 'RT' and n < 2: bad(f'{f}:{i}: RT needs question | model sentence')
            if t == 'RS' and n < 1: bad(f'{f}:{i}: RS needs a question')
        elif mode == 'G':
            if t != 'G' or n < 1: bad(f'{f}:{i}: grammar lines are G | sentence')
            elif len(l.split('|', 1)[1].split()) < 3: bad(f'{f}:{i}: grammar sentence too short to scramble')
        elif mode == 'S':
            if t == 'SP':
                if not re.search(r'\|\s*A\s*:', l) or not re.search(r'\|\s*B\s*:', l): bad(f'{f}:{i}: SP needs A: and B: lines')
            elif t == 'SW':
                if n < 2 or '{' not in l: bad(f'{f}:{i}: SW needs model with {{slots}} | prompt')
            else: bad(f'{f}:{i}: speak-write lines are SP or SW')
        elif mode is None and cur: bad(f'{f}:{i}: line outside a # section')
    close_unit()
    print(os.path.basename(f), units, 'units,', lt, 'with Learning Time activities')
print('OK' if ok else 'PROBLEMS FOUND'); sys.exit(0 if ok else 1)
