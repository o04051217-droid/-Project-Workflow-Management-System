import { Project, WorkflowNotification } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-001',
    name: '聯新織造數位轉型診斷專案',
    clientName: '聯新紡織股份有限公司',
    contactPerson: '陳美娟 經理',
    contactPhone: '02-2736-8899 #452',
    isLargeOrGov: false,
    currentPhase: 'demand',
    createdAt: '2026-05-10T08:30:00Z',
    updatedAt: '2026-05-24T02:15:00Z',
    
    demandDesc: '客戶目前依賴老舊ERP系統且各廠區物料不對接，希望導入數位診斷，評估ERP轉雲端及倉儲條碼化的可行性。現場作業員共120名。',
    techFeasibility: '接案評估：需要懂雲端SaaS架構及條碼物聯網硬體規劃之顧問，本中心數位策略組有相應資深顧問，技術部分安全可行。',
    resourceFeasibility: '量能評估：預估診斷人天為8天，預排六月份進場，人力充裕可接案。',
    phase1UploadedFiles: ['客戶需求功能列表_v1_聯新紡織.xlsx'],
    
    basicQuoteAmount: 180000,
    finalQuoteAmount: 180000,
    costAnalysisItems: [],
    quoteReviewStatus: 'draft',
    phase2UploadedFiles: [],
    
    contractSealingStatus: 'pending',
    assignedConsultantId: '',
    assignedConsultantName: '',
    consultantHours: 0,
    consultantHourlyRate: 0,
    consultantExpenses: 0,
    phase3UploadedFiles: [],
    
    milestones: [],
    paymentNodes: [],
    fieldRecords: [],
    midtermReportStatus: 'not_required',
    phase4UploadedFiles: [],
    
    closingChecks: {
      serviceDelivered: false,
      allInvoicesIssued: false,
      allPaymentsReceived: false,
      finalReportApproved: false,
    },
    finalInvoicedAmount: 0,
    phase5UploadedFiles: [],
  },
  {
    id: 'PRJ-2026-002',
    name: '台豪精密高階主管領導力精進訓練',
    clientName: '台豪精密機械股份有限公司',
    contactPerson: '李大維 副總經理',
    contactPhone: '04-2359-1111 #1105',
    isLargeOrGov: true, // Large Project
    currentPhase: 'quote',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-22T14:20:00Z',
    
    demandDesc: '針對台豪精密三大海外事業處高階主管與研發主管（共30名），提供3D虛擬團隊協作、高階變革管理等顧問輔導與三梯次共24小時培訓。',
    techFeasibility: '接案評估：本中心領導力模組有特聘教授黃顧問，曾在台積電擔任高階主管培訓講師，極具說服力與技術能力。',
    resourceFeasibility: '量能評估：預估輔導配合專案經理需支援4人天，講師3人天，已協商調撥，量能核可。',
    phase1UploadedFiles: ['台豪精密高階培訓規格書_HR.pdf'],
    
    basicQuoteAmount: 650000,
    finalQuoteAmount: 620000,
    costAnalysisItems: [
      { id: 'c1', name: '副教授級高階講師授課費 (24小時)', category: 'human', unitCost: 15000, quantity: 24 },
      { id: 'c2', name: '專案經理全程跟課與輔導安排 (8人天)', category: 'human', unitCost: 8000, quantity: 8 },
      { id: 'c3', name: '授課講義設計印製、心理評測問卷(30套)', category: 'material', unitCost: 800, quantity: 30 },
      { id: 'c4', name: '講師及PM往返中科園區高鐵車資與差旅保險', category: 'travel', unitCost: 3500, quantity: 4 },
      { id: 'c5', name: '標準管理公版評測工具系統授權費', category: 'other', unitCost: 50000, quantity: 1 }
    ],
    quoteReviewStatus: 'submitted',
    phase2UploadedFiles: ['廠商特質調查表_台豪精密.docx', '成本分析明細表_PRJ002.xlsx', '報價單_台豪精密領導培訓_v2.pdf'],
    
    contractSealingStatus: 'pending',
    assignedConsultantId: 'C-001',
    assignedConsultantName: '黃自強 顧問',
    consultantHours: 24,
    consultantHourlyRate: 8000,
    consultantExpenses: 12000,
    phase3UploadedFiles: [],
    
    milestones: [],
    paymentNodes: [],
    fieldRecords: [],
    midtermReportStatus: 'not_required',
    phase4UploadedFiles: [],
    
    closingChecks: {
      serviceDelivered: false,
      allInvoicesIssued: false,
      allPaymentsReceived: false,
      finalReportApproved: false,
    },
    finalInvoicedAmount: 0,
    phase5UploadedFiles: [],
  },
  {
    id: 'PRJ-2026-003',
    name: '大豐通訊 ESG 永續供應鏈碳盤查輔導',
    clientName: '大豐通訊部件股份有限公司',
    contactPerson: '林嘉誠 協理（永續辦公室）',
    contactPhone: '03-368-2288 #320',
    isLargeOrGov: false,
    currentPhase: 'contract',
    createdAt: '2026-04-15T10:15:00Z',
    updatedAt: '2026-05-23T11:45:00Z',
    
    demandDesc: '歐盟客戶要求大豐通訊提供範疇一、範疇二組織溫室氣體碳盤查數據（ISO 14064-1）。大豐需要外部顧問進場輔導其完成碳盤查，並陪同第三方認證機構稽核。',
    techFeasibility: '接案評估：需要顧問具備 ISO 14064 主導稽核員證照，極其注重數據分析。本會張敏德顧問持有此證，且有3場輔導經驗。',
    resourceFeasibility: '量能評估：預計輔導歷時4個月度，共需20診斷人天。已承諾每月分配4-5診斷天，量能核可。',
    phase1UploadedFiles: ['歐盟客戶採購規範與碳盤查宣告信.pdf'],
    
    basicQuoteAmount: 480000,
    finalQuoteAmount: 450000,
    costAnalysisItems: [
      { id: 'ca1', name: 'ISO 14064-1輔導主要顧問 (15人天)', category: 'human', unitCost: 18000, quantity: 15 },
      { id: 'ca2', name: '專案助理盤查核算與文件建檔 (10人天)', category: 'human', unitCost: 6000, quantity: 10 },
      { id: 'ca3', name: '活動碳排放數據收集與Excel計算模組設定', category: 'material', unitCost: 20000, quantity: 1 },
      { id: 'ca4', name: '往返桃園大溪廠區差旅費', category: 'travel', unitCost: 10000, quantity: 1 }
    ],
    quoteReviewStatus: 'approved',
    phase2UploadedFiles: ['廠商特質調查表_大豐通訊.docx', '成本分析表_大豐.xlsx', '報價單_大豐ESG.pdf'],
    
    contractSealingStatus: 'submitted', // Contract submitted for sealing
    assignedConsultantId: 'C-002',
    assignedConsultantName: '張敏德 顧問',
    consultantHours: 120, // 15人天 * 8小時 = 120 hr
    consultantHourlyRate: 2000, // 240,000 NTD total
    consultantExpenses: 15000,
    phase3UploadedFiles: ['雙方合約用印版_大豐通訊_draft.pdf', '本專案外聘顧問委託合約.pdf'],
    
    milestones: [],
    paymentNodes: [],
    fieldRecords: [],
    midtermReportStatus: 'not_required',
    phase4UploadedFiles: [],
    
    closingChecks: {
      serviceDelivered: false,
      allInvoicesIssued: false,
      allPaymentsReceived: false,
      finalReportApproved: false,
    },
    finalInvoicedAmount: 0,
    phase5UploadedFiles: [],
  },
  {
    id: 'PRJ-2026-004',
    name: '正道機械 AGV 智慧升級與補助案輔導',
    clientName: '正道機械股份有限公司',
    contactPerson: '高正道 董事長',
    contactPhone: '05-582-7766',
    isLargeOrGov: true, // Gov project
    currentPhase: 'execute',
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-05-24T08:30:00Z',
    
    demandDesc: '指導客戶申請經濟部SBIR或智慧製造補助案。包括全廠區AGV無人搬運車路線模擬、WMS硬體派車系統升級規劃，以及整份政府計畫書之撰寫與期中、期末報告編制。',
    techFeasibility: '接案評估：極度考驗智慧物流派車API及政府計畫爭取經驗。本會顧問對SBIR有多年勝率，技術及文案能力可行。',
    resourceFeasibility: '量能評估：專案重，配置2名顧問合力編撰計畫。時間共9個月。量能充沛，接案！',
    phase1UploadedFiles: ['正道智慧自動化改造願景圖.pdf'],
    
    basicQuoteAmount: 1200000,
    finalQuoteAmount: 1100000,
    costAnalysisItems: [
      { id: 'cb1', name: 'SBIR專書撰寫主要顧問工時', category: 'human', unitCost: 20000, quantity: 20 },
      { id: 'cb2', name: '智慧物流AGV場域仿真分析工程師', category: 'human', unitCost: 15000, quantity: 15 },
      { id: 'cb3', name: 'WMS對接模擬軟體專業授權費', category: 'material', unitCost: 250000, quantity: 1 },
      { id: 'cb4', name: '差旅交通', category: 'travel', unitCost: 25000, quantity: 1 }
    ],
    quoteReviewStatus: 'approved',
    phase2UploadedFiles: ['廠商特質調查表_正道.docx', '成本分析表_正道.xlsx', '報價單_正道AGV.pdf', 'sbir_補助案技術計畫書_v4.pdf'],
    
    contractSealingStatus: 'sealed', // Signed!
    assignedConsultantId: 'C-003',
    assignedConsultantName: '林信良 教授級顧問',
    consultantHours: 160,
    consultantHourlyRate: 3000,
    consultantExpenses: 30000,
    phase3UploadedFiles: ['簽署合約公用印信版_正道.pdf', '經濟部SBIR核定公文.pdf', '外委專家技術顧問契約.pdf'],
    
    milestones: [
      { id: 'm1', title: '完成 WMS 系統與 AGV 接口調試', dueDate: '2026-05-15', status: 'completed' },
      { id: 'm2', title: '經濟部SBIR計畫期中報告提交', dueDate: '2026-06-30', status: 'pending' },
      { id: 'm3', title: '完成全廠區 5 輛 AGV 聯網實時跑線測試', dueDate: '2026-09-15', status: 'pending' }
    ],
    paymentNodes: [
      { id: 'p1', title: '第一期：簽約預付款 (30%)', amount: 330000, invoiceNumber: 'INV20260401', billingDate: '2026-04-05', status: 'paid' },
      { id: 'p2', title: '第二期：期中報告審查通過 (40%)', amount: 440000, billingDate: '2026-06-15', status: 'reminding' }, // Triggers dynamic alert because 2026-05-24 is within 30 days or is close!
      { id: 'p3', title: '第三期：結案尾款核銷 (30%)', amount: 330000, billingDate: '2026-09-30', status: 'draft' }
    ],
    fieldRecords: [
      {
        id: 'fr1',
        date: '2026-04-18',
        topic: '首場進場輔導：WMS 資料庫與現有 ERP 對接調研',
        mentor: '林信良 教授級顧問',
        content: '調查了正道機械現存之MSSQL資料庫。經測現有ERP並未開放 API 供讀取。建議由專案經理向大騰ERP廠商接洽，協議開放外部伺服器發送 Views 查詢，以利 WMS 呼叫對接。下周五進行第二次實地對接測試。',
        signInPhoto: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200',
        sessionPhoto: 'https://images.unsplash.com/photo-1531535934027-667f6db87540?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'fr2',
        date: '2026-05-12',
        topic: '第二場現場指導：AGV 行經路線障礙點排除暨車聯網訊號測試',
        mentor: '林信良 教授級顧問',
        content: '在現場2號產線末端與4號零件倉交接處，實測WiFi訊號衰減達-85dBm，此時AGV將有停滯斷線風險。已向副總建議加裝中繼路由器（預算約3,000元），將訊號強度穩定在-65dBm以上。廠區人員承諾後天建置完畢。',
        signInPhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200',
        sessionPhoto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=200'
      }
    ],
    midtermReportStatus: 'pending',
    phase4UploadedFiles: ['林信良現場輔導簽到表_0418.pdf', '現場照片2張_林信良.zip'],
    
    closingChecks: {
      serviceDelivered: false,
      allInvoicesIssued: false,
      allPaymentsReceived: false,
      finalReportApproved: false,
    },
    finalInvoicedAmount: 0,
    phase5UploadedFiles: [],
  },
  {
    id: 'PRJ-2026-005',
    name: '永勝食品 HACCP 食品安全輔導與續證',
    clientName: '永勝食品工業廠',
    contactPerson: '張永勝 廠長',
    contactPhone: '08-773-1234',
    isLargeOrGov: false,
    currentPhase: 'close',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-05-24T09:00:00Z',
    
    demandDesc: '協助屏東永勝食品廠進行年度之HACCP重新複評輔導，針對其急凍肉包產線，重新進行危害分析重要管制點之建立及資料庫維護，並輔助通過評鑑認證。',
    techFeasibility: '接案評估：需要有ISO 22000或HACCP三年以上現場稽查經驗顧問。指派林惠琳顧問，具備資深食品檢驗專長，技術核可。',
    resourceFeasibility: '量能評估：診斷總天數為10診斷人天，分散於四個月度。林顧問時間配合得宜。',
    phase1UploadedFiles: ['永勝食品建廠平面圖及危害管制聲明.pdf'],
    
    basicQuoteAmount: 250000,
    finalQuoteAmount: 240000,
    costAnalysisItems: [
      { id: 'cc1', name: 'HACCP資深輔導顧問 (8診斷天)', category: 'human', unitCost: 18000, quantity: 8 },
      { id: 'cc2', name: '病媒防治、高階清潔演練培訓 (1梯次)', category: 'material', unitCost: 15000, quantity: 1 },
      { id: 'cc3', name: '高屏高屏市區往返里港廠區小客車租借', category: 'travel', unitCost: 12000, quantity: 1 }
    ],
    quoteReviewStatus: 'approved',
    phase2UploadedFiles: ['廠商特質調查表_永勝食品.docx', '成本分析表_HACCP_v1.xlsx', '報價單_永勝HACCP輔導.pdf'],
    
    contractSealingStatus: 'sealed',
    assignedConsultantId: 'C-004',
    assignedConsultantName: '林惠琳 顧問',
    consultantHours: 80,
    consultantHourlyRate: 1800,
    consultantExpenses: 10000,
    phase3UploadedFiles: ['用印合約雙方持存版_永勝食品.pdf', '林惠琳顧問委託書.pdf'],
    
    milestones: [
      { id: 'm10', title: '完成產線生物及化學危害全面盤點', dueDate: '2026-02-28', status: 'completed' },
      { id: 'm11', title: '全體產線作業員HACCP衛生教育訓練', dueDate: '2026-03-31', status: 'completed' },
      { id: 'm12', title: '正式通過專家現場評鑑並取得證書。', dueDate: '2026-05-15', status: 'completed' }
    ],
    paymentNodes: [
      { id: 'p10', title: '第一期：簽約預付款 (50%)', amount: 120000, invoiceNumber: 'INV20260205', billingDate: '2026-02-10', status: 'paid' },
      { id: 'p11', title: '第二期：評鑑合格完成及提供結案報告 (50%)', amount: 120000, invoiceNumber: 'INV20260520', billingDate: '2026-05-20', status: 'invoiced' }
    ],
    fieldRecords: [
      {
        id: 'fr10',
        date: '2026-02-20',
        topic: '初次勘查：冷凍肉包解凍區動線與交叉污染評估',
        mentor: '林惠琳 顧問',
        content: '發現生鮮解凍區之廢水排氣管有逆流、滲出。這在衛生檢查為大忌，易導致沙門氏菌滋生。已教導員工正確配製50ppm氯水進行表面消毒，並要求厂務務必在下周進行排水閥門更新、拉出污水軟管導出外處。',
        signInPhoto: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200',
        sessionPhoto: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'fr11',
        date: '2026-04-12',
        topic: '急凍隧道 CCP(關鍵管制點) 清理與台度管制指導',
        mentor: '林惠琳 顧問',
        content: '針對急凍庫隧道核心溫度需不定期量測進行現場教學。抽檢4批包子，急凍速度符合15分鐘內中心溫度達-18度之HACCP管制目標。建議廠務之溫度校驗表每月持續貼於主機箱外，利於衛生局突檢調閱。',
        signInPhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200',
        sessionPhoto: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=200'
      }
    ],
    midtermReportStatus: 'not_required',
    phase4UploadedFiles: ['林惠琳現場輔導簽署卷_0220.pdf', '現場急凍產線照片3張.zip', 'HACCP證書影本_永勝食品.pdf'],
    
    closingChecks: {
      serviceDelivered: true,
      allInvoicesIssued: true,
      allPaymentsReceived: false, // PM waiting for finance tracking balance
      finalReportApproved: true,
    },
    finalInvoicedAmount: 240000,
    phase5UploadedFiles: ['HACCP結案大報告書.pdf', '費用單據發票印花稅整合憑證.zip'],
  }
];

export const CONSULTANTS = [
  { id: 'C-001', name: '黃自強 顧問', title: '高階領導與變革策略顧問（前台積電培訓處長）' },
  { id: 'C-002', name: '張敏德 顧問', title: 'ESG永續策略與 ISO 14064-1 主要講師' },
  { id: 'C-003', name: '林信良 教授級顧問', title: '智慧物流AGV、物聯網與智慧製造系統模組總負責人' },
  { id: 'C-004', name: '林惠琳 顧問', title: '食品衛生、HACCP/ISO 22000 資深評鑑稽核專家' },
  { id: 'C-005', name: '陳建華 博士', title: 'AI 智慧預測與供應鏈排程算法專家' }
];

export const FORM_TEMPLATES = [
  {
    id: 'f1',
    name: '【標準成本分析表】公版範本.csv',
    type: 'excel',
    description: '適用於各中大型諮詢項目，提供人天成本、講義耗材、差旅費等預設大項。',
    csvContent: `項目分類,細項名稱,單價(NTD),數量,單位,備註
人天輔導,資深顧問人天費,18000,10,人天,現場實地輔導與文件編修
專案管理,專案經理統籌及會議,6000,5,人天,進度控管與會議協調
材料印製,專案工具箱與彩色講義,500,20,套,客戶人手一套講義及教具
交通差旅,顧問高鐵及偏鄉計程車費,3000,4,趟,據實核銷
其它費用,系統平台帳號授權半年,30000,1,組,提供線上管理專利系統`
  },
  {
    id: 'f2',
    name: '【廠商特質調查表】公版範本.txt',
    type: 'word',
    description: '用於議價報價階段，協助業務掌握客方關鍵決策者特質、合約談判偏好或付款習慣。',
    csvContent: `=========================================
【廠商特質調查暨談判掌握表】（公版）
=========================================
一、 客戶基本性格探析
1. 主要決策者（BDM）：[姓名/職稱]
   - 行事作風：□ 行動果斷重視成果  □ 極度細節控  □ 重視他人推薦口碑
2. 專案推動負責人（PM）：[姓名/職稱]
   - 關注焦點：□ 能否減輕其工作負擔  □ 合約是否符合採購作業程序

二、 付款意願與預算偏好
1. 議價習慣：□ 首輪必砍10%以上  □ 習慣以附加免費服務取代砍價  □ 信任品牌不爭報價
2. 付款能力與信用度評核：□ 極佳（30天內入賬）  □ 中等（簽呈繁冗約60天）  □ 需財務常盯人

三、 本案合作機會點與關係深度
- 客方急迫痛苦點：_______________________________
- 我方最大競爭優勢：_____________________________
- 我方可能的談判退讓底線（如：可提供2小時免費後續電話諮詢）：___________________`
  },
  {
    id: 'f3',
    name: '【顧問委託簽約合約主範本】.txt',
    type: 'word',
    description: '適用於 Phase 3 與外部特約顧問、大學教授簽署的委託契約公版，載明保障與競業防範。',
    csvContent: `顧問委託研究合約書（公版）
=========================================
立合約書人：
委託人：財團法人智慧專案管理顧問推廣中心（以下稱甲方）
受託顧問：________________________（以下稱乙方）

雙方因辦理【________________專案】之專案委託事宜，特立此約。
第一條（顧問服務內容）
乙方應依甲方指派之時程，前往甲方客戶（________________公司）進行：
- 實地輔導／課程授課。
- 協助編撰該專案成果報告書及產出單據。

第二條（費用報酬與給付）
1. 顧問指導費：時薪為 NTD$_______ 元整。
2. 顧問差旅交通費：依大眾運輸工具核實向甲方報銷。

第三條（保密條款與智慧財產）
1. 乙方承諾因本專案得知之所有客戶營業秘密，非經甲方授權不得公開。
2. 乙方於本案執行期間產生之輔導紀錄、報告，其智慧財產權歸屬甲方所有。`
  }
];

export const INITIAL_NOTIFICATIONS: WorkflowNotification[] = [
  {
    id: 'n1',
    projectId: 'PRJ-2026-004',
    projectName: '正道機械 AGV 智慧升級與補助案輔導',
    timestamp: '2026-05-24T08:35:00Z',
    type: 'payment_reminder',
    message: '⚠️ 距離「第二期：期中報告審查通過 (40%)」請款節點（2026-06-15）尚有 22 天，系統已自動提醒專案經理與財務注意核備財務。',
    isRead: false
  },
  {
    id: 'n2',
    projectId: 'PRJ-2026-003',
    projectName: '大豐通訊 ESG 永續供應鏈碳盤查輔導',
    timestamp: '2026-05-23T11:45:00Z',
    type: 'contract_signed',
    message: '🎉 專案由 PM 標記「已上傳合約用印申請」，已自動通知法務/PM 追蹤用印簽回，並預備發信請財務隨時確認首期款發票。',
    isRead: false
  },
  {
    id: 'n3',
    projectId: 'PRJ-2026-005',
    projectName: '永勝食品 HACCP 食品安全輔導與續證',
    timestamp: '2026-05-20T10:00:00Z',
    type: 'milestone_completed',
    message: '✅ 里程碑「正式通過專家現場評鑑並取得證書」已全部完成。專案已正式推進到「結案核銷」階段，請負責人與財務進行各項單據驗核。',
    isRead: true
  }
];
