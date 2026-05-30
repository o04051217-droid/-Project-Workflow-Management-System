export type Role = 'sales' | 'consultant' | 'finance' | 'pm';

export interface RoleConfig {
  id: Role;
  name: string;
  badgeColor: string;
  description: string;
}

export type ProjectPhase = 'demand' | 'quote' | 'contract' | 'execute' | 'close';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface PaymentNode {
  id: string;
  title: string;
  amount: number;
  invoiceNumber?: string;
  billingDate: string;
  status: 'draft' | 'reminding' | 'invoiced' | 'paid'; // reminders trigger around due dates
}

export interface FieldRecord {
  id: string;
  date: string;
  topic: string;
  mentor: string;
  content: string;
  signInPhoto?: string; // base64 or placeholder
  sessionPhoto?: string; // base64 or placeholder
}

export interface CostItem {
  id: string;
  name: string;
  category: 'human' | 'travel' | 'material' | 'other';
  unitCost: number;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  contactPerson: string;
  contactPhone: string;
  isLargeOrGov: boolean; // Large or government project flags additional document/requirements
  currentPhase: ProjectPhase;
  createdAt: string;
  updatedAt: string;
  
  // Phase 1: 需求確認 (Sales)
  demandDesc: string;
  techFeasibility: string; // 接案技術評估
  resourceFeasibility: string; // 接案量能評估
  phase1UploadedFiles: string[]; // ["需求說明書.pdf"]
  
  // Phase 2: 議價與報價 (Sales / PM)
  basicQuoteAmount: number; // 原始報價金額
  finalQuoteAmount: number; // 協商議價後金額
  costAnalysisItems: CostItem[]; // 成本分析細項
  quoteReviewStatus: 'draft' | 'submitted' | 'approved';
  phase2UploadedFiles: string[]; // ["廠商特質調查表.docx", "成本分析表.xlsx", "報價單.pdf", "計畫書.pdf"]
  
  // Phase 3: 簽約與協議 (PM / 法務 / 顧問)
  contractSealingStatus: 'pending' | 'submitted' | 'sealed'; // 用印狀態
  assignedConsultantId: string; // 外部顧問 ID
  assignedConsultantName: string; // 外部顧問 姓名
  consultantHours: number; // 預計工時
  consultantHourlyRate: number; // 顧問時薪
  consultantExpenses: number; // 顧問其它費用
  phase3UploadedFiles: string[]; // ["合約.pdf", "協議書.pdf", "顧問委託研究合約.pdf"]
  consultantContract?: ConsultantContractInfo;

  // Phase 4: 啟動與執行 (PM / 顧問 / 財務)
  milestones: Milestone[];
  paymentNodes: PaymentNode[];
  fieldRecords: FieldRecord[];
  midtermReportStatus: 'not_required' | 'pending' | 'submitted'; // 政府補助案期中報告
  phase4UploadedFiles: string[]; // ["簽到表.pdf", "課程照片.jpg"]
  
  // Phase 5: 結案與核銷 (PM / 財務)
  closingChecks: {
    serviceDelivered: boolean;
    allInvoicesIssued: boolean;
    allPaymentsReceived: boolean;
    finalReportApproved: boolean;
  };
  finalInvoicedAmount: number; // 實收/核銷後總金額
  phase5UploadedFiles: string[]; // ["結案報告.pdf", "單據憑證核銷紀錄.zip"]
  detailedCostAnalysis?: ProjectDetailedCost;
}

export interface DetailedCostRow {
  name: string;
  refPercentage: number;          // 比例參考值 (如 17.24 代表 17.24%)
  estimatedExpense: number;       // 預估支出
  actualExpense: number;          // 實際支出
  note: string;                  // 超支異常說明
}

export interface ProjectDetailedCost {
  auditFeeTaxIncluded: number;    // 稽核費(含稅) - 如 231,000
  auditFeeTaxDeducted: boolean;   // 是否從專案款扣除
  incomeTaxRate: number;          // 營所稅 (預設 20%)
  taxRateSelection: '16%' | '21%'; // 稅額選擇 (預設 '21%' -> 4.20%)
  rows: {
    adminFee: DetailedCostRow;     // 行政費用 (Ref %: 17.24%)
    incomeTax: DetailedCostRow;    // 所得稅 (Ref %: 4.20%)
    performanceFee: DetailedCostRow; // 績效費 (Ref %: 0.00%)
    consultantFee: DetailedCostRow; // 講師費 (Ref %: 53.32%)
    paidConsultantFee: DetailedCostRow; // 已支付講師費 (Ref %: 0.00%)
    trafficFee: DetailedCostRow;   // 交通費 (Ref %: 2.10%)
    oilFee: DetailedCostRow;       // 油資 (Ref %: 2.10%)
    parkingFee: DetailedCostRow;   // 停車費 (Ref %: 0.04%)
    lodgingFee: DetailedCostRow;   // 住宿費 (Ref %: 0.19%)
    entertainmentFee: DetailedCostRow; // 交際費 (Ref %: 0.20%)
    mealFee: DetailedCostRow;      // 伙食費 (Ref %: 0.03%)
    printingFee: DetailedCostRow;  // 印刷與郵資 (Ref %: 0.09%)
    evaluationFee: DetailedCostRow;// 評鑑費 (Ref %: 0.00%)
    otherFee: DetailedCostRow;     // 其他費用 (Ref %: 1.93%)
  };
}

export const ROLES: Record<Role, RoleConfig> = {
  sales: {
    id: 'sales',
    name: '業務人員 (Sales)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: '負責建立專案、紀錄前期需求評估、上傳議價/成本及報價單。無權限修改簽約細節、里程碑與開立發票狀態。',
  },
  consultant: {
    id: 'consultant',
    name: '顧問導師 (Consultant)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: '負責現場輔導，僅可檢視其指派專案，上傳簽到表、課程照片與顧問輔導紀錄，無財務編輯權。',
  },
  finance: {
    id: 'finance',
    name: '財務會計 (Finance)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: '負責發票開立狀態、各期款項入帳確認、檢視合約與進行最終之單據憑證結案核銷。',
  },
  pm: {
    id: 'pm',
    name: '專案負責人 (Project Manager)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: '擁至高權利，管理自需求至結案核銷之每一環節，處理指派派工、里程碑設立、合約用印、報告審查。',
  },
};

export const PHASES = [
  { id: 'demand', name: '需求確認', num: '1', desc: '需求接案評估' },
  { id: 'quote', name: '議價報價', num: '2', desc: '報價審查與成本估算' },
  { id: 'contract', name: '簽約協議', num: '3', desc: '合約用印與派工' },
  { id: 'execute', name: '啟動執行', num: '4', desc: '現場指導、請款與期中' },
  { id: 'close', name: '結案核銷', num: '5', desc: '結案檢核、核銷尾款' },
] as const;

export interface WorkflowNotification {
  id: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  type: 'contract_signed' | 'payment_reminder' | 'milestone_completed' | 'info';
  message: string;
  isRead: boolean;
}

export interface ConsultantContractInfo {
  partyA: string;
  representativeA: string;
  addressA: string;
  partyB: string;
  idNumberB: string;
  addressB: string;
  partyC: string;
  projectName: string;
  startDate: string;
  endDate: string;
  sessionsCount: number;
  totalAmount: number;
  stage1Amount: number;
  stage2Amount: number;
  signDate: string;
}

