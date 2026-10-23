# Habitat Battle — notes for Claude (read before changing anything)

Classroom English game for 伊凡美語 (Yvonne's English, Hsinchu/Zhubei, Taiwan), built on Oxford Discover 1–5.
Live site: https://yvonneyen86-wq.github.io/habitat-battle/ (GitHub Pages, branch `main`, root). Every push to `main` goes live in 1–2 minutes.

## Hard rules
- **Everything students or the projector can see must be English only.** Chinese is allowed only in `docs/使用說明.md` and in replies to the teacher.
- The teacher (Yvonne) is the only user who edits this repo; she prefers 中文 replies, bullet points, concrete steps, no filler.
- Keep the game a **single self-contained `index.html`** (inline CSS/JS). External scripts: only PeerJS (jsDelivr), qrcodejs (cdnjs) and Three.js r128 (cdnjs; the host loads it on demand only when the teacher switches the 3D stage on). Nothing else.
- Never add logins, accounts, databases or analytics. Students join by scanning the QR code; connections are peer-to-peer (PeerJS); game state lives in the teacher's browser `localStorage`.
- Do not change the PeerJS id prefix (`habitatbattle-ivan-`) or the URL scheme `?join=CODE`.

## Layout
- `index.html` — the whole game (teacher console + projector stage + student tablet view). ~460 KB; about 140 KB of that is the 3D stage bundle between `/*3D-BUNDLE-BEGIN*/` and `/*3D-BUNDLE-END*/` — **never edit that block by hand**, edit `3d/*.js` and run `python3 3d/build.py`, which rebuilds the demo page and re-embeds the bundle.
- `bank/OD1.txt … OD5.txt` — Oxford Discover question bank, one file per level, 18 units each. **The hosted game fetches these at load time**, so editing a bank file on GitHub changes the questions without touching `index.html`. The same data is also embedded in `index.html` as `const OD_BANK=…` (offline fallback); regenerate it with `python3 tools/build_bank.py` after editing bank files.
- `tools/check_bank.py` — validates bank files (run before committing bank edits).
- `tools/build_bank.py` — embeds bank files into `index.html`.
- `tools/mkpreview.py` — builds `preview.html` (teacher screen with sample students, no network) for Claude artifact previews.
- `docs/使用說明.md` — teacher's manual (Chinese).
- `3d/` — Three.js 3D stage for the teacher/whiteboard screen, **embedded in `index.html`** behind the `🎮 3D` header toggle (default off, saved with the game state; THREE is fetched on demand and the game stays 2D if it fails). Read `3d/README.md` first. `3d/habitat-3d.html` is the standalone demo; `python3 3d/build.py` rebuilds it from the five `.js` files **and re-embeds the bundle into `index.html`**; `node 3d/stubtest.js` is the no-browser smoke test. Students' tablets stay 2D. In `index.html` the host talks to the stage only through `H.hb3d` (`sync/correct/attack/bossHit/bossDefeated/cheer/spotOne/spotTeam/overview`), see `apply3d()`/`view3d()`.
- `docs/3D整合指令.md` — the teacher's step-by-step prompts for integrating the 3D stage (Chinese).

## Bank file format
```
## U3 | Unit title | Big Question?
# learn
question | answer            (Learning-Time cards; answer optional)
# battle
T | question | model sentence (type a full sentence)
S | question                  (speak)
B | correct sentence          (sentence builder; game scrambles it)
F | wrong sentence | correct  (fix the mistake; alternatives separated by " / ")
W | word | prompt             (word bomb)
P | 🦁🌧️🏠 | prompt           (picture talk, speak)   PT = picture talk, type
C | question | option A | option B   (choose & defend)
Z | question                  (buzzer)
```
Lines starting with `//` are ignored. One question per line, `|` only as separator, no Chinese.

## Game architecture (index.html)
- Mode is decided by the URL: no `?join=` → teacher/host; `?join=CODE` → student.
- Host state object `S` (players, phase `gather|battle|end`, battle round data, qText/bText question text, bankSel). `changed()` = render + save + broadcast.
- Student state `ST`; students receive `{t:'state', s, me, my}` snapshots and send `{t:'join'|'buy'|'answer'|'build'|'choose'|'buzz'|'vote'|'act'|'power'}`.
- Question types parsed by `parseQ()`; battle flow: `nextRound()` → grading (`markCorrect(pid, tier 1|2|3)`) → students `onAct()` → optional `startDefense()` → `resolveRound()`. Extras: `summonBoss()`, `openVote()/revealVote()`, `requestSpell()/castSpell()`.
- Projector effects: canvas painters `paintScene()/paintDynamic()`, particle engine `burst/confetti/floatText/projectile`, `banner()` queue.
- Student tablet: `sSkeleton()/sPlay()/sDock()`; shop sheet `sShop()`; level-up animation `sTransform()`.
- `📱 Student view` on the teacher screen embeds a live student client in the same page (`openStudentView()`), useful for testing without a tablet.

## How to test a change
1. `python3 -c "import re;s=open('index.html').read();open('/tmp/x.js','w').write(re.search(r'<script>([\s\S]*)</script>',s).group(1))" && node --check /tmp/x.js`
2. `python3 tools/check_bank.py`
3. Serve locally (`python3 -m http.server 8080`) and open `index.html`, press **📱 Student view**, play one Learning-Time question and one battle round. Playwright is fine for automation; PeerJS can be mocked by stubbing `window.Peer` (see git history for `mock.js` pattern if present).
4. Commit and push to `main`. Tell the teacher in Chinese what changed and that the site updates in 1–2 minutes.

## Deploy
GitHub Pages serves `main` at the root. No build step. `preview.html` is optional.
