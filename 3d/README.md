# Habitat Battle — 3D 模組（Three.js）

這個資料夾是 3D 舞台的原始碼。**已接進正式遊戲 `index.html`**（老師端 `🎮 3D` 開關，預設關閉）；`habitat-3d.html` 仍是可獨立開啟的展示頁。
目標：把老師端／電子白板上的 2D canvas 舞台（`paintScene/paintDynamic`）換成可選的 3D 舞台；學生平板端維持 2D。

## 檔案
| 檔案 | 內容 |
|---|---|
| `core.js` | renderer、燈光、材質（`M` 霧面 / `GLOSS` 亮面 / `GLOW` 自發光）、幾何捷徑（`SPH CYL BOX CONE lathe capsule`）、天空漸層 `setSky`、canvas sprite（`labelSprite` 名牌、`bubbleSprite` 對話泡泡名牌、`hpSprite` 血條、`textSprite`）、動畫佇列 `animate`、粒子 `spawn`、衝擊環 `ring`、全螢幕 `banner` |
| `chars.js` | 16 個低多邊形角色 `CHAR_BUILDERS`（monkey elephant tiger toucan / trex bronto triceratops stego / astro rocket alien robot / kidA kidB kidC kidD），`CHAR_SETS` 決定每個世界顯示哪四種、`CHAR_CLASS`（角色→職業組）、`buildChar(id)` |
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

## 風格：療癒島嶼風（2026-10 老師要求「像動物森友會」，原創、不用任何 IP 素材）
- 材質改成平滑 `MeshStandardMaterial`（不再 flatShading），幾何細分提高（球 ≥18×12、圓柱 ≥20、圓錐 ≥16、lathe ≥40），看起來圓潤。
- **捲動地平線**：`core.js` 的 `BEND` uniform 透過 `bendMat()/bendTree()` 在 vertex shader 把遠處往下彎（像滾筒）；強度依鏡頭距離自動調整，太陽系 `curve:0` 不彎。新加的物件要記得 `bendTree(obj)`。
- 六角地塊改為圓角擠出（`hexShape / slab`）：土色懸崖＋草地頂＋淺水環；白色木柵欄；亮青綠海面；粉嫩天空；雲移到遠方高空繞圈，不擋畫面。
- 光線偏暖（太陽 `0xfff0d0`、曝光 1.12、柔影 radius 4）。

## 角色、特寫與合照（2026-10）
- `chars.js`：人物改為大頭娃娃比例（`person()`：短腿、圓身、頭半徑 .66），衣服是 canvas 畫的布料（`fabricTex`：條紋／圓點／葉子／花／數字／星星），**臉是畫在頭前方薄片上的 canvas 貼圖**（`addFace` + `faceTex(o,expr)`），表情 `smile blink happy talk wow sad ouch ko` 可即時切換；叢林動物也用同一套臉。恐龍改為電影感寫實輪廓：`loftGeo()` 沿脊椎掃出一整條身體（Catmull-Rom 脊椎＋橢圓截面）、`dinoSkin()` 皮膚貼圖（背部條紋、斑點）、`inkify()` 反面擠出的墨線外框；暴龍有可開合的下顎 `userData.jaw`。
- **`Object3D.add()` 回傳的是父物件**，所以 `g.add(mesh(...)).rotation.x=...` 會轉到父物件（這個 bug 曾讓太空人整顆頭轉 90°）。要鏈式調整請用 `par.add(tw(mesh(...),o=>o.rotation.x=1))`（`tw` 在 `core.js`）。
- 鏡頭預設更低更近（`overview()` phi .32、`focusSite()` phi .24）。`game.js`：
  - `spotOne(g)`：指定學生回答。學生從自己的家走到廣場側（`walkTo`，不超出 `site.stageR`），轉身面對鏡頭，鏡頭貼地平視（phi .12；太陽系 .3），HUD 上方出現「🎤 Name is answering」。
  - `spotTeam(i)`：整組回答。全隊在基地前排成一列面對鏡頭（`gap` 依生物大小），顯示「👥 Red Team is answering」。
  - `react(ok)`：老師按 ✅ Correct / ❌ Wrong → 聚光中的學生（沒有聚光時是全部）做出 happy 跳躍＋彩花，或 sad 臉。
  - `spotEnd()`／「↩ Island」回到原本鏡頭；Attack / Level up / Boss / Reset 會先自動結束聚光。**點電子白板上的角色也會直接聚光**（`pick()` 用與 shader 相同的彎曲投影找最近的角色）。
  - 擋住特寫的東西會暫時隱藏：`hideOccluders()`（場景裡的樹、石頭、地標；用 Box3 快取 `env.occ`）、`blocks()`（鄰居的角色與房子）、以及聚光學生自己的房子（太陽系小行星上會擋到合照）。
  - `faceTick()` 每幀決定表情：倒地 ko、短暫反應（`setFace(ch,expr,ms)`）、否則 smile 並隨機眨眼；暴龍下顎跟著表情開合。
- `?fast` 網址參數只給截圖測試用（軟體 GL 很慢時讓每幀涵蓋更多時間）。

## 學生自選外型 `av`（2026-10）
- 正式遊戲 `index.html` 的加入畫面多了「Design your look」：膚色 4、髮型 9（Short / Side / Curly / Bob / Top knot / Pigtails / Long / Braids / Buzz）、髮色 6、衣服 8 色、圖案 5 種（Plain / Stripes / Dots / Star / Number 1–9），有即時 2D 預覽與 🎲 隨機。資料格式 `{sk,hs,hc,sh,pt,n}`，隨 `join` 送給老師端，存在 `S.players[pid].av`（也存學生平板 `localStorage` `habitat-av`，下次自動帶入）。加入後點平板左上角自己的頭像（✏️）可以隨時改，送 `{t:'look',av}` 給老師端。沒選的（舊存檔、老師手動加的）用名字雜湊 `avFromName()` 給一個固定外型。
- 3D 這邊 `buildChar(id,av)` 會把 `av` 交給人物型 builder：`kid`（新竹）、`astro / rocket / alien / robot`（太空）。`avOpts(av)` 把索引換成顏色與髮型；**`AV` 表在 `chars.js` 與 `index.html` 各一份，改顏色要兩邊一起改**。叢林動物與恐龍不受 `av` 影響。
- 太空組靠太空衣顏色（= 衣服色）、胸前圖案／號碼、頭盔裡的髮型髮色來分辨，一隊 6–8 個太空人也不會撞臉。

## 四個世界（2026-10 改版）
- 風格仿低多邊形桌遊微縮模型：六角島嶼浮在水面、切面幾何、柔和土色調、圓頭小人與原生生物。角色依世界決定：Jungle 是叢林動物（monkey / elephant / tiger / toucan）、Dino 是恐龍（trex / bronto / triceratops / stego）、Space 是太空人／外星人／機器人、Hsinchu 是四個中性打扮的學生（kidA–kidD：不同髮型、膚色、衣服；沒有裙子、沒有大人）。
- **Jungle**：六角島叢林（營火廣場、瀑布山、遺跡、河岸、大樹、花田、蝴蝶與鳥群）。
- **Dino**：火山是主角（頂點位移岩體、岩漿流、冒煙、噴泉、焦油坑、化石、翼龍）。
- **Solar System**：先看整個太陽系（太陽、八大行星軌道、小行星帶、彗星），選了星球鏡頭飛過去；每顆行星就是一個基地，隊伍站在球面上。
- **Hsinchu**：新竹市＋新竹縣 15 個區做成六角地圖（海在西邊，東邊是山），先全景再縮到選定的區；每區有地標（城隍廟、科學園區大樓、竹北高鐵、關西茶園、北埔老街、峨眉大佛、新埔柿餅、寶山水庫、海邊風車）。
- 鏡頭：`overview()` 全景、`focusSite(site)` 飛到基地；HUD 的 🌍 Overview 與點隊伍卡片可切換。
- HUD：世界切換與隊伍基地收在右上「🗺️ Worlds & Bases」抽屜；攻擊、升級、Boss 時呼叫 `cinema(ms)` 自動隱藏 HUD 並加上電影黑邊，動作結束後恢復。`peek(pos,r,ms)` 讓鏡頭短暫飛近再回原位（升級時使用）。
- 升級（`levelUp`）是「往外擴建」：院子（`userData.yard`）一圈圈擴大 → 舊家移到旁邊變成附屬建築（`userData.annex`，保留在場上）→ 搭鷹架 → 新家由下往上一塊一塊蓋起來 → 拆鷹架、彈跳、煙火、LEVEL N 星星牌。特寫時鏡頭從廣場那側拍，擋在前面的隔壁玩家與隊旗會暫時隱藏。計時用 `later(fn,ms)`（跟著畫面時鐘，慢機器也不會錯拍）。

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

## 已整合進 index.html（2026-10）
- `python3 3d/build.py` 會把五個 js 串成 `habitat-3d.html`，**同時**寫進 `index.html` 的 `/*3D-BUNDLE-BEGIN*/…/*3D-BUNDLE-END*/` 區塊（包成 `window.HB3D_INIT=function(){…return HB3D_API}`）。改了 3D 程式一定要重跑 build.py，不要手改 index.html 那一段。
- `index.html` 老師端：`apply3d()` 在開啟時動態載入 Three.js（失敗就留在 2D 並提示），建立 `H.hb3d=HB3D_INIT()`；`#stage3d` 是蓋在投影區底層的 WebGL 層，`.stage.is3d` 時隱藏 2D 棲息地與特效，保留題目卡、QR、橫幅。
- 狀態同步：每次 `render()` 都呼叫 `sync3d()` → `H.hb3d.sync(view3d())`，把 `S.players`（名字、角色、隊伍、等級、血量、倒地、外型 av）、隊伍、基地、場景、Boss 推給舞台；舞台用 `sync()` 比對後重建或播放動畫（升級＝擴建動畫、倒地＝knockOut、復活＝revive）。角色 id 對照表 `CHAR_MAP`（lion→tiger、panda→monkey、egg→stego、dragon→triceratops、四個英雄→kidA–D），實際生物仍依世界決定。
- 事件：`markCorrect`→`correct(pid,tier)`；`resolveRound` 的攻擊→`await attack(from,to,dmg)`（舞台 landHit 不改血量，由 sync 套用）；Boss→`sync` 召喚、`bossHit(pid)`、`bossDefeated()`；投票揭曉→`cheer(pid)`（自動聚光＋彩花）。
- 老師操作：學生列的 🎤 聚光、投影區左下 `🏝️ Island / 👥 隊伍合照 / 🏕️ Bases`（選基地，存進 `S.teams[i].site`）。
- `EMBED` 模式下 `banner()` 不顯示（老師端有自己的橫幅）、Boss 不自動攻擊、`resize/pick` 用 `#stage3d` 的尺寸。

## 尚未做的事
- 還沒拿到實機截圖校色，鏡頭角度與地標比例可能要再調。
- 學生端平板不做 3D（老師決定）。
