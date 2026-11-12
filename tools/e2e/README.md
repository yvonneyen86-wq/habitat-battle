# End-to-end tests

Plays the game with a real browser (Playwright + Chromium): one teacher page and several student
pages, connected through a mock PeerJS (`mockpeer.js`), so no network is needed.

```
node tools/e2e/tests.js                  # regression checks, PASS/FAIL per line
node tools/e2e/lesson.js OD1 1,2         # a whole lesson played by bots (level, units)
node tools/e2e/lesson.js OPW1 8 .8 8     # phonics / alphabet level
node tools/e2e/lesson.js JH1 1,2 .8 10   # Junior High exam units (Practice Rush + Battle)
node tools/e2e/runner.js                 # classroom-runner testbench, checklist items 2-8
```

`lesson.js` prints a line starting with `!!` for every page error, broken invariant (negative
coins, hearts above the maximum, …) or `undefined` / `NaN` / non-English text on any screen.
`runner.js` downloads the runner's testbench page (or reads a saved copy from `TESTBENCH=path`).
Set `SHOTS=some/dir` to save screenshots. Run both before pushing a change to `index.html`.
When a bug is fixed, add a check for it to `tests.js`.
