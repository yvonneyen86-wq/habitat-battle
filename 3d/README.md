# Habitat Battle — 3D 模組（Three.js）

這個資料夾是 3D 舞台的獨立原型與原始碼，**尚未**接進正式遊戲 `index.html`。
目標：把老師端／電子白板上的 2D canvas 舞台（`paintScene/paintDynamic`）換成可選的 3D 舞台；學生平板端維持 2D。

## 檔案
| 檔案 | 內容 |
|---|---|
| `core.js` | renderer、燈光、材質（`M` 霧面 / `GLOSS` 亮面 / `GLOW` 自發光）、幾何捷徑（`SPH CYL BOX CONE lathe capsule`）、天空漸層 `setSky`、canvas sprite（`labelSprite` 名牌、`bubbleSprite` 對話泡泡名牌、`hpSprite` 血條、`textSprite`）、動畫佇列 `animate`、粒子 `spawn`、衝擊環 `ring`、全螢幕 `banner` |
| `chars.js` | 16 個低多邊形角色 `CHAR_BUILDERS`（monkey elephant tiger toucan / trex bronto triceratops stego / astro rocket alien robot / kid teen adult grandma），`CHAR_SETS` 決定每個世界顯示哪四種、`CHAR_CLASS`（角色→職業組）、`buildChar(id)` |
| `habitats.js` | `HAB[animal|dino|space|hero][0..2]` 三級棲息地建築；`BOSS[jungle|dino|space|town]` 四隻 Boss |
| `scenes.js` | `ENV[jungle|dino|space|town]()` 四個場景，各回傳 `{sites, bossAt, tick}`；`sites` 是 4 個可選的隊伍基地（名稱、位置、`yAt`、`claim(team)`）；地平線層 `ground hills forest bushes rocks mountains cityBlocks carFleet birds`；基地零件 `patch signpost mkSite` |
| `game.js` | 示範邏輯：`TEAM_DEFS`（最多 4 隊）、`teamCount / teamSite`、`ROSTER`、`makePlayer(p,site,k,n)`、`loadScene(key)`、`buildTeams()`、`setTeamCount(n)`、`chooseSite(team,siteIdx)`、`renderHud()`、動作 `setHp knockOut revive jump attack levelUp summonBoss bossAttack resetAll`、鏡頭拖曳／縮放、主迴圈 `loop` |
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

## 四個世界（2026-10 改版）
- 風格仿低多邊形桌遊微縮模型：六角島嶼浮在水面、切面幾何、柔和土色調、圓頭小人與原生生物。角色依世界決定：Jungle 是叢林動物（monkey / elephant / tiger / toucan）、Dino 是恐龍（trex / bronto / triceratops / stego）、Space 是太空人／外星人／機器人、Hsinchu 是一般市民（kid / teen / adult / grandma，沒有職業制服）。
- **Jungle**：六角島叢林（營火廣場、瀑布山、遺跡、河岸、大樹、花田、蝴蝶與鳥群）。
- **Dino**：火山是主角（頂點位移岩體、岩漿流、冒煙、噴泉、焦油坑、化石、翼龍）。
- **Solar System**：先看整個太陽系（太陽、八大行星軌道、小行星帶、彗星），選了星球鏡頭飛過去；每顆行星就是一個基地，隊伍站在球面上。
- **Hsinchu**：新竹市＋新竹縣 15 個區做成六角地圖（海在西邊，東邊是山），先全景再縮到選定的區；每區有地標（城隍廟、科學園區大樓、竹北高鐵、關西茶園、北埔老街、峨眉大佛、新埔柿餅、寶山水庫、海邊風車）。
- 鏡頭：`overview()` 全景、`focusSite(site)` 飛到基地；HUD 的 🌍 Overview 與點隊伍卡片可切換。
- HUD：世界切換與隊伍基地收在右上「🗺️ Worlds & Bases」抽屜；攻擊、升級、Boss 時呼叫 `cinema(ms)` 自動隱藏 HUD 並加上電影黑邊，動作結束後恢復。`peek(pos,r,ms)` 讓鏡頭短暫飛近再回原位（升級時使用）。

## 隊伍基地（Team bases）
- 每個場景提供 4 個具名基地：Jungle = Riverside / Big Tree / Waterfall Pool / Flower Meadow；Dino = Lava Cave / Lake Nest / Fern Forest / Bone Yard；Space = Ice / Red / Green / Gold Planet；Town = Fire Station / Library / Bakery / Toy Shop。
- 隊伍數不限（示範 2–4 隊）。每隊 `chooseSite(team, siteIdx)` 選一個基地；同一基地只能一隊，選到別隊的會對調。
- 隊伍選定後：基地插上隊旗、浮出「Red Base」名牌，Town 的建築外牆會漆成隊色（`site.claim(team)`）；該隊玩家與各自的棲息地排在基地周圍（`site.slotR`），Space 的玩家站在星球曲面上（`site.yAt`）。
- 老師端 HUD 的「Teams」面板可切 2/3/4 隊並點選基地，供整合前試玩。

## 整合進 index.html 的建議做法
1. **保持單檔**：把五個 js 串接後放進 `index.html` 的一個新 `<script>`，前面加 `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">`（CLAUDE.md 外部腳本白名單要補上 Three.js）。
2. **開關**：老師端設定加 `🎮 3D Stage` toggle（存在 `S.ui3d` 或 localStorage）。關閉時走原本 2D canvas；開啟時 2D canvas 隱藏、`#stage` 顯示。Three.js 載入失敗時自動退回 2D（原型已有 `typeof THREE==='undefined'` 檢查）。
3. **資料對接（取代 `game.js` 的示範 `ROSTER`）**：
   - 玩家 ⇄ `S.players`：`ROSTER` 改讀 `S.players`，`teamCount = S.teamCount`，每隊的基地索引存進 `S.teams[i].site`（老師在 Setup 或投影畫面選），然後呼叫 `buildTeams()`；`id` 對應 `CHAR_BUILDERS` 的 16 個 key，請把正式遊戲的角色 id 對應表寫成一個 `CHAR_MAP`。
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
