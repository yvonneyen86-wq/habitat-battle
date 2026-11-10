#!/usr/bin/env python3
"""Validate bank/OD*.txt: unit headers, type codes, required fields, no Chinese. Usage: python3 tools/check_bank.py"""
import re, glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS = {'# learn': 'L', '# battle': 'B', '# words': 'W', '# reading': 'R', '# grammar': 'G', '# speak-write': 'S',
            '# sound': 'SO', '# story': 'ST', '# sort': 'SR', '# pairs': 'PR', '# build': 'BU'}
ok = True
def bad(msg):
    global ok
    print(msg); ok = False
def check_exam(f):
    """Junior High exam template: # choice (15 Q), # cloze (T, > text with [1]..[5], 5 K), # reading-test (T, > text, 4 RQ)."""
    txt = open(f, encoding='utf-8').read(); n = 0
    for blk in re.split(r'^(?=## )', txt, flags=re.M):
        if not blk.startswith('## '): continue
        n += 1; head = blk.split('\n', 1)[0]; mode = None; seen = []; q = 0; kT = 0; kTxt = []; kK = []; rT = 0; rTxt = []; rQ = 0
        if re.search(r'[\u4e00-\u9fff]', blk): bad(f'{f}: {head}: Chinese text')
        for l in [x.strip() for x in blk.split('\n')[1:]]:
            if not l or l.startswith('//'): continue
            if l in ('# choice', '# cloze', '# reading-test'): mode = l; seen.append(l); continue
            p = [x.strip() for x in l.split('|')]
            def opts4():
                o = p[-4:]
                if len(p) < 6 or any(not x for x in o) or len({x.lower() for x in o}) != 4: bad(f'{f}: {head}: need 4 different options: {l[:80]}')
            if mode == '# choice':
                if p[0] != 'Q' or l.count('___') != 1: bad(f'{f}: {head}: choice line must be Q | stem ___ | 4 options: {l[:80]}')
                opts4(); q += 1
            elif mode == '# cloze':
                if l.startswith('>'): kTxt.append(l[1:])
                elif p[0] == 'T': kT += 1
                elif p[0] == 'K': opts4(); kK.append(p[1])
                else: bad(f'{f}: {head}: cloze lines are T, > text, K: {l[:60]}')
            elif mode == '# reading-test':
                if l.startswith('>'): rTxt.append(l[1:])
                elif p[0] == 'T': rT += 1
                elif p[0] == 'RQ': opts4(); rQ += 1
                else: bad(f'{f}: {head}: reading-test lines are T, > text, RQ: {l[:60]}')
            else: bad(f'{f}: {head}: line outside a section: {l[:60]}')
        if seen != ['# choice', '# cloze', '# reading-test']: bad(f'{f}: {head}: sections must be # choice, # cloze, # reading-test')
        if q < 10: bad(f'{f}: {head}: only {q} choice questions')
        nums = [int(x) for x in re.findall(r'\[(\d+)\]', ' '.join(kTxt))]
        if kT != 1 or nums != list(range(1, len(kK) + 1)) or [int(x) for x in kK] != nums or len(kK) < 3: bad(f'{f}: {head}: cloze needs one T, blanks [1].. in order matching K lines (blanks {nums}, K {kK})')
        if rT != 1 or not rTxt or rQ < 3: bad(f'{f}: {head}: reading-test needs one T, a passage and at least 3 RQ')
    print(os.path.basename(f), n, 'units (exam template)')
for f in sorted(glob.glob(os.path.join(root, 'bank', 'OD*.txt')) + glob.glob(os.path.join(root, 'bank', 'OPW*.txt')) + glob.glob(os.path.join(root, 'bank', 'JH*.txt'))):
    if os.path.basename(f).startswith('JH'):
        check_exam(f); continue
    phon = os.path.basename(f).startswith('OPW')
    s = open(f, encoding='utf-8').read(); cur = None; mode = None; units = 0; rq = None; lt = 0; sq = None; buckets = None
    def close_unit():
        if rq is not None and rq and len(rq) != 8: bad(f'{f}: {cur} reading has {len(rq)} questions (want 8: RC x3, RT x3, RS x2)')
        if sq is not None and (sq['P'] < 2 or sq['RC'] != 3): bad(f'{f}: {cur} story needs 2-6 P panels and exactly 3 RC questions (got {sq["P"]} P, {sq["RC"]} RC)')
        if buckets is not None and len(buckets) < 2: bad(f'{f}: {cur} sort needs at least 2 different sounds (buckets)')
    for i, raw in enumerate(s.split('\n'), 1):
        l = raw.strip()
        if re.search(r'[一-鿿]', l): bad(f'{f}:{i}: Chinese text')
        if l.startswith('## '): close_unit(); cur = l; mode = None; units += 1; rq = None; sq = None; buckets = None; continue
        if l in SECTIONS:
            mode = SECTIONS[l]
            if mode == 'R': rq = []; lt += 1
            if mode == 'ST': sq = {'P': 0, 'RC': 0}; lt += 1
            if mode == 'SR': buckets = set()
            continue
        if not l or l.startswith('===') or l.startswith('//'): continue
        n = l.count('|'); t = l.split('|')[0].strip()
        if mode == 'B':
            if t not in ('S', 'T', 'B', 'F', 'W', 'P', 'PT', 'C', 'Z', 'M'): bad(f'{f}:{i}: unknown type "{t}"')
            if t == 'M' and n < 3: bad(f'{f}:{i}: M needs question | correct | wrong (| wrong | wrong)')
            if t == 'C' and n < 3: bad(f'{f}:{i}: C needs question | option A | option B')
            if t == 'F' and n < 2: bad(f'{f}:{i}: F needs wrong | correct')
            if t in ('W', 'P', 'PT') and n < 1: bad(f'{f}:{i}: {t} needs a value')
        elif mode == 'W' and phon:
            p = [x.strip() for x in l.split('|')]
            if n < 2: bad(f'{f}:{i}: phonics words need word | s/ou/nds | emoji'); continue
            w, ch = p[0], p[1].split('/')
            if not re.fullmatch(r'[a-z]+', w): bad(f'{f}:{i}: word must be lowercase letters: {w!r}')
            if ''.join(ch) != w: bad(f'{f}:{i}: sounds {p[1]!r} do not spell {w!r}')
            if len(ch) < 2: bad(f'{f}:{i}: {w!r} needs at least 2 sound pieces')
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
            if t in ('GT', 'R'):
                if n < 1: bad(f'{f}:{i}: {t} needs text after |')
                continue
            if t != 'G' or n < 1: bad(f'{f}:{i}: grammar lines are G | sentence (GT | title, R | formula line)')
            elif len(l.split('|', 1)[1].split()) < 3: bad(f'{f}:{i}: grammar sentence too short to scramble')
        elif mode == 'S':
            if t == 'SP':
                if not re.search(r'\|\s*A\s*:', l) or not re.search(r'\|\s*B\s*:', l): bad(f'{f}:{i}: SP needs A: and B: lines')
            elif t == 'SW':
                if n < 2 or '{' not in l: bad(f'{f}:{i}: SW needs model with {{slots}} | prompt')
            else: bad(f'{f}:{i}: speak-write lines are SP or SW')
        elif mode == 'SO':
            if n < 1: bad(f'{f}:{i}: sound lines are letters | label | key word')
        elif mode == 'ST':
            if t == 'P':
                sq['P'] += 1
                if n < 1 or not l.split('|')[1].strip(): bad(f'{f}:{i}: P needs the panel text (| picture is optional)')
            elif t == 'RC':
                sq['RC'] += 1
                if n < 3: bad(f'{f}:{i}: RC needs question | correct | wrong | wrong')
            else: bad(f'{f}:{i}: story lines are P | text | picture or RC | question | correct | wrong | wrong')
        elif mode == 'SR':
            p = [x.strip() for x in l.split('|')]
            if n < 1 or not p[0] or not p[1]: bad(f'{f}:{i}: sort lines are word | sound')
            else: buckets.add(p[1])
        elif mode == 'PR':
            p = [x.strip() for x in l.split('|')]
            if n < 1 or not all(p[:2]): bad(f'{f}:{i}: pairs lines are word | word')
        elif mode == 'BU':
            if t != 'G' or n < 1: bad(f'{f}:{i}: build lines are G | sentence')
            elif len(l.split('|', 1)[1].split()) < 3: bad(f'{f}:{i}: build sentence too short to scramble')
        elif mode is None and cur: bad(f'{f}:{i}: line outside a # section')
    close_unit()
    print(os.path.basename(f), units, 'units,', lt, 'with Learning Time activities')
print('OK' if ok else 'PROBLEMS FOUND'); sys.exit(0 if ok else 1)
