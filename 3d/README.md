# Habitat Battle — 3D 模組（Three.js）

這個資料夾是 3D 舞台的獨立原型與原始碼，**尚未**接進正式遊戲 `index.html`。
目標：把老師端／電子白板上的 2D canvas 舞台（`paintScene/paintDynamic`）換成可選的 3D 舞台；學生平板端維持 2D。

## 檔案
| 檔案 | 內容 |
|---|---|
| `core.js` | renderer、燈光、材質（`M` 霧面 / `GLOSS` 亮面 / `GLOW` 自發光）、幾何捷徑（`SPH CYL BOX CONE lathe capsule`）、天空漸層 `setSky`、canvas sprite（`labelSprite` 名牌、`bubbleSprite` 對話泡泡名牌、`hpSprite` 血條、`textSprite`）、動畫佇列 `animate`、粒子 `spawn`、衝擊環 `ring`、全螢幕 `banner` |
| `chars.js` | 16 個程序化 chibi 角色 `CHAR_BUILDERS`（lion panda monkey elephant / trex bronto egg dragon / astro rocket alien robot / detective chef wizard firefighter）、`CHAR_CLASS`（角色→職業組）、`buildChar(id)` |
| `habitats.js` | `HAB[animal|dino|space|hero][0..2]` 三級棲息地建築；`BOSS[jungle|dino|space|town]` 四隻 Boss |
| `scenes.js` | `ENV[jungle|dino|space|town]()` 四個場景，各回傳 `{pads, tick}`；共用零件 `island cloudsAt coinsAt flowers tufts lollipop palmTree sea pads clearWorld` |
| `game.js` | 示範邏輯：`TEAMS HPMAX ROSTER`、`makePlayer(p,pad)`、`loadScene(key)`、動作 `setHp knockOut revive jump attack levelUp summonBoss bossAttack resetAll`、鏡頭拖曳／縮放、主迴圈 `loop` |
| `build.py` | 把 head + 五個 js 串成單檔 `habitat-3d.html` |
| `stubtest.js` | 無瀏覽器的冒煙測試（Proxy 假 THREE），`node stubtest.js` 應印出 `smoke ok` |
| `habitat-3d.html` | 組好的獨立展示頁（可直接雙擊開） |

## 已定案的視覺方向（老師確認）
- 風格：精緻玩具／卡通風（原創設計，不用任何既有 IP）。柔影 PCFSoft、ACES 色調、sRGB、飽和明亮配色。
- **角色一定要是 3D 建模**，不用 emoji；比例 chibi（大頭小身），scale 約 1.05，站在隊伍棲息地前方 (-2.3, .5, 2)。
- **每個角色頭上要有對話泡泡名牌**（`bubbleSprite`，隊伍色邊＋白底＋深色字，輕微上下浮動），血條在泡泡上方。
- 四個場景都要「一眼就知道是哪裡」，靠大型地標撐場：
  - Jungle：巨樹＋藤蔓、瀑布河流、熱帶花叢
  - Dino：巨大火山（冒煙、岩漿裂紋）、恐龍骨架、蛋巢、蕨類
  - Space：巨大環狀星球、霓虹光環／光線、發光水晶、星空
  - Town：高矮彩色大樓群、鐘樓、斑馬線、路燈
- 使用場合：教室**電子白板**（非投影），觸控拖曳看鏡頭、雙指縮放。

## 整合進 index.html 的建議做法
1. **保持單檔**：把五個 js 串接後放進 `index.html` 的一個新 `<script>`，前面加 `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">`（CLAUDE.md 外部腳本白名單要補上 Three.js）。
2. **開關**：老師端設定加 `🎮 3D Stage` toggle（存在 `S.ui3d` 或 localStorage）。關閉時走原本 2D canvas；開啟時 2D canvas 隱藏、`#stage` 顯示。Three.js 載入失敗時自動退回 2D（原型已有 `typeof THREE==='undefined'` 檢查）。
3. **資料對接（取代 `game.js` 的示範 `ROSTER`）**：
   - 玩家 ⇄ `S.players`：`makePlayer({name, id: characterId, team, lv, dx, dz}, pad)`；`id` 對應 `CHAR_BUILDERS` 的 16 個 key，請把正式遊戲的角色 id 對應表寫成一個 `CHAR_MAP`。
   - 場景 ⇄ `S.scene`（或各隊所選場景）：`loadScene('jungle'|'dino'|'space'|'town')`。
   - 棲息地等級 ⇄ 玩家／隊伍的升級狀態：`levelUp(g)` 會重建 `HAB[class][lv]`。
4. **事件對接**：在 host 既有函式裡呼叫 3D 動作（只在 3D 開啟時）：
   - `markCorrect` 正確 → `jump(g)` + `spawn()`；三級評分可用粒子數量區分。
   - `resolveRound` 攻擊 → `attack(fromGroup,toGroup,dmg)`；血量 → `setHp(g,v)`；歸零 → `knockOut(g)`，復活 → `revive(g)`。
   - `summonBoss / bossAttack / bossDefeated` → 同名函式。
   - `castSpell`、投票揭曉 → `ring()` + `banner()`。
5. **效能**：白板一般是 Chromium 核心，r128 + 8 名玩家 + 一個場景測過結構無誤；若卡頓先把 `renderer.setPixelRatio` 上限從 2 降到 1.5、關掉 `fill` 燈。
6. **測試**：`node --check`、`node 3d/stubtest.js`、本機 `python3 -m http.server` 開啟後四個場景各切一次、按一次 Attack / Level up / Boss。

## 尚未做的事
- 還沒拿到實機截圖校色，鏡頭角度與地標比例可能要再調。
- 角色 id 與正式遊戲角色清單的對應表。
- 學生端平板不做 3D（老師決定）。
