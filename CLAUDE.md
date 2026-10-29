# Yvonne English Arena (repo "habitat-battle") — notes for Claude (read before changing anything)

The game is named **Yvonne English Arena** on every screen (renamed from "Habitat Battle" on 2026-10-29). The repo name, the Pages URL, the PeerJS prefix and the file names stay `habitat-battle`/`habitatbattle` — do not rename those.

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
- `3d/` — Three.js 3D stage for the teacher/whiteboard screen, **embedded in `index.html`** behind the `🎮 3D` header toggle (default off, saved with the game state; THREE is fetched on demand and the game stays 2D if it fails). Read `3d/README.md` first. `3d/habitat-3d.html` is the standalone demo; `python3 3d/build.py` rebuilds it from the five `.js` files **and re-embeds the bundle into `index.html`**; `node 3d/stubtest.js` is the no-browser smoke test. Students' tablets get an optional **mini 3D** of their own home (Setup → Student tablets; `S.tab3d`, student code `sMini()`, bundle flags `HB3D_MINI`/`HB3D_STAGE_ID`; auto-falls back to the 2D picture under 14 fps). In `index.html` the host talks to the stage only through `H.hb3d` (`sync/correct/attack/bossHit/bossDefeated/cheer/spotOne/spotTeam/overview`), see `apply3d()`/`view3d()`.
- `docs/3D整合指令.md` — the teacher's step-by-step prompts for integrating the 3D stage (Chinese).
- `cr-manifest.json` + the first `<script>` in `index.html` (the "課堂導航・橋 v1" bridge, verbatim from the spec — do not edit) — integration with the school's classroom runner. With `?screen=board|tablet` inside the runner's iframe the game takes the roster and questions from `cr:init`, skips the QR/join screens and reports `start/answer/grade/points/finish` via `CR.event`; without `?screen=` nothing changes. Host side: `crHostSetup/crFinish/crEvent`; tablet: `crTabletAnswer` and the auto `claim` by `crId`. Notes for the teacher: `docs/課堂導航整合.md`. Coins reset every lesson (`points:false`).

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
# words                       (Learning Time 🔤 Words — chunk spelling with syllable boxes)
word | syl·la·bles | chu/nks | 🪶      (chunks are coarse word-family pieces, e.g. fea/thers, am/phib/i/ans; every syllable break must also be a chunk break; 1-syllable words split onset/rime: g/ills)
# reading                     (Learning Time 📖 Reading — exactly 8 questions: RC×3, RT×3, RS×2)
> Title                       (first > line is the title, the rest are paragraphs)
> paragraph …
RC | question | correct | wrong | wrong   (choice; correct option FIRST, the game shuffles)
RT | question | model sentence           (type a full sentence; teacher grades)
RS | question                            (speak; students raise a hand, teacher grades)
# grammar                     (Learning Time 🧩 Grammar — unscramble, 6–8 sentences)
G | correct sentence
# speak-write                 (Learning Time 💬 Speak & Write)
SP | A: line | B: line | A: My {leg} hurts! | B: line | leg / head / ear   ({} = swappable key word, last field = the words to swap)
SW | My favorite animal group is {birds}. They have {wings}. | prompt      ({} = parts the student changes in their own sentences)
```
Phonics levels (`bank/OPW1.txt … OPW5.txt`, Oxford Phonics World) use these sections instead of `# learn/# battle` (battle + learn lines are generated from them):
```
## U1 | Short a: cat, hat, map |
# sound
a | short a | apple              (letters | label | key word; chunks equal to the letters are highlighted on the tablets)
# words
cat | c/a/t | 🐱                 (word | one piece per sound | picture: emoji, or drive:ID#x,y,w,h = a crop of the book's words page)
# story
P | The cat has a hat. | drive:FILEID   (one line per panel, 2–6; picture = drive:<Drive file id shared "anyone with the link">, a bare id, an image URL, or empty)
RC | question | correct | wrong | wrong   (exactly 3, asked after the panels)
# sort
cat | a                          (word | sound bucket; at least 2 buckets — the tablet shows one word at a time and the buckets as big buttons)
# pairs
cat | cot                        (minimal pairs; A says the left word, B the right one)
# build
G | The cat is on the map. | 🐱   (sentence unscramble with the unit words + sight words; the optional 3rd field is a picture hint — emoji or drive ref — otherwise the matching story panel or the unit words' emojis are shown)
```
OPW1 is the alphabet level (`u.alpha`): Words becomes picture → tap the first letter (`lt-letter`), Sound Sort plays the word (🔊) and hides it, Say & Build shows 4 picture cards (`u.say`) instead of minimal pairs.
Lines starting with `//` are ignored. One question per line, `|` only as separator, no Chinese. `python3 tools/check_bank.py` enforces all of the above (including the 8-question reading rule and that chunks/syllables spell the word).
Content for the four Learning Time sections comes from the scanned Oxford Discover Student Book pages in the teacher's Google Drive (folders OD1–OD5, files `p.N`; each unit = 8 pages: Words, Before You Read, Reading ×2, Understand, Grammar, Words+Listening, Speaking/Word Study/Write). All five levels (90 units) now carry the four sections; the per-level drafting notes live in the scratchpad briefs (page map → one agent per 3 units → check_unit.py → merge). OD5 units 7–12 start two pages later (p.70, 78, 90, 98, 110, 118) and 13–18 four pages later (p.132 …) because of the Testing Practice spreads.

## Game architecture (index.html)
- Mode is decided by the URL: no `?join=` → teacher/host; `?join=CODE` → student.
- Host state object `S` (players, phase `gather|battle|end`, battle round data, qText/bText question text, bankSel). `changed()` = render + save + broadcast.
- Student state `ST`; students receive `{t:'state', s, me, my}` snapshots and send `{t:'join'|'buy'|'answer'|'build'|'choose'|'buzz'|'vote'|'act'|'power'}`.
- Phonics units (`u.phon`, any `OPW*` level): the same four buttons become 🔤 Words (sound-by-sound) · 📖 Story (panels `S.lt.i` from −P…−1, then 3 RC questions 0…2) · 🧩 Sound Sort (`{t:'lt',k:'sort'}`) · 💬 Say & Build (pairs + unscramble, `{t:'lt',k:'build'}`); labels come from `ltCats(u)`; `imgURL()` turns `drive:ID` into a Drive thumbnail URL.
- Learning Time activities (`S.lt`, host `ltStart/ltStop/ltNext/ltMsg/ltGrade/renderLTPanel/ltBoardHTML/ltOverlayHTML`, tablet `sLtDock/sLtClick`, student messages `{t:'lt',k:'word'|'gram'|'choice'|'type'|'hand'|'write'}`): the per-unit content is built by `ltFromUnit()` when a textbook unit is applied (`S.ltUnits`, `S.ltU`), and the panel appears in the console during `gather`. Auto-judged items pay +1 🪙 (+2 for a first-try grammar sentence); teacher-graded ones ✓ +2 / ⭐ +3.
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

## 課堂導航
- 開工前先用 WebFetch 讀最新規格:https://reading-cert.vercel.app/cr-kit/spec.md
- 做完用試車場測到 8 項全綠:https://reading-cert.vercel.app/cr-kit/testbench.html
