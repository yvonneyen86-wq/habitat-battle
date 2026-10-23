# Learning Time 四大類 — 設計提案（中文確認稿）

> 老師確認方向後再動工。全部內容依雲端 OD1–OD5 課本頁（Google Drive 的 OD 資料夾，每單元 8 頁）製作；範例用 OD2 Unit 1「Amazing Animals」。

## 1. 課本頁 → 四大類的對應（每單元 8 頁，每級 18 單元）

| 類別 | 課本頁 | 平板上做什麼 | 誰判 |
|---|---|---|---|
| 🔤 **Words 單字拼讀** | Get Ready Words（p.8）+ Communicate Words（p.14）+ Word Study | 先看音節框框（幾個音節幾個框），再把打散的 **word family 字塊**（s / ea / s / o / n）點進框框 | 程式自動判，對一個 +1 🪙 |
| 📖 **Reading 文章** | Reading 兩頁（p.10–11）+ Understand（p.12） | 白板放大顯示全文，老師帶讀；平板也看得到全文（可捲動）。讀完回答 **8 題**，答案都在文章裡：🎤 口說 ×2、⚖️ 選擇 ×3、⌨️ 打完整句 ×3 | 選擇題自動判；口說、打句老師按 ✓/⭐ |
| 🧩 **Grammar 文法** | Grammar（p.13） | 用本單元文法句做 **重組句子**（現有拼句子機制），6–8 句 | 程式自動判，+1 🪙；第一次就對 +2 |
| 💬 **Speak & Write** | Speaking（p.15）+ Write（p.15 / WB） | ① 小組內兩兩配對，平板各顯示自己的 A／B 台詞，唸完 🔁 交換角色、🎲 換關鍵字；② **仿寫**：平板顯示範例句（空格處標色），學生照句型打自己的句子送出 | 對話：老師用 🎤 聚光抽組；仿寫：老師 ✓/⭐（沿用現在的句子判分） |

## 2. 老師端操作（Learning Time 面板）
- 上方多四個分頁：**🔤 Words ｜ 📖 Reading ｜ 🧩 Grammar ｜ 💬 Speak & Write**，點一個 → **▶ Start** 全班平板一起進入該活動；**⏹ Stop** 回到自由狀態。
- 投影區顯示該活動的**進度板**：每位學生做到第幾題、幾題對（Words 看拼了幾個、Reading 看答到第幾題）。
- Reading 開始時，投影區先全螢幕顯示文章（字大），老師按 **Next** 才出第 1 題。
- 題目全部從 📚 Textbook 選單元後自動載入，老師不用輸入。戰鬥（Battle）題庫不變。

## 3. 平板畫面（見附圖 mock）
- 下方「現在做什麼」圖示列沿用（👂 Read → ✍️ Answer → ⭐ Teacher）。
- Words：音節框框 + 字塊；🔊 Say it 用瀏覽器內建語音唸單字（不用外部服務）；✓ Check 後對的框框變綠。
- Reading：全文在上、題目在下，一次一題。
- Speak & Write：對話台詞自己的那一方有黃框；下面接仿寫框。

## 4. 題庫格式（bank/OD*.txt 新增四段，原本 `# learn` / `# battle` 保留）
```
## U1 | Amazing Animals | How are animals different from one another?
# words
feathers | fea·thers | f/ea/th/er/s | 🪶
wings | wings | w/i/ng/s | 🕊️
gills | gills | g/i/ll/s | 🐟
scales | scales | s/c/a/l/e/s | 🐠
mammals | mam·mals | m/a/mm/a/l/s | 🐘
amphibians | am·phib·i·ans | a/m/ph/i/b/i/a/n/s | 🐸
eggs | eggs | e/gg/s | 🥚
skin | skin | s/k/i/n | 🖐️
fur | fur | f/ur | 🐻
body | bod·y | b/o/d/y | 🧍
head | head | h/ea/d | 🙂
mouth | mouth | m/ou/th | 👄
# reading
> Amazing Animals
> All animals can breathe and move, but they're different in many amazing ways. Here, we look at how they are the same and how they are different. This helps us put them into groups.
> Birds: All birds have two legs, two wings, and feathers, and most birds can fly. The wings and feathers help them fly, and the feathers help keep them warm. Birds lay eggs with hard shells. They keep the baby birds inside safe from animals that want to eat them.
> Fish: Fish have gills to help them breathe in water. Scales all over their bodies help keep them safe from dangerous fish that want to bite them. They don't have legs, but their fins and tails help them swim. Fish lay their eggs in water, and their eggs are soft.
> Amphibians: Amphibians are very interesting because they can live on land and in water. Amphibians need to have wet skin, so they live in wet places. They lay their soft eggs in water. They have gills when they're young and the gills help them breathe in water. Most amphibians, like frogs, have legs that help them walk and jump on land.
> Mammals: Some mammals live on land and some live in water. Whales are water mammals, and cats, rabbits, and lions are land mammals. Hair or fur covers most land mammals' bodies and this helps keep them warm. People are mammals too! Mammals don't lay eggs. Their babies drink milk from their mothers.
RC | What helps fish breathe in water? | gills | fins | scales
RC | What do birds have on their bodies? | feathers | fur | scales
RC | Where do amphibians lay their eggs? | in water | on land | in a nest
RT | Where do fish lay their eggs? | Fish lay their eggs in water.
RT | What do baby mammals drink? | Baby mammals drink milk from their mothers.
RT | What covers most land mammals' bodies? | Hair or fur covers their bodies.
RS | How are birds and fish different? Tell us one thing.
RS | Why can't birds live under water?
# grammar
G | Fish have gills.
G | Gills help them breathe.
G | Do gills help fish breathe?
G | Yes, gills help them breathe.
G | Birds have wings.
G | They have wings to play in the sky.
G | Mammals have fur to keep them warm.
# speak-write
SP | A: Ouch! | B: Are you OK? | A: No. My {leg} hurts! | B: Oh, no! That's awful. | leg / head / ear / mouth / body
SW | My favorite animal group is {birds}. They have {wings and feathers}. They can {fly}. | Write three things about your favorite animal group.
```
- Words：`單字 | 音節（·分隔）| 字塊（/分隔）| 圖示`。字塊規則：母音組合（ea, ee, ai, oa, ou, ow…）、子音組合（th, sh, ch, ng, ck, qu…）、r 母音（ar, er, ir, or, ur）、雙子音（ll, ss, mm…）各算一塊，其餘一個字母一塊。
- Reading：`>` 開頭是文章；`RC` 選擇（第一個選項是正解，顯示時打亂）、`RT` 打完整句、`RS` 口說。
- Grammar：`G | 正確句`（遊戲打散）。
- Speak & Write：`SP` 對話（`{}` 是可換的關鍵字，最後一欄是可換的字）；`SW` 仿寫範例（`{}` 是學生要換的部分）+ 題目。

## 5. 要請老師決定的 5 件事
1. 四類的平板流程和附圖方向 OK 嗎？（尤其 Words 的「音節框框＋字塊」呈現）
2. 字塊切法：`feathers → f/ea/th/er/s`、`amphibians → a/m/ph/i/b/i/a/n/s`、`season → s/ea/s/o/n` 這樣切可以嗎？還是要更粗（例如 `fea/thers`）？
3. 金幣：自動判的（Words／Grammar／選擇題）對一題 +1、老師判的 +2，可以嗎？
4. 製作順序：先做 **OD2 全 18 單元**（您現在在教），再 OD3 → OD4 → OD1 → OD5。每級做完我把題庫檔給您過目。
5. Reading 的 8 題配比：口說 2 ＋ 選擇 3 ＋ 打句 3，可以嗎？

## 6. 工作量與順序
1. 遊戲功能（平板四個活動畫面、老師端分頁與進度板、題庫格式）：1 次任務。
2. OD2 內容 18 單元：1–2 次任務（每單元約 12 個單字、1 篇文章、8 題、7 句文法、1 組對話、1 個仿寫）。
3. 其餘四級各 1–2 次任務。
