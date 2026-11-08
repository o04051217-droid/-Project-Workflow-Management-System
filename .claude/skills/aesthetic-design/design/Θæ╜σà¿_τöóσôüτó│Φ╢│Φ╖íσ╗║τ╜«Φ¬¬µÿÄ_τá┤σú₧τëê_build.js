// 鑽全實業｜產品碳足跡建置說明（ISO 14067 × PCR 26-007）
// Claude Code 版：IMG／DZ／OUT 路徑請依本機素材位置修改
// 封面／章節／結尾＝single-subject-layout；內文＝智本品牌規則；字型全份統一
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(require("path").join(require("os").homedir(), ".claude/skills/pptx/scripts/apply_theme.js"));
const IMG = "/home/claude/master/bs/";
const OUT = process.env.OUT || "/home/claude/master/鑽全_產品碳足跡建置說明_破壞版.pptx";
const DZ = "/home/claude/master/dz/";

const PREVIEW = process.env.PREVIEW === "1";
const DISPLAY = PREVIEW ? "Noto Serif CJK TC Black" : "Noto Serif TC Black";
const SUBF = PREVIEW ? "Noto Serif CJK TC SemiBold" : "Noto Serif TC SemiBold";
const SANS = PREVIEW ? "Noto Sans CJK TC" : "Noto Sans TC";
const EN = "Georgia";

// 5 色：墨、白、BEX 紅、暖灰、淡灰卡片
const THEME = {
  name: "智本 鑽全",
  headFontFace: "Noto Serif TC Black",
  bodyFontFace: "Noto Sans TC",
  colors: {
    dk1: "1F2421", lt1: "FFFFFF", dk2: "B5282E", lt2: "F5F1F1",
    accent1: "B5282E", accent2: "6B6766", accent3: "D8D2D2", accent4: "1F2421", accent5: "B5282E", accent6: "6B6766",
    hlink: "B5282E", folHlink: "6B6766",
  },
};
const LINE = "D8D2D2", GREY = "6B6766";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "鑽全實業 產品碳足跡建置說明";
pres.author = "智本管理顧問有限公司";
pres.company = "智本管理顧問有限公司";
pres.theme = { headFontFace: DISPLAY, bodyFontFace: SANS };
const C = pres.SchemeColor;
const W = 13.333, H = 7.5;

const ph = (name, type, x, y, w, h, o = {}) => ({ placeholder: { options: { name, type, x, y, w, h, margin: 0, color: C.text1, ...o }, text: o.prompt || "" } });
const hline = (x, y, w, color = C.text1) => ({ line: { x, y, w, h: 0, line: { color, width: 0.75 } } });
const slideNum = { x: 12.13, y: 6.98, w: 0.6, h: 0.3, fontFace: SANS, fontSize: 12, color: C.accent2, align: "right" };
const brandFooter = { text: { text: "智本管理顧問有限公司", options: { x: 0.6, y: 6.98, w: 5, h: 0.3, fontFace: SANS, fontSize: 12, color: C.accent2, charSpacing: 4, margin: 0, isTextBox: true } } };

// ===== 構圖版面 =====
pres.defineSlideMaster({ title: "封面 06 疊壓", background: { color: C.text1 }, objects: [
  { rect: { x: 0.9, y: 0.9, w: 6.6, h: 5.5, fill: { color: C.text1, transparency: 40 }, line: { color: C.background1, width: 1 } } },
  ph("en", "body", 1.4, 1.35, 5.8, 0.6, { fontFace: EN, fontSize: 11, color: C.background1, charSpacing: 3, lineSpacingMultiple: 1.3, prompt: "ENGLISH SUBTITLE" }),
  ph("title", "title", 1.4, 2.0, 5.8, 1.95, { fontFace: DISPLAY, fontSize: 54, charSpacing: 4, color: C.background1, valign: "middle", lineSpacingMultiple: 1.1, prompt: "主標題" }),
  ph("sub", "body", 1.4, 4.1, 5.8, 0.5, { fontFace: SUBF, fontSize: 20, charSpacing: 2, color: C.background1, prompt: "客戶名稱" }),
  hline(1.4, 4.85, 1.6, C.background1),
  ph("meta", "body", 1.4, 5.05, 5.8, 0.8, { fontFace: SANS, fontSize: 14, color: C.background1, lineSpacingMultiple: 1.4, prompt: "日期\n主講單位" }),
]});
pres.defineSlideMaster({ title: "章節 02 上下", background: { color: C.background1 }, objects: [
  ph("no", "body", 2.67, 0.55, 8, 0.35, { fontFace: EN, fontSize: 12, color: C.accent1, align: "center", charSpacing: 6, prompt: "CHAPTER 01" }),
  ph("title", "title", 1.67, 0.95, 10, 1.1, { fontFace: DISPLAY, fontSize: 54, align: "center", valign: "middle", charSpacing: 4, prompt: "章節標題" }),
  ph("sub", "body", 2.67, 2.12, 8, 0.45, { fontFace: SUBF, fontSize: 16, color: C.accent2, align: "center", charSpacing: 3, prompt: "本章重點一句話" }),
  ph("pic", "pic", 3.92, 2.85, 5.5, 4.65, { prompt: "主體照片（放大，超出下緣）" }),
], slideNumber: slideNum });
pres.defineSlideMaster({ title: "章節 05 裁切居中", background: { color: C.background1 }, objects: [
  ph("pic", "pic", 6.67, 0, 6.667, 7.5, { prompt: "主體照片（切一半貼邊）" }),
  ph("title", "title", 4.75, 0.8, 1.3, 5.9, { fontFace: DISPLAY, fontSize: 54, vert: "eaVert", prompt: "章／節／標／題" }),
  ph("no", "body", 4.2, 0.85, 0.45, 5.8, { fontFace: EN, fontSize: 12, color: C.accent1, vert: "eaVert", charSpacing: 6, prompt: "CHAPTER 02" }),
  ph("sub", "body", 3.55, 0.85, 0.5, 5.8, { fontFace: SUBF, fontSize: 16, color: C.accent2, vert: "eaVert", prompt: "本章重點一句話" }),
], slideNumber: slideNum });
pres.defineSlideMaster({ title: "結尾 08 紋理", background: { color: C.text1 }, objects: [
  { rect: { x: 0, y: 0, w: 5.6, h: H, fill: { color: C.text1, transparency: 25 }, line: { type: "none" } } },
  ph("title", "title", 0.8, 0.8, 4.6, 1.15, { fontFace: DISPLAY, fontSize: 54, color: C.background1, charSpacing: 6, prompt: "謝謝聆聽" }),
  ph("sub", "body", 0.8, 2.05, 4.6, 0.5, { fontFace: SUBF, fontSize: 18, charSpacing: 2, color: C.background1, prompt: "一句話結語" }),
  hline(0.8, 2.75, 1.2, C.background1),
  ph("contact", "body", 0.8, 4.3, 4.6, 2.5, { fontFace: SANS, fontSize: 14, color: C.background1, lineSpacingMultiple: 1.45, valign: "bottom", prompt: "姓名　職稱\n公司\n電話｜Email\n地址" }),
]});
pres.defineSlideMaster({ title: "內文 標題頁", background: { color: C.background1 }, objects: [
  ph("title", "title", 0.6, 0.45, 12.13, 0.8, { fontFace: DISPLAY, fontSize: 32, align: "left", valign: "middle", prompt: "頁面標題" }),
  brandFooter,
], slideNumber: slideNum });


// ===== 破壞式版面（構圖 09：撕紙、切片、出框、碎字；底圖用投影片背景圖片）=====
const sideText = (title, white) => {
  const col = white ? C.background1 : C.text1;
  return [
    ph("no", "body", 0.9, 1.2, 5.6, 0.35, { fontFace: EN, fontSize: 12, color: white ? C.background1 : C.accent1, charSpacing: 6, prompt: "CHAPTER 01" }),
    ph("title", "title", 0.9, 1.65, 5.6, 2.2, { fontFace: DISPLAY, fontSize: 54, color: col, charSpacing: 4, align: "left", valign: "top", lineSpacingMultiple: 1.1, prompt: "章節標題" }),
    hline(0.9, 4.15, 1.4, col),
    ph("sub", "body", 0.9, 4.35, 5.6, 0.9, { fontFace: SUBF, fontSize: 18, color: col, charSpacing: 2, lineSpacingMultiple: 1.35, prompt: "本章重點" }),
  ];
};
pres.defineSlideMaster({ title: "封面 09 破壞（撕紙破口）", background: { color: C.accent1 }, objects: [
  ph("en", "body", 0.9, 1.0, 5.6, 0.6, { fontFace: EN, fontSize: 11, color: C.background1, charSpacing: 3, lineSpacingMultiple: 1.3, prompt: "ENGLISH SUBTITLE" }),
  ph("title", "title", 0.9, 1.75, 5.6, 2.1, { fontFace: DISPLAY, fontSize: 54, color: C.background1, charSpacing: 4, align: "left", valign: "top", lineSpacingMultiple: 1.1, prompt: "主標題" }),
  hline(0.9, 4.15, 1.6, C.background1),
  ph("sub", "body", 0.9, 4.35, 5.6, 0.5, { fontFace: SUBF, fontSize: 20, color: C.background1, charSpacing: 2, prompt: "客戶名稱" }),
  ph("meta", "body", 0.9, 5.0, 5.6, 0.8, { fontFace: SANS, fontSize: 14, color: C.background1, lineSpacingMultiple: 1.4, prompt: "日期\n主講單位" }),
]});
pres.defineSlideMaster({ title: "章節 09 破壞 白底", background: { color: C.background1 }, objects: sideText("", false), slideNumber: slideNum });
pres.defineSlideMaster({ title: "章節 09 破壞 紅底", background: { color: C.accent1 }, objects: sideText("", true), slideNumber: { ...slideNum, color: C.background1 } });
pres.defineSlideMaster({ title: "章節 09 破壞 紙條", background: { color: C.text1 }, objects: [
  ph("title", "title", 4.55, 0.7, 1.3, 6.0, { fontFace: DISPLAY, fontSize: 54, color: C.background1, vert: "eaVert", prompt: "章／節／標／題" }),
  ph("no", "body", 6.0, 0.75, 0.45, 5.8, { fontFace: EN, fontSize: 12, color: C.background1, vert: "eaVert", charSpacing: 6, prompt: "CHAPTER 02" }),
  ph("sub", "body", 3.95, 0.75, 0.5, 5.8, { fontFace: SUBF, fontSize: 16, color: C.background1, vert: "eaVert", prompt: "本章重點" }),
], slideNumber: { ...slideNum, color: C.background1 } });

// ===== 內文元件 =====
const card = (s, x, y, w, h, title, body) => {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.background2 }, line: { type: "none" }, objectName: "card" });
  s.addText(title, { x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 0.5, fontFace: SUBF, fontSize: 22, color: C.text1, margin: 0, isTextBox: true, valign: "top" });
  s.addText(body, { x: x + 0.3, y: y + 0.9, w: w - 0.6, h: h - 1.1, fontFace: SANS, fontSize: 16, color: C.text1, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.35, paraSpaceAfter: 4 });
};
const bullets = (arr) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1 } }));
const lead = (s, runs, y = 1.45) => s.addText(runs, { x: 0.6, y, w: 12.13, h: 0.6, fontFace: SANS, fontSize: 20, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
const note = (s, text, y) => s.addText(text, { x: 0.6, y, w: 12.13, h: 0.4, fontFace: SANS, fontSize: 14, color: C.accent2, margin: 0, isTextBox: true });
const table = (s, rows, colW, y = 1.5, rowH = 0.56, fs = 16) => {
  const hdr = rows[0].map((t) => ({ text: t, options: { bold: true, fill: { color: C.background2 } } }));
  s.addTable([hdr, ...rows.slice(1)], { x: 0.6, y, w: 12.13, colW, rowH, fontFace: SANS, fontSize: fs, color: C.text1, border: { type: "solid", pt: 0.75, color: LINE }, valign: "middle", margin: [0.05, 0.15, 0.05, 0.15], objectName: "table" });
};
const content = (sec) => pres.addSlide({ masterName: "內文 標題頁", sectionTitle: sec });
const hot = (t) => ({ text: t, options: { bold: true, color: C.accent1 } });

let s, sec;

// 1 封面
sec = "封面"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "封面 09 破壞（撕紙破口）", sectionTitle: sec });
s.background = { path: DZ + "cover.jpg" };
s.addText("PRODUCT CARBON FOOTPRINT\nISO 14067:2018 · CFP-PCR 26-007", { placeholder: "en" });
s.addText("產品碳足跡\n建置說明", { placeholder: "title" });
s.addText("鑽全實業股份有限公司", { placeholder: "sub" });
s.addText("115 年 11 月 9 日（一）\n智本管理顧問有限公司", { placeholder: "meta" });
s.addNotes("封面 09 破壞：紅紙撕出破口露出鑽全廠房，棘輪扳手從破口伸出（出框）。");

// 2 第一章
sec = "一、專案目的與依據"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "章節 09 破壞 白底", sectionTitle: sec });
s.background = { path: DZ + "sec1.jpg" };
s.addText("CHAPTER 01", { placeholder: "no" }); s.addText("專案目的\n與依據", { placeholder: "title" });
s.addText("把一組工具拆開來看，\n每一段都有它的碳", { placeholder: "sub" });
[["原料取得", 0.86], ["製造", 2.21], ["配送銷售", 3.53], ["使用", 5.06], ["廢棄處理", 6.67]].forEach(([t, y], i) => {
  s.addShape(pres.shapes.LINE, { x: 10.15, y, w: 0.5, h: 0, line: { color: GREY, width: 0.75 } });
  s.addText([{ text: `0${i + 1}　`, options: { fontFace: EN, fontSize: 12, color: C.accent1 } }, { text: t }], { x: 10.75, y: y - 0.22, w: 2.2, h: 0.44, fontFace: SUBF, fontSize: 16, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
});

// 3 專案目的
s = content(sec); s.addText("專案目的", { placeholder: "title" });
lead(s, "依 ISO 14067 與自訂 PCR，完成標的產品的碳足跡盤查與報告。");
card(s, 0.6, 2.4, 3.84, 2.3, "掌握排放熱點", "找出原料、製造、配銷、使用、廢棄五階段中，排放最集中的環節。");
card(s, 4.74, 2.4, 3.84, 2.3, "回應客戶要求", "以可查證的數據，回應品牌客戶與海外通路的碳資訊需求。");
card(s, 8.89, 2.4, 3.84, 2.3, "取得碳標籤", "依「自願性產品碳足跡核定標示及管理辦法」申請碳足跡標籤。");

// 4 依據文件
s = content(sec); s.addText("依據文件", { placeholder: "title" });
table(s, [
  ["文件", "用途", "狀態"],
  ["ISO 14067:2018", "產品碳足跡量化與報告要求", "主要依據"],
  ["CFP-PCR 26-007\n氣動及電動手提式動力工具", "功能單位、系統界限、切斷、分配、各階段數據規則", "鑽全擬定；草案（二）版\n［待確認審查進度］"],
  ["環境部推動產品碳足跡管理要點", "數據量化與查證規範（附件三）", "現行"],
  ["自願性產品碳足跡核定標示及管理辦法", "碳標籤申請與標示", "現行"],
], [4.4, 4.8, 2.93], 1.5, 0.75);
note(s, "PCR 磋商會議已於 115 年 10 月 8 日召開；正式核准後，以核准版本為準。", 5.6);

// 5 功能單位
s = content(sec); s.addText("功能單位與標示單位", { placeholder: "title" });
lead(s, [hot("一組（工具類別）＋動力形式＋重量")]);
s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.3, w: 12.13, h: 1.3, fill: { color: C.background2 }, line: { type: "none" }, objectName: "example" });
s.addText([{ text: "範例　", options: { color: C.accent2, fontSize: 16 } }, { text: "一組衝擊扳手（電動-充電式），重量 ○○ kg" }],
  { x: 0.9, y: 2.3, w: 11.5, h: 1.3, fontFace: SUBF, fontSize: 24, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
card(s, 0.6, 3.9, 5.92, 2.4, "盤查報告須載明", bullets(["產品型號", "主要性能規格（額定電壓、扭力、轉速等）", "重量涵蓋範圍"]));
card(s, 6.81, 3.9, 5.92, 2.4, "重量涵蓋範圍", bullets(["工具主機、電池、充電器", "工具箱、零件包等隨附配件", "依實際販售內容認定"]));

// 6 第二章
sec = "二、盤查範疇與邊界"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "章節 09 破壞 紙條", sectionTitle: sec });
s.background = { path: DZ + "sec2.jpg" };
s.addText("盤／查／範／疇", { placeholder: "title" }); s.addText("CHAPTER 02", { placeholder: "no" });
s.addText("從原料到廢棄，算到哪裡", { placeholder: "sub" });

// 7 系統界限
s = content(sec); s.addText("系統界限：五個生命週期階段", { placeholder: "title" });
const st = [["原料取得", "主要／次要原料\n零件包、耗材、包材\n供應商運輸"], ["製造", "前處理、表面處理\n組裝、測試、包裝\n能資源與廢棄物"], ["配送銷售", "生產廠場至\n第一階配送點"], ["使用", "5 年使用情境\n用電、壓縮空氣\n定期更換耗材"], ["廢棄處理", "運輸及\n掩埋、焚化、回收"]];
st.forEach(([t, d], i) => {
  const x = 0.6 + i * 2.48;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 2.2, h: 3.3, fill: { color: i === 1 ? C.accent1 : C.background2 }, line: { type: "none" }, objectName: `stage${i + 1}` });
  s.addText(t, { x: x + 0.15, y: 1.8, w: 1.9, h: 0.5, fontFace: SUBF, fontSize: 22, color: i === 1 ? C.background1 : C.text1, margin: 0, isTextBox: true });
  s.addText(d, { x: x + 0.15, y: 2.5, w: 1.9, h: 2.2, fontFace: SANS, fontSize: 16, color: i === 1 ? C.background1 : C.text1, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.35 });
  if (i < 4) s.addShape(pres.shapes.LINE, { x: x + 2.2, y: 3.25, w: 0.28, h: 0, line: { color: GREY, width: 1.25, endArrowType: "triangle" } });
});
note(s, "不納入：廠房建築、空調與電氣等基礎設施、生產機器設備（PCR 6.1）。", 5.25);
note(s, "製造階段（紅色）為鑽全自有廠區，全部須使用一級數據。", 5.7);

// 8 使用階段
s = content(sec); s.addText("使用階段：依動力形式選用公式", { placeholder: "title" });
table(s, [
  ["公式", "適用", "計算方式"],
  ["A", "插電式", "EA ＝ Σ(Pi × Hi) × 5 ÷ 1,000"],
  ["B", "充電式", "EB ＝ Echarge × Nyear × 5"],
  ["C", "氣動式", "EC ＝ (Q × 60 × H ÷ 1,000) × SEC × 5"],
  ["D", "具標準作業循環實測資料者", "ED ＝ ecycle × Nyear × 5"],
], [1.4, 4.2, 6.53], 1.5, 0.6);
note(s, "共同使用年限 5 年；電池、碳刷、密封元件、潤滑油等定期更換件須納入。維修行為不列入。", 4.75);

// 9 切斷與分配
s = content(sec); s.addText("切斷與分配規則", { placeholder: "title" });
card(s, 0.6, 1.5, 5.92, 3.0, "切斷規則", bullets(["單一排放源 ≦ 1% 可忽略", "忽略項目累計 ≦ 5%", "納入評估須涵蓋 ≧ 95% 排放", "未納入項目須文件化"]));
card(s, 6.81, 1.5, 5.92, 3.0, "分配規則", bullets(["首要原則：避免分配", "不可避免時，依物理性質分配（產量、重量、工時）", "採經濟價值等其他參數，須說明依據", "本專案盤查表預設以生產工時分配"]));

// 10 第三章
sec = "三、數據蒐集與分工"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "章節 09 破壞 紅底", sectionTitle: sec });
s.background = { path: DZ + "sec3.jpg" };
s.addText("CHAPTER 03", { placeholder: "no" }); s.addText("數據蒐集\n與分工", { placeholder: "title" });
s.addText("數據從各部門\n衝出來，才算得準", { placeholder: "sub" });

// 11 數據要求
s = content(sec); s.addText("數據期間與一級數據要求", { placeholder: "title" });
card(s, 0.6, 1.5, 3.84, 3.0, "數據期間", bullets(["前一年度完整 12 個月", "或跨年度累計 12 個月", "其他期間須說明原因"]));
card(s, 4.74, 1.5, 3.84, 3.0, "製造階段", bullets(["生產量、原物料、能資源、冷媒、廢棄物", "全部須為一級數據", "多廠區依生產量加權平均"]));
card(s, 8.89, 1.5, 3.84, 3.0, "原料取得階段", bullets(["製造階段排放未達上游 10% 時，須納入供應商一級數據", "主要供應商供應量累計 > 50%"]));

// 12 部門分工
s = content(sec); s.addText("各部門應準備資料", { placeholder: "title" });
table(s, [
  ["部門", "應準備資料"],
  ["研發／產品設計", "產品型錄、BOM 表、爆炸圖、使用說明書、預期壽命與保養耗材"],
  ["採購／資材", "盤查年度原物料與耗材採購量、供應商名單與地址、供應商碳排係數"],
  ["生產／生管", "全品項總生產工時、單件產品工時、耗材領用、製程邊料"],
  ["廠務／環安", "各廠區電費單、冷媒設備銘牌、廢棄物清運聯單、年均人數"],
  ["業務／船務物流", "出貨量與內外銷比例、運輸方式與港口、出貨包裝規格"],
], [2.9, 9.23], 1.5, 0.66);

// 13 盤查表
s = content(sec); s.addText("盤查表結構", { placeholder: "title" });
table(s, [
  ["工作表", "內容", "主要填寫單位"],
  ["工作分配", "蒐集項目、佐證單據、負責單位、進度", "各部門窗口"],
  ["0-1～0-3", "基本資料、分配原則、製程地圖、系統邊界、截斷項目", "生管、顧問"],
  ["1-0～1-2", "原物料活動數據、係數彙整、供應商運輸", "研發、採購"],
  ["2-0～2-2", "製造階段能資源、廢棄物、廠間運輸", "廠務、生產"],
  ["6-1、6-2", "不確定性評估、數據品質等級、敏感度分析", "顧問"],
], [2.4, 6.6, 3.13], 1.5, 0.66);
note(s, "配送、使用、廢棄階段依工作分配表蒐集，由顧問建立情境。", 5.75);

// 14 第四章
sec = "四、今日行程與下一步"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "章節 09 破壞 白底", sectionTitle: sec });
s.background = { path: DZ + "sec4.jpg" };
s.addText("CHAPTER 04", { placeholder: "no" }); s.addText("今日行程\n與下一步", { placeholder: "title" });
s.addText("先打破一張完整的碳，\n再一塊塊拼回來", { placeholder: "sub" });

// 15 今日行程
s = content(sec); s.addText("啟始會議行程", { placeholder: "title" });
table(s, [
  ["時間", "議程", "參與人員"],
  ["09:00–10:00", "全體布達會議", "高階主管、各部門主管與窗口"],
  ["10:00–10:30", "面談：研發／產品設計", "研發主管、產品工程師"],
  ["10:30–11:00", "面談：採購／資材", "採購主管、資材窗口"],
  ["11:00–11:30", "面談：業務／船務物流", "業務主管、船務物流窗口"],
  ["11:30–12:00", "面談：廠務／環安", "廠務、環安、人資窗口"],
  ["13:10–14:10", "產線巡場", "生產主管、廠務人員"],
  ["14:20–15:20", "面談：生產／生管", "生產主管、生管人員"],
], [2.2, 5.0, 4.93], 1.45, 0.58);
note(s, "當日無法提供的資料，於會後登錄工作分配表，追蹤到位。", 6.25);

// 16 結尾
sec = "結尾"; pres.addSection({ title: sec });
s = pres.addSlide({ masterName: "結尾 08 紋理", sectionTitle: sec });
s.background = { path: IMG + "close16.jpg" };
s.addText("謝謝聆聽", { placeholder: "title" });
s.addText("一起把每一組工具的碳算清楚", { placeholder: "sub" });
s.addText("張祐程　經理\n智本管理顧問有限公司\n行動 0981-841-076｜傳真 04-2461-8807\no04051217@gmail.com\n408 台中市向上南路一段163號10樓22", { placeholder: "contact" });

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("done");
})();
