#!/usr/bin/env python3
"""One-page unit review worksheet (English only) from the bank files.

Usage: python3 tools/worksheet.py OD2 1 [more units…] [--out DIR] [--pdf]
Writes DIR/<LEVEL>-U<N>.html (and .pdf with --pdf, needs node + playwright).
Sections: Words (trace + write) · Write (sentence frame or copy) · I can… + parent signature.
Pictures: emoji from the bank, or the book crop (drive:ID#x,y,w,h) fetched from Drive and embedded.
"""
import re, os, sys, json, base64, io, subprocess, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CACHE = os.environ.get('HB_WS_CACHE', os.path.join(os.path.expanduser('~'), '.cache', 'hb-worksheet'))

def parse_level(level):
    txt = open(os.path.join(ROOT, 'bank', level + '.txt'), encoding='utf-8').read()
    units = {}; u = None; sec = None
    for raw in txt.split('\n'):
        l = raw.strip()
        if l.startswith('## '):
            m = re.match(r'## U(\d+)\s*\|\s*([^|]*)\|?\s*([^|]*)', l); u = {'n': int(m.group(1)), 'title': m.group(2).strip(), 'bq': m.group(3).strip(), 'sec': {}}
            units[u['n']] = u; sec = None; continue
        if l.startswith('# '): sec = l[2:].strip(); u['sec'].setdefault(sec, []); continue
        if not l or l.startswith('//') or u is None or sec is None: continue
        u['sec'][sec].append([x.strip() for x in l.split('|')])
    return units

def pic_data(ref):
    """emoji → ('emoji', str); drive crop → ('img', data-uri) or None."""
    ref = (ref or '').strip()
    if not ref: return None
    m = re.match(r'drive:([\w-]+)(?:#([\d.]+),([\d.]+),([\d.]+),([\d.]+))?$', ref)
    if not m: return ('emoji', ref)
    try:
        from PIL import Image
    except ImportError: return None
    os.makedirs(CACHE, exist_ok=True); fid = m.group(1); p = os.path.join(CACHE, fid + '.png')
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-sL', '--max-time', '40', '-o', p, f'https://drive.google.com/thumbnail?id={fid}&sz=w1200'], check=False)
    try: im = Image.open(p).convert('RGB')
    except Exception: return None
    if m.group(2):
        x, y, w, h = map(float, m.groups()[1:]); W, H = im.size
        im = im.crop((int(x/100*W), int(y/100*H), int((x+w)/100*W), int((y+h)/100*H)))
    im.thumbnail((260, 200)); buf = io.BytesIO(); im.save(buf, 'JPEG', quality=85)
    return ('img', 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode())

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def word_cell(word, hint, pic):
    p = ''
    if pic and pic[0] == 'img': p = f'<img src="{pic[1]}" alt="">'
    elif pic: p = f'<span class="emo">{esc(pic[1])}</span>'
    return f'<div class="wc"><div class="pic">{p}</div><div class="hint">{esc(hint)}</div><div class="trace">{esc(word)}</div><div class="line"></div></div>'

def frame_html(s):
    # {word} → blank with the word printed small above it
    return re.sub(r'\{([^}]*)\}', lambda m: f'<span class="blank"><small>{esc(m.group(1))}</small></span>', esc(s))

def build(level, u):
    sec = u['sec']; phon = level.upper().startswith('OPW')
    book = 'Oxford Phonics World ' + level[3:] if phon else 'Oxford Discover ' + level[2:]
    cells = []
    if phon:
        for f in sec.get('words', [])[:12]:
            cells.append(word_cell(f[0], ' · '.join(f[1].split('/')), pic_data(f[2] if len(f) > 2 else '')))
    else:
        for f in sec.get('words', [])[:12]:
            cells.append(word_cell(f[0], f[1].replace('·', ' · ') if len(f) > 1 else '', pic_data(f[3] if len(f) > 3 else '')))
    # write section
    if phon:
        sents = [f[1] for f in sec.get('build', []) if f[0] == 'G'][:2]
        copy = ''.join(f'<div class="copy"><div class="trace s">{esc(s)}</div><div class="line"></div></div>' for s in sents)
        sounds = ', '.join(f[0] for f in sec.get('sound', []))
        write = f'''<h2>2. Read and copy</h2>{copy}
<h2>3. Write your own sentence</h2><p class="prompt">Use two words from the box.</p><div class="wbox">{esc('   '.join(f[0] for f in sec.get('words', [])[:12]))}</div><div class="line"></div><div class="line"></div>'''
        can = [f'I can say the sounds: {sounds}.', 'I can read and spell the unit words.', 'I can read the story.']
    else:
        sw = next((f for f in sec.get('speak-write', []) if f[0] == 'SW'), None)
        frame = frame_html(sw[1]) if sw else ''
        prompt = esc(sw[2]) if sw and len(sw) > 2 else 'Write three sentences.'
        write = f'''<h2>2. Write</h2><p class="prompt">{prompt}</p><div class="frame">{frame}</div><div class="line"></div><div class="line"></div><div class="line"></div>'''
        can = ['I can read and spell the unit words.', 'I can write sentences about the unit.', 'I can talk about the Big Question.' if u['bq'] else 'I can talk about the unit.']
    checks = ''.join(f'<label><span class="box"></span>{esc(c)}</label>' for c in can)
    title = esc(u['title']); bq = f'<div class="bq">{esc(u["bq"])}</div>' if u['bq'] else ''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{esc(level)} Unit {u['n']} Review</title>
<style>
@page{{size:A4;margin:12mm 12mm 10mm}}*{{box-sizing:border-box}}
body{{font-family:"Liberation Sans","DejaVu Sans","Noto Color Emoji",sans-serif;color:#1e2433;margin:0;font-size:11pt}}
.top{{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #2f9e44;padding-bottom:4px;margin-bottom:6px}}
.brand{{font-weight:800;color:#2f9e44;font-size:9.5pt;letter-spacing:.3px;white-space:nowrap}}h1{{margin:0;font-size:17pt}}.bq{{color:#555;font-size:10pt;margin-top:2px}}
.meta{{text-align:right;font-size:10pt;line-height:1.9;white-space:nowrap}}.meta span{{display:inline-block;border-bottom:1px solid #333;min-width:30mm;margin:0 6px 0 4px}}.meta span:last-child{{min-width:22mm;margin-right:0}}
h2{{font-size:12pt;margin:7px 0 4px;color:#1971c2}}
.words{{display:grid;grid-template-columns:repeat(4,1fr);gap:5px 8px}}
.wc{{border:1px solid #ddd;border-radius:6px;padding:4px 6px 5px;text-align:center}}
.pic{{height:17mm;display:flex;align-items:center;justify-content:center}}.pic img{{max-height:17mm;max-width:100%;border-radius:4px}}.emo{{font-size:26pt;line-height:1}}
.hint{{font-size:8.5pt;color:#888;letter-spacing:.5px;min-height:11pt}}
.trace{{font-family:"DejaVu Sans","Liberation Sans",sans-serif;font-size:17pt;color:#b8b8b8;letter-spacing:1.5px;border-bottom:1px dashed #bbb;line-height:1.25}}
.trace.s{{font-size:14pt;letter-spacing:.5px;text-align:left}}
.line{{border-bottom:1.2px solid #333;height:10mm}}.wc .line{{height:8.5mm}}
.copy{{margin-bottom:4px}}.wbox{{border:1.5px solid #1971c2;border-radius:6px;padding:4px 8px;font-size:12pt;letter-spacing:.3px;margin-bottom:4px;white-space:pre-wrap}}
.prompt{{margin:0 0 3px;font-size:10.5pt;color:#444}}
.frame{{font-size:13pt;line-height:2.1;margin-bottom:2px}}.blank{{display:inline-block;min-width:28mm;border-bottom:1.2px solid #333;text-align:center;vertical-align:bottom;position:relative;height:1.4em}}
.blank small{{position:absolute;left:0;right:0;top:-1.1em;font-size:7.5pt;color:#999;font-style:italic}}
.foot{{display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;border-top:1px solid #ccc;padding-top:6px}}
.can label{{display:block;font-size:10.5pt;margin:2px 0}}.box{{display:inline-block;width:11px;height:11px;border:1.5px solid #333;border-radius:2px;vertical-align:-1px;margin-right:6px}}
.sign{{font-size:10pt}}.sign span{{display:inline-block;border-bottom:1px solid #333;min-width:45mm;margin-left:4px}}
</style></head><body>
<div class="top"><div><div class="brand">YVONNE ENGLISH ARENA · {esc(book)} · UNIT REVIEW</div><h1>Unit {u['n']}: {title}</h1>{bq}</div>
<div class="meta">Name <span></span><br>Class <span></span> Date <span></span></div></div>
<h2>1. Words — trace, then write</h2><div class="words">{''.join(cells)}</div>
{write}
<div class="foot"><div class="can"><b>I can…</b>{checks}</div><div class="sign">Parent signature <span></span></div></div>
</body></html>'''

def main():
    args = [a for a in sys.argv[1:]]; out = '.'; pdf = False
    if '--out' in args: i = args.index('--out'); out = args[i+1]; del args[i:i+2]
    if '--pdf' in args: args.remove('--pdf'); pdf = True
    level, nums = args[0], [int(x) for x in args[1:]]
    units = parse_level(level); os.makedirs(out, exist_ok=True); made = []
    for n in nums:
        if n not in units: print('no unit', n); continue
        p = os.path.join(out, f'{level}-U{n}.html'); open(p, 'w', encoding='utf-8').write(build(level, units[n])); made.append(p); print('wrote', p)
    if pdf and made:
        subprocess.run(['node', os.path.join(HERE, 'worksheet_pdf.js'), *made], check=False)
main()
