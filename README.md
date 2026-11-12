# Yvonne English Arena

（遊戲原名 Habitat Battle；repo 與網址維持 `habitat-battle`。）

Classroom English game for Yvonne's English (Oxford Discover 1–5, Oxford Phonics World 1–4, Junior High Grammar 1–3).

**Play:** https://yvonneyen86-wq.github.io/habitat-battle/ — open on the teacher's computer; students scan the QR code to join on tablets. No accounts needed.

- `index.html` — the game (teacher console, projector stage, student tablet view)
- `bank/OD1.txt … OD5.txt` (Oxford Discover), `bank/OPW1.txt … OPW4.txt` (Oxford Phonics World), `bank/JH1.txt … JH3.txt` (Junior High Grammar) — question bank by level and unit (edit these on GitHub to change questions; the site reloads them automatically)
- `tools/e2e/` — automated tests; `node tools/e2e/all.js` runs everything before a change goes live
- `docs/使用說明.md` — teacher's manual (Chinese)
- `CLAUDE.md` — notes for Claude when working on this repo
