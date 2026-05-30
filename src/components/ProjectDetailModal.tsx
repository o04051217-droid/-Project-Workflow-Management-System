import React, { useState, useEffect } from 'react';
import { Project, ProjectPhase, PHASES, ROLES, Role, Milestone, PaymentNode, FieldRecord, CostItem, ConsultantContractInfo } from '../types';
import { CONSULTANTS } from '../data';
import { CostCalculator } from './CostCalculator';
import { DetailedCostAnalysis, createDefaultDetailedCostAnalysis } from './DetailedCostAnalysis';
import { FileManagementTab } from './FileManagementTab';
import { 
  X, Shield, AlertTriangle, FileText, Upload, Calendar, Plus, 
  CheckSquare, Check, Sparkles, Printer, Circle, CheckCircle, Camera, Award
} from 'lucide-react';

export function createDefaultConsultantContract(project: Project): ConsultantContractInfo {
  const calculatedFee = (project.consultantHours * project.consultantHourlyRate) + (project.consultantExpenses || 0);
  const totalAmount = calculatedFee > 0 ? calculatedFee : 80000;

  return {
    partyA: '群恆新世代企業有限公司',
    representativeA: '郭漢章',
    addressA: '高雄市左營區文瑞路27號4樓',
    partyB: project.assignedConsultantName || '張婷崴',
    idNumberB: '',
    addressB: '',
    partyC: project.clientName || '資拓宏宇國際股份有限公司',
    projectName: project.name || 'ESG永續報告輔導專案',
    startDate: '114年12月1日',
    endDate: '115年8月31日',
    sessionsCount: 8,
    totalAmount,
    stage1Amount: Math.round(totalAmount / 2),
    stage2Amount: Math.round(totalAmount / 2),
    signDate: '中華民國 115 年 1 月 13 日',
  };
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
  userRole: Role;
}

export function ProjectDetailModal({ project, onClose, onSave, userRole }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ProjectPhase | 'files'>(project.currentPhase);
  const [editedProject, setEditedProject] = useState<Project>(() => {
    const copy = { ...project };
    if (!copy.detailedCostAnalysis) {
      copy.detailedCostAnalysis = createDefaultDetailedCostAnalysis(copy.finalQuoteAmount || copy.basicQuoteAmount || 160425);
    }
    if (!copy.consultantContract) {
      copy.consultantContract = createDefaultConsultantContract(copy);
    }
    return copy;
  });
  const [showQuotePrint, setShowQuotePrint] = useState(false);
  const [showConsultantContractPrint, setShowConsultantContractPrint] = useState(false);
  const [copiedContractText, setCopiedContractText] = useState(false);

  // Sync state if project changes
  useEffect(() => {
    const copy = { ...project };
    if (!copy.detailedCostAnalysis) {
      copy.detailedCostAnalysis = createDefaultDetailedCostAnalysis(copy.finalQuoteAmount || copy.basicQuoteAmount || 160425);
    }
    if (!copy.consultantContract) {
      copy.consultantContract = createDefaultConsultantContract(copy);
    }
    setEditedProject(copy);
    setActiveTab(project.currentPhase);
  }, [project]);

  // Handle simple input changes
  const handleFieldChange = (field: keyof Project, value: any) => {
    const updated = { ...editedProject, [field]: value, updatedAt: new Date().toISOString() };
    setEditedProject(updated);
  };

  const handleContractFieldChange = (field: keyof ConsultantContractInfo, value: any) => {
    const parentContract = editedProject.consultantContract || createDefaultConsultantContract(editedProject);
    const updatedContract = { ...parentContract, [field]: value };
    setEditedProject({
      ...editedProject,
      consultantContract: updatedContract,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSave = () => {
    onSave(editedProject);
  };

  // Enforce RBAC rules
  const canEditPhase = (phase: ProjectPhase | 'files'): boolean => {
    if (phase === 'files') return true;
    if (userRole === 'pm') return true;
    if (userRole === 'sales' && (phase === 'demand' || phase === 'quote')) return true;
    if (userRole === 'finance' && (phase === 'close' || phase === 'execute')) return true;
    return false;
  };

  // Mock upload simulator
  const handleMockUpload = (phase: 1 | 2 | 3 | 4 | 5, defaultFileName: string) => {
    const timeStamp = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const formattedName = `[已核備_${timeStamp}] ${defaultFileName}`;
    
    let updatedFiles: string[] = [];
    let fieldKey: 'phase1UploadedFiles' | 'phase2UploadedFiles' | 'phase3UploadedFiles' | 'phase4UploadedFiles' | 'phase5UploadedFiles';

    switch (phase) {
      case 1:
        fieldKey = 'phase1UploadedFiles';
        updatedFiles = [...editedProject.phase1UploadedFiles, formattedName];
        break;
      case 2:
        fieldKey = 'phase2UploadedFiles';
        updatedFiles = [...editedProject.phase2UploadedFiles, formattedName];
        break;
      case 3:
        fieldKey = 'phase3UploadedFiles';
        updatedFiles = [...editedProject.phase3UploadedFiles, formattedName];
        break;
      case 4:
        fieldKey = 'phase4UploadedFiles';
        updatedFiles = [...editedProject.phase4UploadedFiles, formattedName];
        break;
      case 5:
        fieldKey = 'phase5UploadedFiles';
        updatedFiles = [...editedProject.phase5UploadedFiles, formattedName];
        break;
    }

    const updated = {
      ...editedProject,
      [fieldKey]: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updated);
  };

  // Phase 4: Milestone inputs
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate,
      status: 'pending'
    };
    const updated = {
      ...editedProject,
      milestones: [...(editedProject.milestones || []), newM],
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updated);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const toggleMilestone = (id: string) => {
    const updatedMilestones = (editedProject.milestones || []).map(m => 
      m.id === id ? { ...m, status: (m.status === 'completed' ? 'pending' : 'completed') as any } : m
    );
    const updated = {
      ...editedProject,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updated);
  };

  // Phase 4: Payment Node inputs
  const [newPayTitle, setNewPayTitle] = useState('');
  const [newPayAmount, setNewPayAmount] = useState<number>(0);
  const [newPayDate, setNewPayDate] = useState('');

  const handleAddPaymentNode = () => {
    if (!newPayTitle.trim() || newPayAmount <= 0 || !newPayDate) return;
    const newP: PaymentNode = {
      id: `p-${Date.now()}`,
      title: newPayTitle,
      amount: newPayAmount,
      billingDate: newPayDate,
      status: 'draft'
    };
    const updated = {
      ...editedProject,
      paymentNodes: [...(editedProject.paymentNodes || []), newP],
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updated);
    setNewPayTitle('');
    setNewPayAmount(0);
    setNewPayDate('');
  };

  const handlePaymentNodeStatusChange = (id: string, status: any) => {
    const updatedNodes = (editedProject.paymentNodes || []).map(n => {
      if (n.id === id) {
        const node = { ...n, status };
        if (status === 'invoiced' && !node.invoiceNumber) {
          node.invoiceNumber = `INV-${new Date().getFullYear()}${(Math.floor(Math.random() * 900000) + 100000)}`;
        }
        return node;
      }
      return n;
    });
    setEditedProject({
      ...editedProject,
      paymentNodes: updatedNodes,
      updatedAt: new Date().toISOString()
    });
  };

  // Phase 4: Field Session Records (Mobile friendly with photo mock)
  const [recordTopic, setRecordTopic] = useState('');
  const [recordContent, setRecordContent] = useState('');
  const [mockPhotoToUpload, setMockPhotoToUpload] = useState<string>('');

  const handleAddFieldRecord = () => {
    if (!recordTopic.trim() || !recordContent.trim()) return;
    const newR: FieldRecord = {
      id: `fr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      topic: recordTopic,
      mentor: userRole === 'consultant' ? editedProject.assignedConsultantName || '特約顧問師' : '主要專案負責人',
      content: recordContent,
      signInPhoto: mockPhotoToUpload ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200' : undefined,
      sessionPhoto: mockPhotoToUpload ? 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=200' : undefined
    };

    const updated = {
      ...editedProject,
      fieldRecords: [newR, ...(editedProject.fieldRecords || [])],
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updated);
    setRecordTopic('');
    setRecordContent('');
    setMockPhotoToUpload('');
  };

  // Verify completeness of deliverables per Phase
  const getDeliverableStatus = (phaseId: ProjectPhase) => {
    switch (phaseId) {
      case 'demand':
        return editedProject.phase1UploadedFiles.length > 0;
      case 'quote':
        const lengthNeeded = editedProject.isLargeOrGov ? 4 : 3;
        return editedProject.phase2UploadedFiles.length >= lengthNeeded && editedProject.quoteReviewStatus === 'approved';
      case 'contract':
        return editedProject.phase3UploadedFiles.length >= 2;
      case 'execute':
        const milestonesFinished = (editedProject.milestones || []).every(m => m.status === 'completed');
        const paymentsInvoiced = (editedProject.paymentNodes || []).every(p => p.status === 'invoiced' || p.status === 'paid');
        return milestonesFinished && paymentsInvoiced && editedProject.fieldRecords?.length > 0;
      case 'close':
        return editedProject.closingChecks?.serviceDelivered && 
               editedProject.closingChecks?.allInvoicesIssued && 
               editedProject.closingChecks?.finalReportApproved &&
               editedProject.phase5UploadedFiles?.length >= 2;
    }
  };

  const activeDeliverableDone = activeTab === 'files' ? true : getDeliverableStatus(activeTab);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Block with Project Name & Role View */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-4 border-b border-slate-800 sticky top-0 z-30 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-400 text-xs font-bold leading-none bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                {editedProject.id}
              </span>
              <span className="text-slate-400 text-xs font-mono font-medium">| {editedProject.clientName}</span>
            </div>
            <h2 className="font-sans font-bold text-base md:text-lg leading-snug truncate max-w-2xl">
              {editedProject.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs text-slate-400 mr-1">
              操作檢視權限：
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${ROLES[userRole].badgeColor}`}>
                {ROLES[userRole].name}
              </span>
            </span>

            <button
              type="button"
              id="close-modal-x"
              onClick={onClose}
              className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Workflow Timeline Tracker 1-5 + Central File Tab */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 md:p-3 overflow-x-auto sticky top-[73.5px] md:top-[81.5px] z-20 shrink-0">
          <div className="flex items-center justify-between min-w-[850px] max-w-5xl mx-auto px-4 gap-2">
            <div className="flex items-center justify-between flex-1">
              {PHASES.map((ph, i) => {
                const isActive = activeTab === ph.id;
                const isCurrent = editedProject.currentPhase === ph.id;
                const isCompleted = PHASES.findIndex(p => p.id === editedProject.currentPhase) > i;
                
                return (
                  <React.Fragment key={ph.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(ph.id)}
                      className={`flex items-center gap-1.5 focus:outline-none transition-all py-1.5 px-3 rounded-lg ${
                        isActive 
                          ? 'bg-slate-800 text-white shadow-sm font-bold scale-102' 
                          : isCurrent 
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold'
                          : isCompleted
                          ? 'text-emerald-700 hover:bg-slate-200'
                          : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive 
                          ? 'bg-indigo-500 text-white' 
                          : isCompleted 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-300 text-slate-700'
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3" /> : ph.num}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] leading-tight font-medium uppercase tracking-wider block">PHASE {ph.num}</p>
                        <p className="text-[10px] leading-tight font-bold mt-0.5">{ph.name}</p>
                      </div>
                    </button>

                    {i < PHASES.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-300 mx-3 shrink-0"></div>

            {/* Centralized File Tab */}
            <button
              type="button"
              id="file-manager-tab-btn"
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 focus:outline-none transition-all py-1.5 px-3.5 rounded-lg shrink-0 ${
                activeTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-md font-bold scale-102'
                  : 'text-slate-600 hover:bg-slate-250 border border-transparent'
              }`}
            >
              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                activeTab === 'files' ? 'bg-white text-indigo-605' : 'bg-slate-300 text-slate-700'
              }`}>
                📁
              </div>
              <div className="text-left">
                <p className="text-[11px] leading-tight font-medium uppercase tracking-wider block">ALL FILES</p>
                <p className="text-[10px] leading-tight font-bold mt-0.5">集中檔案管理</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main interactive Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* Permissions Warning & Instructions */}
          {!canEditPhase(activeTab) && (
            <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">⚠️ 唯讀檢視模式：</span>
                您目前的角色為【{ROLES[userRole].name}】，無權限編輯此「{PHASES.find(p => p.id === activeTab)?.name}」階段的資料表。僅 
                {activeTab === 'demand' || activeTab === 'quote' ? '【業務/專案負責人】' : activeTab === 'close' ? '【財務/專案負責人】' : '【專案負責人】'} 才能在此處進行存檔。
              </div>
            </div>
          )}

          {/* PHASE 1: 需求確認 */}
          {activeTab === 'demand' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                  潛在客戶及廠商基本資訊
                </h3>
                
                <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">委託廠商名稱</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{editedProject.clientName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block font-medium">聯絡窗口人員</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{editedProject.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">聯絡人電話</span>
                      <span className="font-mono text-slate-800 mt-0.5 block">{editedProject.contactPhone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium font-mono text-[10px]">PROJECT ID</span>
                    <span className="font-mono text-slate-800 mt-0.5 block">{editedProject.id}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="demand-desc-area" className="block text-xs font-bold text-slate-700 mb-1">精確客戶需求描述</label>
                    <textarea
                      id="demand-desc-area"
                      value={editedProject.demandDesc}
                      disabled={!canEditPhase('demand')}
                      onChange={(e) => handleFieldChange('demandDesc', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-350 rounded-lg min-h-[90px] focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="請輸入詳盡需求細節..."
                    />
                  </div>

                  <div>
                    <label htmlFor="tech-feas-area" className="block text-xs font-bold text-slate-700 mb-1">接案能力初步評估【技術端】</label>
                    <textarea
                      id="tech-feas-area"
                      value={editedProject.techFeasibility}
                      disabled={!canEditPhase('demand')}
                      onChange={(e) => handleFieldChange('techFeasibility', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-350 rounded-lg min-h-[70px] focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="針對技術門檻進行評定與相符顾问分析..."
                    />
                  </div>

                  <div>
                    <label htmlFor="res-feas-area" className="block text-xs font-bold text-slate-700 mb-1">接案能力初步評估【量能端/輔導排程】</label>
                    <textarea
                      id="res-feas-area"
                      value={editedProject.resourceFeasibility}
                      disabled={!canEditPhase('demand')}
                      onChange={(e) => handleFieldChange('resourceFeasibility', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-350 rounded-lg min-h-[70px] focus:outline-none"
                      placeholder="如：工時人天限制、排程調度分析..."
                    />
                  </div>
                </div>
              </div>

              {/* Uploads and deliverables checklist */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                  階段一檔案檢核項目
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  業務主導。依中心資安及行政規範，本階段必須上傳廠商所提供之初始需求說明單據或對接郵政內容歸檔。
                </p>

                <div className="space-y-3 mt-4">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className={`w-4 h-4 ${editedProject.phase1UploadedFiles.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-700">【強制作意】廠商需求說明文件</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${editedProject.phase1UploadedFiles.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {editedProject.phase1UploadedFiles.length > 0 ? '已上傳' : '待上傳'}
                      </span>
                    </div>

                    {/* Files list */}
                    {editedProject.phase1UploadedFiles.length > 0 && (
                      <div className="mt-3 bg-slate-50 p-2 rounded-lg space-y-1">
                        {editedProject.phase1UploadedFiles.map((f, id) => (
                          <div key={id} className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                            <span>📄</span>
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {canEditPhase('demand') && (
                      <button
                        type="button"
                        id="upload-phase1-mock-btn"
                        onClick={() => handleMockUpload(1, '客戶需求與工廠規格說明信件記錄.docx')}
                        className="mt-3 w-full border border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        模擬上傳需求資料
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2: 議價與報價 */}
          {activeTab === 'quote' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Project Attribute</span>
                  <h4 className="font-bold text-sm text-slate-800">
                    是否為「大型專案 / 政府招標專案」？
                  </h4>
                  <p className="text-xs text-slate-500">
                    勾選「大型/政府專案」後，除了標準的特質、成本與報價文件外，系統會強制關聯要求上傳【技術計劃書】供用印複審。
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    id="gov-project-toggle-chk"
                    type="checkbox"
                    checked={editedProject.isLargeOrGov}
                    disabled={!canEditPhase('quote')}
                    onChange={(e) => handleFieldChange('isLargeOrGov', e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="gov-project-toggle-chk" className="text-xs font-bold text-slate-700">勾選為「大型 / 政府補助補助案」</label>
                </div>
              </div>

              {/* Main Estimation & Calculators */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                      標準成本精算分析與定價對比
                    </h3>
                    
                    <button
                      type="button"
                      id="generate-quotation-template-btn"
                      onClick={() => setShowQuotePrint(true)}
                      className="bg-indigo-50 hover:bg-indigo-150 border border-indigo-200 text-indigo-700 hover:text-indigo-800 text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 transition font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      一鍵生成標準報價單
                    </button>
                  </div>

                  <DetailedCostAnalysis
                    project={editedProject}
                    onChange={(costAnalysis) => {
                      const adminActSum = costAnalysis.rows.adminFee.actualExpense + costAnalysis.rows.incomeTax.actualExpense;
                      const consultantActSum = costAnalysis.rows.consultantFee.actualExpense + costAnalysis.rows.paidConsultantFee.actualExpense;
                      const trafficActSum = costAnalysis.rows.trafficFee.actualExpense + costAnalysis.rows.oilFee.actualExpense + costAnalysis.rows.parkingFee.actualExpense + costAnalysis.rows.lodgingFee.actualExpense + costAnalysis.rows.mealFee.actualExpense;
                      const otherActSum = costAnalysis.rows.printingFee.actualExpense + costAnalysis.rows.otherFee.actualExpense;

                      setEditedProject({
                        ...editedProject,
                        detailedCostAnalysis: costAnalysis,
                        costAnalysisItems: [
                          { name: '行政及稅務分攤 (含稽核、所得稅)', unitCost: adminActSum, quantity: 1, category: 'admin' },
                          { name: '現場授課及特聘諮詢顧問講師費', unitCost: consultantActSum, quantity: 1, category: 'consulting' },
                          { name: '現場交通、差旅與油資實報實銷額', unitCost: trafficActSum, quantity: 1, category: 'traffic' },
                          { name: '印製郵資及其他行管管銷雜支', unitCost: otherActSum, quantity: 1, category: 'other' }
                        ],
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    readOnly={!canEditPhase('quote')}
                    phase="quote"
                  />
                </div>

                {/* Left/Right side columns: Files and actions */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                    強制作業檔案檢核與報價狀態
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div>
                      <label htmlFor="quote-review-status-select" className="block text-xs font-bold text-slate-700 mb-1">報價審件狀態</label>
                      <select
                        id="quote-review-status-select"
                        value={editedProject.quoteReviewStatus || 'draft'}
                        disabled={!canEditPhase('quote')}
                        onChange={(e) => handleFieldChange('quoteReviewStatus', e.target.value)}
                        className="text-xs w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                      >
                        <option value="draft">📁 報價草稿中 (Draft)</option>
                        <option value="submitted">⏳ 送審中，待主管核備 (Submitted)</option>
                        <option value="approved">✅ 審核通過，可發信客戶 (Approved)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block font-medium">原始精算成本</span>
                        <span className="font-mono font-bold text-slate-700 mt-0.5 block">
                          ${(editedProject.costAnalysisItems || []).reduce((s, c) => s + (c.unitCost * c.quantity), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block font-medium">最終協定報價額</span>
                        <span className="font-mono font-bold text-indigo-750 mt-0.5 block">
                          ${editedProject.finalQuoteAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document uploads check in Phase 2 */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3 text-xs bg-white">
                    <span className="font-bold text-slate-700 block text-xs">應備書面用印歸檔：</span>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1">
                          <CheckCircle className={`w-3.5 h-3.5 ${editedProject.phase2UploadedFiles.includes('[已核備] 1._廠商特質調查表.docx') || editedProject.phase2UploadedFiles.length > 0 ? 'text-emerald-500' : 'text-slate-350'}`} />
                          1. 廠商特質調查表
                        </span>
                        <span className="text-[10px] text-slate-400">強制</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1">
                          <CheckCircle className={`w-3.5 h-3.5 ${editedProject.phase2UploadedFiles.includes('[已核備] 2._成本分析表.xlsx') || editedProject.phase2UploadedFiles.length > 1 ? 'text-emerald-500' : 'text-slate-350'}`} />
                          2. 成本分析表 (試算)
                        </span>
                        <span className="text-[10px] text-slate-400">強制</span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1">
                          <CheckCircle className={`w-3.5 h-3.5 ${editedProject.phase2UploadedFiles.includes('[已核備] 3._報價單.pdf') || editedProject.phase2UploadedFiles.length > 2 ? 'text-emerald-500' : 'text-slate-350'}`} />
                          3. 外發客戶報價單書
                        </span>
                        <span className="text-[10px] text-slate-400">強制</span>
                      </div>

                      {editedProject.isLargeOrGov && (
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                          <span className="text-slate-800 font-medium flex items-center gap-1">
                            <CheckCircle className={`w-3.5 h-3.5 ${editedProject.phase2UploadedFiles.includes('[已核備] 4._政府大專案技術計劃書.pdf') || editedProject.phase2UploadedFiles.length > 3 ? 'text-emerald-500' : 'text-slate-350'}`} />
                            4. 【專屬】政府計畫書
                          </span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1 rounded">額外強制</span>
                        </div>
                      )}
                    </div>

                    {/* Show files */}
                    {editedProject.phase2UploadedFiles.length > 0 && (
                      <div className="mt-2.5 bg-slate-50 p-2 rounded-lg space-y-1 font-mono text-[10px] text-slate-600">
                        {editedProject.phase2UploadedFiles.map((fn, idx) => (
                          <div key={idx} className="truncate">📎 {fn}</div>
                        ))}
                      </div>
                    )}

                    {canEditPhase('quote') && (
                      <button
                        type="button"
                        id="upload-phase2-all-mock-btn"
                        onClick={() => {
                          const files = [
                            '[已核備] 1._廠商特質調查表.docx',
                            '[已核備] 2._成本分析表.xlsx',
                            '[已核備] 3._報價單.pdf'
                          ];
                          if (editedProject.isLargeOrGov) {
                            files.push('[已核備] 4._政府大專案技術計劃書.pdf');
                          }
                          setEditedProject({
                            ...editedProject,
                            phase2UploadedFiles: files,
                            updatedAt: new Date().toISOString()
                          });
                        }}
                        className="w-full mt-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        一鍵模擬歸檔應繳文件
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 3: 簽約與協議 */}
          {activeTab === 'contract' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                  合約主應請與用印審核
                </h3>
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 text-xs">
                  <div>
                    <label htmlFor="contract-seal-select" className="block text-xs font-bold text-slate-705 mb-1.5">合約及公務印用印審請</label>
                    <select
                      id="contract-seal-select"
                      value={editedProject.contractSealingStatus || 'pending'}
                      disabled={!canEditPhase('contract')}
                      onChange={(e) => handleFieldChange('contractSealingStatus', e.target.value)}
                      className="text-xs w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                    >
                      <option value="pending">📜 待提交用印 (Pending)</option>
                      <option value="submitted">⏳ 已提交，法務審核用印中 (Submitted)</option>
                      <option value="sealed">✅ 雙方合約用印已完成並歸檔 (Sealed & Finished)</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    ※ 提醒：當用印狀態標記為「已簽約 / Sealed」時，系統將自動向財務模組發送一期發票開立任務。
                  </p>
                </div>

                <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                  外部特約顧問指派、工時與費用對接
                </h3>

                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 text-xs">
                  <div>
                    <label htmlFor="assign-consultant-select" className="block text-xs font-bold text-slate-700 mb-1">分派主導顧問老師</label>
                    <select
                      id="assign-consultant-select"
                      value={editedProject.assignedConsultantId || ''}
                      disabled={!canEditPhase('contract')}
                      onChange={(e) => {
                        const sel = CONSULTANTS.find(c => c.id === e.target.value);
                        setEditedProject({
                          ...editedProject,
                          assignedConsultantId: e.target.value,
                          assignedConsultantName: sel ? sel.name : '',
                          updatedAt: new Date().toISOString()
                        });
                      }}
                      className="text-xs w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                    >
                      <option value="">-- 尚未指派顧問 --</option>
                      {CONSULTANTS.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="consultant-hours-num" className="block text-[10px] font-bold text-slate-500 mb-1">預計輔導工時(Hr)</label>
                      <input
                        id="consultant-hours-num"
                        type="number"
                        min="0"
                        value={editedProject.consultantHours || ''}
                        disabled={!canEditPhase('contract')}
                        onChange={(e) => handleFieldChange('consultantHours', Number(e.target.value))}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="consultant-rate-num" className="block text-[10px] font-bold text-slate-500 mb-1">顧問約定時薪(NTD)</label>
                      <input
                        id="consultant-rate-num"
                        type="number"
                        min="0"
                        value={editedProject.consultantHourlyRate || ''}
                        disabled={!canEditPhase('contract')}
                        onChange={(e) => handleFieldChange('consultantHourlyRate', Number(e.target.value))}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="consultant-exp-num" className="block text-[10px] font-bold text-slate-500 mb-1">編列其他津貼費用</label>
                      <input
                        id="consultant-exp-num"
                        type="number"
                        min="0"
                        value={editedProject.consultantExpenses || ''}
                        disabled={!canEditPhase('contract')}
                        onChange={(e) => handleFieldChange('consultantExpenses', Number(e.target.value))}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>承辦顧問酬勞總經費(預估):</span>
                    <span className="font-bold text-slate-900">
                      ${((editedProject.consultantHours * editedProject.consultantHourlyRate) + (editedProject.consultantExpenses || 0)).toLocaleString()} NTD
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Required Upload Checklist & Lecturer agreement */}
              <div className="space-y-5">
                {/* Required Upload Checklist */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-800 border-l-3 border-indigo-500 pl-2">
                    本階段協議檔案歸檔與用印查核
                  </h3>
                  <p className="text-slate-500">
                    必須歸檔雙方正式簽約影本。且若本案有委任外部特約專家，必須加蓋與外部老師簽訂之【研究顧問合約】。
                  </p>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">1. 雙方首簽正式合約 (PDF)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${editedProject.phase3UploadedFiles.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {editedProject.phase3UploadedFiles.length > 0 ? '已核備' : '待補件'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                       <span className="font-bold text-slate-705">2. 顧問委託研究契約書 (PDF)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${editedProject.phase3UploadedFiles.length > 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {editedProject.phase3UploadedFiles.length > 1 ? '已核備' : '待補件'}
                      </span>
                    </div>

                    {editedProject.phase3UploadedFiles.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded-lg space-y-1 font-mono text-[10px] text-slate-500">
                        {editedProject.phase3UploadedFiles.map((fn, idx) => (
                          <div key={idx}>📎 {fn}</div>
                        ))}
                      </div>
                    )}

                    {canEditPhase('contract') && (
                      <button
                        type="button"
                        id="upload-phase3-all-mock-btn"
                        onClick={() => {
                          setEditedProject({
                            ...editedProject,
                            contractSealingStatus: 'sealed',
                            phase3UploadedFiles: [
                              '[核簽] 主服務契約聯名持存版.pdf',
                              '[核簽] 外部專家顧問合作案特商合約.pdf'
                            ],
                            updatedAt: new Date().toISOString()
                          });
                        }}
                        className="w-full mt-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        一鍵模擬合約用印及歸檔
                      </button>
                    )}
                  </div>
                </div>

                {/* 📝 講師特約委任合約 (Lecturer Agreement) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-xs font-sans">
                  <h3 className="font-bold text-sm text-slate-800 border-l-3 border-emerald-500 pl-2 flex items-center justify-between">
                    <span>📝 講師特約委任顧問合約 (Lecturer Agreement)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-705 px-2 py-0.5 rounded font-mono font-bold">
                      自動轉為合約
                    </span>
                  </h3>

                  {/* Warning/Prompt message depending on main contract sealing status */}
                  {editedProject.contractSealingStatus !== 'sealed' ? (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-800 leading-relaxed">
                      ⚠️ 提醒：主合約目前非「雙方合約用印已完成」狀態。主專案合約完成用印歸檔後，系統可自動將報價預算與指派顧問對接，無縫轉為講師之「委任顧問合約」。
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[11px] text-emerald-800 leading-relaxed">
                      🎉 主合約已簽署完成！系統已為指派顧問「{editedProject.assignedConsultantName || '特約顧問'}」自動帶入合議案及輔導款，轉為合約與報價。請在下方確認並調整合約條文資訊，即可生成專業合約。
                    </div>
                  )}

                  {/* Form fields to configure contract */}
                  <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-750 border-b border-slate-200 pb-1.5 text-[11px] flex justify-between items-center">
                      <span>👤 合約雙方及標的資訊</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="partyA-input" className="block text-[10px] font-bold text-slate-500 mb-1">甲方 (委任公司)</label>
                        <input
                          id="partyA-input"
                          type="text"
                          value={editedProject.consultantContract?.partyA || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('partyA', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="repA-input" className="block text-[10px] font-bold text-slate-500 mb-1">甲方代表人</label>
                        <input
                          id="repA-input"
                          type="text"
                          value={editedProject.consultantContract?.representativeA || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('representativeA', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="partyB-input" className="block text-[10px] font-bold text-slate-500 mb-1">乙方講師 (受任人)</label>
                        <input
                          id="partyB-input"
                          type="text"
                          value={editedProject.consultantContract?.partyB || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('partyB', e.target.value)}
                          placeholder="例如: 張婷崴"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="idB-input" className="block text-[10px] font-bold text-slate-500 mb-1">乙方身分證字號</label>
                        <input
                          id="idB-input"
                          type="text"
                          value={editedProject.consultantContract?.idNumberB || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('idNumberB', e.target.value)}
                          placeholder="例如: Q123456789"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="addressB-input" className="block text-[10px] font-bold text-slate-500 mb-1">乙方戶籍住址</label>
                      <input
                        id="addressB-input"
                        type="text"
                        value={editedProject.consultantContract?.addressB || ''}
                        disabled={!canEditPhase('contract')}
                        onChange={(e) => handleContractFieldChange('addressB', e.target.value)}
                        placeholder="請輸入乙方戶籍住址"
                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="partyC-input" className="block text-[10px] font-bold text-slate-500 mb-1">丙方協力客戶</label>
                        <input
                          id="partyC-input"
                          type="text"
                          value={editedProject.consultantContract?.partyC || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('partyC', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="contractProj-input" className="block text-[10px] font-bold text-slate-500 mb-1">委任輔導專案標的</label>
                        <input
                          id="contractProj-input"
                          type="text"
                          value={editedProject.consultantContract?.projectName || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('projectName', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <p className="font-bold text-slate-750 border-b border-slate-200 pt-1 pb-1.5 text-[11px]">🕒 期間與培訓場數</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="startDate-input" className="block text-[10px] font-bold text-slate-500 mb-1">委任期(起)</label>
                        <input
                          id="startDate-input"
                          type="text"
                          value={editedProject.consultantContract?.startDate || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('startDate', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate-input" className="block text-[10px] font-bold text-slate-500 mb-1">委任期(迄)</label>
                        <input
                          id="endDate-input"
                          type="text"
                          value={editedProject.consultantContract?.endDate || ''}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('endDate', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="sessions-input" className="block text-[10px] font-bold text-slate-500 mb-1">培訓講授場次</label>
                        <input
                          id="sessions-input"
                          type="number"
                          value={editedProject.consultantContract?.sessionsCount || 8}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('sessionsCount', Number(e.target.value))}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <p className="font-bold text-slate-750 border-b border-slate-200 pt-1 pb-1.5 text-[11px] flex justify-between items-center">
                      <span>💰 費用及分期付款(自動對接)</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        預估款: ${((editedProject.consultantHours * editedProject.consultantHourlyRate) + (editedProject.consultantExpenses || 0)).toLocaleString()}元
                      </span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="totalAmount-input" className="block text-[10px] font-bold text-slate-500 mb-1">合約總價 (元)</label>
                        <input
                          id="totalAmount-input"
                          type="number"
                          value={editedProject.consultantContract?.totalAmount || 80000}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const half = Math.round(val / 2);
                            const updated = editedProject.consultantContract || createDefaultConsultantContract(editedProject);
                            setEditedProject({
                              ...editedProject,
                              consultantContract: {
                                ...updated,
                                totalAmount: val,
                                stage1Amount: half,
                                stage2Amount: half
                              },
                              updatedAt: new Date().toISOString()
                            });
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="stage1Amount-input" className="block text-[10px] font-bold text-slate-500 mb-1">第一場完成支付</label>
                        <input
                          id="stage1Amount-input"
                          type="number"
                          value={editedProject.consultantContract?.stage1Amount || 40000}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('stage1Amount', Number(e.target.value))}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor="stage2Amount-input" className="block text-[10px] font-bold text-slate-500 mb-1">稿件定稿後支付</label>
                        <input
                          id="stage2Amount-input"
                          type="number"
                          value={editedProject.consultantContract?.stage2Amount || 40000}
                          disabled={!canEditPhase('contract')}
                          onChange={(e) => handleContractFieldChange('stage2Amount', Number(e.target.value))}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signDate-input" className="block text-[10px] font-bold text-slate-500 mb-1">合約簽訂日期 (文末顯示)</label>
                      <input
                        id="signDate-input"
                        type="text"
                        value={editedProject.consultantContract?.signDate || ''}
                        disabled={!canEditPhase('contract')}
                        onChange={(e) => handleContractFieldChange('signDate', e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Generate & Preview trigger */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="view-consultant-contract-trigger-btn"
                      onClick={() => setShowConsultantContractPrint(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow"
                    >
                      <Printer className="w-4 h-4" />
                      生成與預覽委任顧問合約
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 4: 啟動與執行 */}
          {activeTab === 'execute' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Milestones & Installments checklist (Execution side) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Milestones check */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-700 uppercase">🚩 專案執行里程碑 (Milestones)</h4>
                      <span className="text-[10px] text-slate-400">總數: {(editedProject.milestones || []).length} 項</span>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                      {(editedProject.milestones || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">目前未設立任何檢核里程碑項目。</p>
                      ) : (
                        editedProject.milestones.map((m) => (
                          <div key={m.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                id={`toggle-milestone-btn-${m.id}`}
                                disabled={!canEditPhase('execute')}
                                onClick={() => toggleMilestone(m.id)}
                                className="text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                              >
                                {m.status === 'completed' ? (
                                  <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4.5 h-4.5 text-slate-300" />
                                )}
                              </button>
                              <span className={`${m.status === 'completed' ? 'line-through text-slate-400' : 'font-semibold text-slate-750'}`}>
                                {m.title}
                              </span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 font-mono rounded">
                              限 {m.dueDate}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Milestone form */}
                    {canEditPhase('execute') && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                        <div className="md:col-span-7">
                          <input
                            id="new-mile-title"
                            type="text"
                            placeholder="里程碑名稱, 如: 提交期末大報告"
                            value={newMilestoneTitle}
                            onChange={(e) => setNewMilestoneTitle(e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <input
                            id="new-mile-date"
                            type="date"
                            value={newMilestoneDate}
                            onChange={(e) => setNewMilestoneDate(e.target.value)}
                            className="w-full text-[11px] p-1.5 border border-slate-300 rounded focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <button
                            type="button"
                            id="add-milestone-sub-btn"
                            onClick={handleAddMilestone}
                            className="w-full bg-slate-800 text-white font-bold text-xs py-1.5 rounded hover:bg-slate-700 transition"
                          >
                            新增
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Schedules (Installments for billing) */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-700 uppercase">💵 動態付款請款節點與發票開立線</h4>
                      <span className="text-[10px] text-slate-400">
                        應收總數: ${(editedProject.paymentNodes || []).reduce((s, p) => s + p.amount, 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                      {(editedProject.paymentNodes || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">尚未配置合約請款期程與發票狀態。</p>
                      ) : (
                        editedProject.paymentNodes.map((p) => (
                          <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5">
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block text-xs">{p.title}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  付款預計日: {p.billingDate}
                                </span>
                              </div>
                              <span className="font-bold text-slate-800 font-mono text-sm leading-none">
                                ${p.amount.toLocaleString()}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2.5">
                              {p.invoiceNumber && (
                                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                  📄 發票號: {p.invoiceNumber}
                                </span>
                              )}

                              {/* Invoicing status selector - Managed by Finance/PM */}
                              <div className="flex items-center gap-1 ml-auto">
                                <span className="text-[10px] text-slate-400 mr-1">發票暨入帳狀態:</span>
                                
                                {userRole === 'finance' || userRole === 'pm' ? (
                                  <select
                                    id={`nodestatus-select-${p.id}`}
                                    value={p.status}
                                    onChange={(e) => handlePaymentNodeStatusChange(p.id, e.target.value as any)}
                                    className="text-[10px] p-1 font-bold border border-slate-350 rounded bg-slate-50"
                                  >
                                    <option value="draft">📁 待請款草稿</option>
                                    <option value="reminding">⏰ 應收警示 (提醒中)</option>
                                    <option value="invoiced">🧾 已開立發票，待進帳</option>
                                    <option value="paid">✅ 帳款已全額入帳</option>
                                  </select>
                                ) : (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    p.status === 'paid' ? 'bg-emerald-150 text-emerald-800' : p.status === 'invoiced' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {p.status === 'paid' ? '已入帳' : p.status === 'invoiced' ? '發票已開' : p.status === 'reminding' ? '催收提醒' : '待請草稿'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Payment nodes form - only PM or Finance */}
                    {(userRole === 'pm' || userRole === 'finance') && (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs space-y-2">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">批次建立付款期數節點</span>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input
                            id="new-pay-title-input"
                            type="text"
                            placeholder="第 X 期款 (如: 尾款)"
                            value={newPayTitle}
                            onChange={(e) => setNewPayTitle(e.target.value)}
                            className="text-xs p-1.5 border border-slate-300 rounded focus:outline-none placeholder:text-slate-400"
                          />
                          <input
                            id="new-pay-amount-input"
                            type="number"
                            placeholder="款項 NTD"
                            value={newPayAmount || ''}
                            onChange={(e) => setNewPayAmount(Number(e.target.value))}
                            className="text-xs p-1.5 border border-slate-300 rounded focus:outline-none placeholder:text-slate-400"
                          />
                          <input
                            id="new-pay-date-input"
                            type="date"
                            value={newPayDate}
                            onChange={(e) => setNewPayDate(e.target.value)}
                            className="text-[11px] p-1.5 border border-slate-300 rounded focus:outline-none"
                          />
                          <button
                            type="button"
                            id="add-payment-node-btn"
                            onClick={handleAddPaymentNode}
                            className="bg-slate-800 text-white font-bold text-xs py-1.5 rounded hover:bg-slate-700 transition"
                          >
                            配置期
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field records (Consultant side, mobile friendly) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Field action box (Consultant role simulation) */}
                  <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-3.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">顧問師現場輔導紀錄 (行動端優化)</h4>
                        <p className="text-[11px] text-slate-500">專供顧問現場診斷或授課時，直接用手機填寫輔導紀錄、模擬拍照拍攝「簽到表」或「實地課程照片」並即時上傳歸檔。</p>
                      </div>
                    </div>

                    {(userRole === 'consultant' || userRole === 'pm') ? (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-xs">
                        <div>
                          <input
                            id="field-rec-topic"
                            type="text"
                            placeholder="請填入現場指導主題 (例如: HACCP 危害點量測輔導)"
                            value={recordTopic}
                            onChange={(e) => setRecordTopic(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <div>
                          <textarea
                            id="field-rec-content"
                            placeholder="進場輔導實紀、改善建議、與廠區同仁討論決策要點..."
                            value={recordContent}
                            onChange={(e) => setRecordContent(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg min-h-[75px] focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            id="simulate-camera-btn"
                            onClick={() => {
                              setMockPhotoToUpload('mock_session_captured.jpg');
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                              mockPhotoToUpload ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-300'
                            }`}
                          >
                            <Camera className="w-4.5 h-4.5 text-emerald-600" />
                            {mockPhotoToUpload ? '📸 現場照片已模擬拍攝' : '📷 手機開相機模擬現場拍照'}
                          </button>

                          <button
                            type="button"
                            id="add-field-record-btn"
                            onClick={handleAddFieldRecord}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg transition"
                          >
                            送出輔導紀錄
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="bg-white/80 border border-slate-200 p-3 rounded-lg text-slate-500 italic text-[11px] text-center">
                        ※ 您目前不是「顧問師」或「專案負責人」，無權限在此建立現場輔導紀錄。
                      </p>
                    )}
                  </div>

                  {/* Historic session list */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-700 uppercase">📋 已儲存之實地診斷指導歷程書 ({editedProject.fieldRecords?.length || 0} 筆)</h4>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-0.5">
                      {(!editedProject.fieldRecords || editedProject.fieldRecords.length === 0) ? (
                        <p className="text-xs text-slate-400 text-center py-6">尚未上傳任何現場輔導紀錄。顧問師進場後請透過上方區塊建檔。</p>
                      ) : (
                        editedProject.fieldRecords.map((r, i) => (
                          <div key={r.id || i} className="bg-white border border-slate-250 p-3 rounded-xl space-y-3 shadow-xs">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs">{r.topic}</h5>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  輔導老師: {r.mentor} | 日期: {r.date}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">{r.content}</p>

                            {/* Session photos review */}
                            {(r.signInPhoto || r.sessionPhoto) && (
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                {r.signInPhoto && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-slate-400 font-bold block">👤 現場簽到表佐證照片</span>
                                    <img
                                      src={r.signInPhoto}
                                      alt="簽到表佐證"
                                      className="rounded-lg object-cover h-24 w-full border border-slate-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                                {r.sessionPhoto && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-slate-400 font-bold block">🎓 顧問輔導實地課程照</span>
                                    <img
                                      src={r.sessionPhoto}
                                      alt="現場授課佐證"
                                      className="rounded-lg object-cover h-24 w-full border border-slate-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Government extra field: Midterm report */}
                  {editedProject.isLargeOrGov && (
                    <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-xl text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">🏛️ 【政府補助案專屬】期中報告提交查核</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          editedProject.midtermReportStatus === 'submitted' ? 'bg-emerald-150 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {editedProject.midtermReportStatus === 'submitted' ? '已審核上傳' : '待提交評估'}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        依補助款程規，執行階段中需提交 SBIR/政府核定之期中推進報告。
                      </p>

                      {userRole === 'pm' || userRole === 'consultant' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id="midterm-status-submit-btn"
                            onClick={() => handleFieldChange('midtermReportStatus', 'submitted')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white px-2.5 py-1 text-xs rounded font-bold transition flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            模擬上傳「期中推進成果報告書」
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 5: 結案與核銷 */}
          {activeTab === 'close' && (
            <div className="space-y-6">
              
              {/* Payment Reconciliation Desk (款項進帳驗收 & 成本核對) */}
              {(() => {
                const totalIncome = editedProject.finalQuoteAmount || 160425;
                const totalIncomeExTax = Math.round(totalIncome / 1.05);
                
                const paidNodes = (editedProject.paymentNodes || []).filter(n => n.status === 'paid');
                const totalPaid = paidNodes.reduce((sum, n) => sum + n.amount, 0);
                const isFullyPaid = totalPaid >= totalIncome;
                
                const costData = editedProject.detailedCostAnalysis || createDefaultDetailedCostAnalysis(totalIncome);
                const auditLoss = Math.round((costData.auditFeeTaxIncluded / 1.05) * (costData.taxRateSelection === '21%' ? 0.042 : 0.032));
                
                const totalActualExpense = auditLoss + (Object.values(costData.rows) as any[]).reduce((sum, r) => sum + (r.actualExpense || 0), 0);
                const totalEstimateExpense = auditLoss + (Object.values(costData.rows) as any[]).reduce((sum, r) => sum + (r.estimatedExpense || 0), 0);
                
                const actualNetEarning = totalPaid - totalActualExpense;
                const actualProfitPct = totalIncomeExTax > 0 ? (actualNetEarning / totalIncomeExTax) * 100 : 0;
                const isProfitReasonable = actualProfitPct >= 20;

                const overtimeExpensesCount = (Object.values(costData.rows) as any[]).filter(r => {
                  const refAmt = Math.round(totalIncomeExTax * (r.refPercentage / 100));
                  return r.actualExpense > refAmt;
                }).length;

                return (
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-[#FBBF24] text-sm flex items-center gap-1.5">
                          <Award className="w-4.5 h-4.5 text-[#FBBF24] shrink-0" />
                          財務進帳驗收與成本分析核對大廳 (Payment Reconciliation Block)
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          核對所有動態付款期數、發票入帳款與實地管銷支出，把關專案財務驗收之安全指標。
                        </p>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] border shrink-0 ${
                        isFullyPaid && isProfitReasonable
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                      }`}>
                        {isFullyPaid && isProfitReasonable ? '🏆 全案財務驗收合格' : '⏳ 財務審查不合規 / 待補帳'}
                      </span>
                    </div>

                    {/* Bento reconciliation metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-300">
                      
                      {/* Box 1: Income */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 block font-semibold">應收合約款(含稅)</span>
                        <div className="font-mono text-base font-extrabold text-slate-100">${totalIncome.toLocaleString()}</div>
                        <span className="text-[9px] text-slate-500 block">未稅: ${totalIncomeExTax.toLocaleString()}</span>
                      </div>

                      {/* Box 2: Paid */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 block">
                        <span className="text-[10px] text-slate-500 block font-semibold">進帳驗收額 (已收)</span>
                        <span className={`font-mono text-base font-extrabold block ${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ${totalPaid.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          付款期數已結清: {paidNodes.length} / {(editedProject.paymentNodes || []).length}
                        </span>
                      </div>

                      {/* Box 3: Expenses */}
                      <div className="bg-slate-955 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 block font-semibold">實際管銷支出總額</span>
                        <div className="font-mono text-base font-extrabold text-[#FBBF24]">${totalActualExpense.toLocaleString()}</div>
                        <span className="text-[9px] text-slate-500 block">
                          預估總支出: ${totalEstimateExpense.toLocaleString()}
                        </span>
                      </div>

                      {/* Box 4: Balance Margin */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 block font-semibold">全案實存淨利</span>
                        <div className={`font-mono text-base font-extrabold ${actualNetEarning >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{actualNetEarning >= 0 ? '+' : ''}${actualNetEarning.toLocaleString()}</div>
                        <span className={`text-[9px] font-bold block ${isProfitReasonable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          實際獲利率: {actualProfitPct.toFixed(2)}% (目標 20%)
                        </span>
                      </div>

                    </div>

                    {/* Status reconciliation explanations */}
                    <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed text-[11px]">
                      <div className="space-y-1.5 font-sans">
                        <span className="text-[10px] uppercase block font-bold text-slate-400">🚨 入帳對比檢核</span>
                        {isFullyPaid ? (
                          <div className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>款項核算無誤：買方已全部入帳。</span>
                          </div>
                        ) : (
                          <div className="text-amber-400 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>款項滯留異常：買方尚未付足尾款。尚有 ${(totalIncome - totalPaid).toLocaleString()} 未進帳！</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-500">
                          ※ 此數值與「啟動與執行」階段之「動態付款請款節點與發票開立線」同步，期數狀態更新為「帳款已全額入帳」時，將即時計入此驗收額中。
                        </p>
                      </div>

                      <div className="space-y-1.5 font-sans md:border-l border-slate-800 md:pl-3">
                        <span className="text-[10px] uppercase block font-bold text-slate-400">📈 成本與盈虧核對</span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">實際獲利指標對比:</span>
                            <span className={`font-mono font-bold ${isProfitReasonable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {actualProfitPct.toFixed(2)}% (合理 ≥20%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">自填實際超支項目數:</span>
                            <span className={`font-mono font-bold ${overtimeExpensesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {overtimeExpensesCount} 項
                            </span>
                          </div>
                        </div>
                        {isProfitReasonable ? (
                          <span className="text-emerald-400 text-[10px] font-bold block">✓ 利潤達標：實際利潤率符合中心規定 ≥ 20% 防火牆水準。</span>
                        ) : (
                          <span className="text-rose-400 text-[10px] font-bold block">✗ 利潤偏低：已爆發超支警報，請承辦專案負責人填寫下方超支說明歸檔！</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <DetailedCostAnalysis
                project={editedProject}
                onChange={(costAnalysis) => {
                  const adminActSum = costAnalysis.rows.adminFee.actualExpense + costAnalysis.rows.incomeTax.actualExpense;
                  const consultantActSum = costAnalysis.rows.consultantFee.actualExpense + costAnalysis.rows.paidConsultantFee.actualExpense;
                  const trafficActSum = costAnalysis.rows.trafficFee.actualExpense + costAnalysis.rows.oilFee.actualExpense + costAnalysis.rows.parkingFee.actualExpense + costAnalysis.rows.lodgingFee.actualExpense + costAnalysis.rows.mealFee.actualExpense;
                  const otherActSum = costAnalysis.rows.printingFee.actualExpense + costAnalysis.rows.otherFee.actualExpense;

                  setEditedProject({
                    ...editedProject,
                    detailedCostAnalysis: costAnalysis,
                    costAnalysisItems: [
                      { name: '行政及稅務分攤 (含稽核、所得稅)', unitCost: adminActSum, quantity: 1, category: 'admin' },
                      { name: '現場授課及特聘諮詢顧問講師費', unitCost: consultantActSum, quantity: 1, category: 'consulting' },
                      { name: '現場交通、差旅與油資實報實銷額', unitCost: trafficActSum, quantity: 1, category: 'traffic' },
                      { name: '印製郵資及其他行管管銷雜支', unitCost: otherActSum, quantity: 1, category: 'other' }
                    ],
                    updatedAt: new Date().toISOString()
                  });
                }}
                readOnly={!canEditPhase('close')}
                phase="close"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <h3 className="font-bold text-sm text-slate-800 border-l-3 border-rose-500 pl-2">
                    財務行政暨結案自我檢核表 (Checklist)
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      在專案最終辦理核銷前，專案負責人、顧問及財務必須逐項審核下述項目是否全數就緒。
                    </p>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-205 cursor-pointer text-xs">
                        <input
                          id="chk-service-delivered"
                          type="checkbox"
                          disabled={!canEditPhase('close')}
                          checked={editedProject.closingChecks?.serviceDelivered || false}
                          onChange={(e) => {
                            const checks = { ...editedProject.closingChecks, serviceDelivered: e.target.checked };
                            handleFieldChange('closingChecks', checks);
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-slate-750 block">1. 輔導及授課服務悉數履行完畢</span>
                          <span className="text-[10px] text-slate-400 block">顧問已依合約人天前往輔導，無漏堂且佐證照建全。</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-205 cursor-pointer text-xs">
                        <input
                          id="chk-invoices-issued"
                          type="checkbox"
                          disabled={!canEditPhase('close')}
                          checked={editedProject.closingChecks?.allInvoicesIssued || false}
                          onChange={(e) => {
                            const checks = { ...editedProject.closingChecks, allInvoicesIssued: e.target.checked };
                            handleFieldChange('closingChecks', checks);
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-slate-755 block">2. 財務發票悉數開具無缺漏</span>
                          <span className="text-[10px] text-slate-400 block">各款項對應之統一發票開立狀態皆有登載關聯。</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-205 cursor-pointer text-xs">
                        <input
                          id="chk-report-approved"
                          type="checkbox"
                          disabled={!canEditPhase('close')}
                          checked={editedProject.closingChecks?.finalReportApproved || false}
                          onChange={(e) => {
                            const checks = { ...editedProject.closingChecks, finalReportApproved: e.target.checked };
                            handleFieldChange('closingChecks', checks);
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-slate-755 block">3. 終端結案大報告編寫通過</span>
                          <span className="text-[10px] text-slate-400 block">客戶已簽具結案同意書，技術報告已達核准。</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-205 cursor-pointer text-xs">
                        <input
                          id="chk-payments-received"
                          type="checkbox"
                          disabled={!canEditPhase('close')}
                          checked={editedProject.closingChecks?.allPaymentsReceived || false}
                          onChange={(e) => {
                            const checks = { ...editedProject.closingChecks, allPaymentsReceived: e.target.checked };
                            handleFieldChange('closingChecks', checks);
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-slate-755 block">4. 【財務關卡】全案合約款項實全數入帳 (核憑)</span>
                          <span className="text-[10px] text-slate-400 block">財務同仁確認所有期數尾款已在銀行端入帳。</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* End deliverables audit report */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-800 border-l-3 border-rose-500 pl-2">
                    最終結案產出證明資料庫
                  </h3>
                  <p className="text-slate-505 leading-relaxed">
                    專案負責人或財務必須於本階段上傳【最終發票檔】、【結案大報告】、以及【單據憑證核銷明細】以便中心審計結案。
                  </p>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-650">A. 最終統一發票開立影本 (PDF/影像)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${editedProject.phase5UploadedFiles.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {editedProject.phase5UploadedFiles.length > 0 ? '已入帳核銷' : '待補憑證'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-650">B. 終審核備【本專案之結案報告書】</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${editedProject.phase5UploadedFiles.length > 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {editedProject.phase5UploadedFiles.length > 1 ? '已入帳核銷' : '待補憑證'}
                      </span>
                    </div>

                    {editedProject.phase5UploadedFiles.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded-lg space-y-1 font-mono text-[10px] text-slate-500">
                        {editedProject.phase5UploadedFiles.map((fn, idx) => (
                          <div key={idx}>📎 {fn}</div>
                        ))}
                      </div>
                    )}

                    {canEditPhase('close') && (
                      <button
                        type="button"
                        id="upload-phase5-mock-btn"
                        onClick={() => {
                          const checks = {
                            serviceDelivered: true,
                            allInvoicesIssued: true,
                            allPaymentsReceived: true,
                            finalReportApproved: true,
                          };
                          setEditedProject({
                            ...editedProject,
                            closingChecks: checks,
                            finalInvoicedAmount: editedProject.finalQuoteAmount || editedProject.basicQuoteAmount,
                            phase5UploadedFiles: [
                              '[核銷憑單] 最終期末發票開立.pdf',
                              '[成果歸檔] 全案總和結案簡報大綱.pdf',
                              '[費用明細] 差旅與講師憑證全數整理.zip'
                            ],
                            updatedAt: new Date().toISOString()
                          });
                        }}
                        className="w-full mt-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        一鍵模擬上傳結案檢核憑證
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <FileManagementTab
              project={editedProject}
              onUpdateProject={setEditedProject}
              userRole={userRole}
              canEditPhase={canEditPhase}
            />
          )}
        </div>

        {/* Footer actions: Save / Close / Transition */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            最近存取：{new Date(editedProject.updatedAt).toLocaleString('zh-TW')}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === editedProject.currentPhase && canEditPhase(editedProject.currentPhase) && activeDeliverableDone && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-lg mr-2 font-medium">
                <CheckCircle className="w-4 h-4" />
                本階段應備文件已齊全
              </div>
            )}

            <button
              type="button"
              id="cancel-modal-btn"
              onClick={onClose}
              className="flex-1 sm:flex-none border border-slate-300 hover:bg-slate-50 text-slate-705 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              取消
            </button>
            
            <button
              type="button"
              id="save-modal-btn"
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              儲存並更新資料
            </button>
          </div>
        </div>

      </div>

      {/* Printable official quotation canvas */}
      {showQuotePrint && (
        <div className="fixed inset-0 bg-slate-900/85 z-99 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between max-h-[95vh] overflow-y-auto">
            
            {/* Quote design layout */}
            <div className="space-y-6 print-section" id="quote-printable-canvas">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded leading-none">
                    財團法人智慧專案推廣中心
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 font-sans tracking-tight">
                    專 案 服 務 報 價 單
                  </h1>
                  <span className="text-slate-400 text-xs block font-mono">QUOTATION DOCUMENT</span>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
                  <p>報價單號：QTN-{editedProject.id?.replace('PRJ-', '')}</p>
                  <p>報價日期：{new Date().toLocaleDateString('zh-TW')}</p>
                  <p>有效期限：30 天內</p>
                </div>
              </div>

              {/* Clients & Our organization block */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-205 rounded-xl">
                <div className="space-y-1 md:border-r border-slate-200 md:pr-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400">買方客戶 (甲方)</span>
                  <p className="font-extrabold text-slate-800 text-sm">{editedProject.clientName}</p>
                  <p className="text-slate-600">窗口窗口：{editedProject.contactPerson}</p>
                  <p className="text-slate-600">聯絡電話：{editedProject.contactPhone}</p>
                </div>
                <div className="space-y-1 md:pl-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">服務提供方 (乙方)</span>
                  <p className="font-extrabold text-slate-800 text-sm">財團法人智慧專案管理顧問推廣中心</p>
                  <p className="text-slate-600">公司地址：台北市信義區市民大道四段 100 號 6 樓</p>
                  <p className="text-slate-600">承辦電話：02-9900-8822</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-xs text-slate-400 uppercase">報價估算項目明細</h3>
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-4">服務項目細節</th>
                        <th className="py-2.5 px-4 text-right">費用單價</th>
                        <th className="py-2.5 px-4 text-center">估算數量</th>
                        <th className="py-2.5 px-4 text-right">項目全價</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {editedProject.costAnalysisItems?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 px-4 text-center text-slate-400 italic">
                            (此專案尚未設定任何成本細項，預設依專案經費報價核算)
                          </td>
                        </tr>
                      ) : (
                        editedProject.costAnalysisItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-800">{item.name}</td>
                            <td className="py-2.5 px-4 text-right text-slate-600">${item.unitCost.toLocaleString()}元</td>
                            <td className="py-2.5 px-4 text-center text-slate-600 font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right font-black text-slate-800">
                              ${(item.unitCost * item.quantity).toLocaleString()}元
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Quotes and terms */}
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 border-t border-slate-200 pt-4">
                <div className="text-[10px] text-slate-400 leading-relaxed max-w-sm space-y-1">
                  <p className="font-bold text-slate-600">報價合作要款聲明：</p>
                  <p>1. 本報價單所列顧問費用時薪不含法定二代健保補充之印花稅等，相關交通食宿依實核銷。</p>
                  <p>2. 合約雙方正式合意用印後，需於進場前由買方先支付 30% 首期動工款。</p>
                </div>

                <div className="bg-slate-900 text-white px-5 py-4 rounded-xl text-right min-w-[220px] shrink-0 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-300 block">報價總計 (新台幣)</span>
                  <h2 className="text-xl font-black font-mono">
                    NTD$ {editedProject.finalQuoteAmount?.toLocaleString()} 元整
                  </h2>
                  <p className="text-[9px] text-slate-300 block italic">包含全部加值營業稅 5%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-400 pt-6 border-t border-dashed border-slate-200">
                <div className="py-8 border border-slate-200 border-dashed rounded-lg">
                  <p>甲方代表 (代表人簽章)</p>
                  <div className="h-10"></div>
                </div>
                <div className="py-8 border border-slate-200 border-dashed rounded-lg relative">
                  <p>乙方代表 (智慧中心公章)</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="absolute -bottom-1 -right-1 border-4 border-rose-600 text-rose-600 font-black rounded-full p-2 uppercase rotate-12 text-[9px] scale-80 bg-white shadow-md select-none">
                      財團法人智慧專案<br/>推廣中心用印
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions for printing */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                id="close-print-btn"
                onClick={() => setShowQuotePrint(false)}
                className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                關閉窗口
              </button>

              <button
                type="button"
                id="trigger-print-btn"
                onClick={() => {
                  window.print();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                列印此官方報價單
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Printable official lecturer/consultant agreement canvas */}
      {showConsultantContractPrint && (
        <div className="fixed inset-0 bg-slate-900/85 z-99 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between max-h-[95vh] overflow-y-auto">
            
            {/* Agreement design layout */}
            <div className="space-y-6 print-section text-slate-800 font-sans" id="consultant-contract-printable-canvas">
              <div className="text-center border-b-2 border-slate-900 pb-5">
                <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2.5 py-1 rounded leading-none block w-fit mx-auto mb-2">
                  群恆新世代企業有限公司 • 特約合約書
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  特 約 委 任 顧 問 合 約 書
                </h1>
                <span className="text-slate-400 text-xs block font-mono mt-1">COMMISSIONED ADVISORY SERVICES AGREEMENT</span>
              </div>

              {/* Preamble */}
              <div className="text-xs leading-relaxed text-slate-700 font-medium">
                茲因 <span className="font-extrabold text-slate-900 underline underline-offset-3">{editedProject.consultantContract?.partyA || '群恆新世代企業有限公司'}</span>（以下簡稱甲方），聘請 <span className="font-extrabold text-slate-900 underline underline-offset-3">{editedProject.consultantContract?.partyB || '張婷崴'}</span>（以下簡稱乙方）委任甲方之客戶 <span className="font-extrabold text-slate-900 underline underline-offset-3">{editedProject.consultantContract?.partyC || '資拓宏宇國際股份有限公司'}</span>（以下稱丙方）之 <span className="font-extrabold text-slate-900 underline underline-offset-3">{editedProject.consultantContract?.projectName || 'ESG永續報告輔導專案'}</span>（以下簡稱專案），經甲乙雙方誠信協議，共同訂立本合約其條款如下：
              </div>

              {/* Terms Content */}
              <div className="text-xs space-y-4 leading-relaxed text-slate-700">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第一條 委任期間與內容</h4>
                  <p className="pl-4">
                    1、本合約自民國 <span className="font-bold text-slate-900">{editedProject.consultantContract?.startDate || '114年12月1日'}</span> 起，至民國 <span className="font-bold text-slate-900">{editedProject.consultantContract?.endDate || '115年8月31日'}</span> 止，期滿本合約當然終止。
                  </p>
                  <p className="pl-4">
                    2、除本合約另有約定外，甲方同意於本合約有效期間屆至前1個月，明確對乙方表示是否繼續聘任丙方之專案。
                  </p>
                  <p className="pl-4">
                    3、乙方於本合約有效期間內，同意在專案範圍（以下稱合約範圍），就丙方不定時所提出之具體問題，提供下述服務內容：
                  </p>
                  <div className="pl-8 space-y-1">
                    <p>(a) 乙、丙雙方約定合約範圍之專業輔導與技術建議。</p>
                    <p>(b) 乙、丙雙方合議交付之ESG永續報告文件，並提交ESG文稿報告，經由甲方審核通過，作為各階段費用給付之驗收必備條件。</p>
                    <p>(c) 乙方提供合約範圍內，至丙方指定之場地辦理 <span className="font-bold text-slate-900 underline decoration-indigo-500">{editedProject.consultantContract?.sessionsCount || 8} 場次</span> 教育訓練與診斷會議。</p>
                  </div>
                  <p className="pl-4">
                    4、乙方於本合約有效期間內，同意輔導丙方產出之合約範圍文件交由甲方留存，如涉屬丙方特別機密文件，甲、乙雙方均不予留存，並告知丙方參與刪除相關暫存副本。
                  </p>
                  <p className="pl-4">
                    5、乙方於本合約有效期間內，同意與甲方另行簽訂專屬補充協議，就特定具體之事項提供書面報告，其協議內容包括但不限於補充費用、特定期間、額外產出項目等。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第二條 費用支付與核銷流程</h4>
                  <p className="pl-4">
                    本委任合約範圍，總價金核計為新台幣 <span className="font-black text-slate-900 underline decoration-indigo-500 underline-offset-2">NTD$ {(editedProject.consultantContract?.totalAmount || 80000).toLocaleString()} 元整</span>。甲方依據第一條第三項(a)、(b)款之交付進度依下列期程分期撥付。此項總費用已內含乙方之交通、住宿、餐飲及相關雜支費用，並應提供相應的交通或支出票據於專案驗收請款時一併交付甲方存查。
                  </p>
                  <div className="pl-6 space-y-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-mono text-[11px] text-slate-650">
                    <p className="flex justify-between">
                      <span className="font-bold">1、第一期款 (講授與啟動)：</span>
                      <span>
                        乙方進行第一場教育訓練完成，經甲方確認後，於次月10日支付新台幣 <span className="font-bold text-slate-950">NTD$ {(editedProject.consultantContract?.stage1Amount || 40000).toLocaleString()} 元</span>
                      </span>
                    </p>
                    <p className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                      <span className="font-bold">2、第二期尾款 (報告定稿驗收)：</span>
                      <span>
                        乙方提交丙方ESG報告書定稿文稿，並經甲方審核驗收通過後，於次月10日支付新台幣 <span className="font-bold text-slate-950">NTD$ {(editedProject.consultantContract?.stage2Amount || 40000).toLocaleString()} 元</span>
                      </span>
                    </p>
                  </div>
                  <p className="pl-4">
                    3、前段價金乙方得視專案實際執行難易度，與甲方友好協議調整，惟任何修正均需雙方簽署書面協議或約定書始生效力。
                  </p>
                  <p className="pl-4">
                    4、乙方申請各期款項時，應提交每堂課之「輔導診斷紀錄表」或相應簽到佐證作為撥款之會計請款憑證依據。
                  </p>
                  <p className="pl-4">
                    5、乙方如因丙方現場臨時之要求而同意其他代墊或額外支出，均由甲方支應，惟單筆費用超出 300 元以上時，乙方至遲應於支出前 10 日先以書面（或線上通訊）徵得甲方授權同意，且此項額外墊款之全案累計總額上限不得超過 3,000 元。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第三條 所有權歸屬說明</h4>
                  <p className="pl-4">
                    1、甲方於本合約有效期間內對乙方所作之實物形式提供或專案補助（如因辦理本輔導經費所購置之輔料、用品、常規設備等），除雙方另有約定外，實物所有權歸屬於乙方持有。
                  </p>
                  <p className="pl-4">
                    2、乙方於本合約有效期間所編寫並交付予甲方之專業諮詢服務成果、建議書、研究成果報告、輔導佐證佐證資料等相類書面及電子文件，其所有權及最終使用權均歸屬於甲方所有。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第四條 智慧財產權與專利歸屬</h4>
                  <p className="pl-4">
                    1、甲乙雙方明瞭於本合約執行期間，甲方所為之創作、發明或發現，無論乙方是否曾口頭輔導、或是否曾參考乙方提供之分析成果，其智慧財產權（包括但不限於專利、著作權、營業秘密等）皆歸甲方單獨所有。
                  </p>
                  <p className="pl-4">
                    2、甲乙雙方特此同意於本合約期間內共同涉入所為之創作、發明或成果，如非屬本專案合約本身之標的，其智財權由雙方共同擁有，雙方相互授權對方有償或無償使用，其細節條款由雙方本誠信原則另行書面議定之。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第五條 資訊安全與合理使用</h4>
                  <p className="pl-4">
                    1、乙方對於針對丙方輔導所產出之各項分析與輔導細節，未經甲方書面同意前均負有保密義務，不得任意向無關之第三方揭露。
                  </p>
                  <p className="pl-4">
                    2、乙方於本合約有效期間，與丙方共同進行研究所得之數據，除合約另有特別排他條款外，乙方仍保有學術上發表、研究、宣傳與使用之基本權利，惟乙方於行使前述發表時，應確保不洩漏丙方機密內部數據。
                  </p>
                  <p className="pl-4">
                    3、雙方均同意，丙方所提供且未明確標示為「機密（Confidential）」之外顯數據、報告與公開合規資料，得予以合理公開引用。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第六條 嚴格保密承諾</h4>
                  <p className="pl-4">
                    1、乙方特此承諾，於本專案執行過程中，因職務知悉或獲取之有關丙方之核心營業秘密（如編制人數、特有技術製程、採購配方、食品產線作業書、新產品規劃等），應盡善良管理人之注意義務，除本專案目的外絕不對外透露。
                  </p>
                  <p className="pl-4">
                    2、如有下列情形之一者，乙方不負保密責任：(a) 丙方原已對外公開之資料、(b) 乙方於本專案前已合法持有且有書面佐證者、(c) 乙方自第三方合法渠道得知者、(d) 乙方未採用甲方或丙方資訊而獨立開發之成果、(e) 法院依職權或法令命令揭露者。
                  </p>
                  <p className="pl-4">
                    3、本合約所訂立之營業保密條款，不因本合約終止、期滿、解除而失效，於合約終止後仍應持續履行。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第七條 獨立承攬聲明與責任擔保</h4>
                  <p className="pl-4">
                    1、乙方明確知悉，本合約為獨立之特約顧問承攬暨委任關係，乙方並非甲方之正式編制員工，故不適用甲方編制內之勞健保福利、退休金提發、紅利分紅政策。
                  </p>
                  <p className="pl-4">
                    2、甲方擔保乙方只要嚴格依約執行丙方之專案範圍輔導，乙方免受因執行職務所產生之傷害請求。但如屬乙方因其故意或重大過失致肇生法律損害者，乙方應自負法律全部責任。
                  </p>
                  <p className="pl-4">
                    3、如不幸遭遇外部訴訟、求償或仲裁爭議時，甲乙雙方有義務提供相互必要之證詞及舉證防禦。
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[13px]">第八條至十一條 終止、爭議管轄與附則</h4>
                  <p className="pl-4">
                    1、雙方得經合理書面協議随时終止合約，其已產生之合理履約成本由雙方依誠信原則協調處理。任何一方提前無故單方終止，應於 60 天前書面通知對方。
                  </p>
                  <p className="pl-4">
                    2、甲、乙雙方約定若有一方惡意違約或不履行合約基本義務時，違約方應酌情賠償他方懲罰性違約金新台幣 5,000 元至 30,000 元整。
                  </p>
                  <p className="pl-4">
                    3、本合約衍生之合約糾紛，雙方合意以 <span className="font-bold text-slate-900">臺灣高雄地方法院</span> 為第一審管轄法院，並以中華民國法律命令為準據法。
                  </p>
                  <p className="pl-4">
                    4、本合約一式兩份，由甲乙雙方簽約主體各執一份為憑。
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-300 text-xs">
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-extrabold text-slate-900 text-[13px]">【甲方代表】</p>
                  <p className="text-slate-700">公司名稱：{editedProject.consultantContract?.partyA || '群恆新世代企業有限公司'}</p>
                  <p className="text-slate-700">代表人：{editedProject.consultantContract?.representativeA || '郭漢章'}</p>
                  <p className="text-slate-700 leading-relaxed">地址：{editedProject.consultantContract?.addressA || '高雄市左營區文瑞路27號4樓'}</p>
                  <div className="h-10"></div>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <p className="font-extrabold text-slate-900 text-[13px]">【乙方代表】</p>
                  <p className="text-slate-700">特約顧問姓名：<span className="font-bold underline">{editedProject.consultantContract?.partyB || '張婷崴'}</span></p>
                  <p className="text-slate-700 font-mono">身分證字號：{editedProject.consultantContract?.idNumberB || '_____________________'}</p>
                  <p className="text-slate-700 leading-relaxed">戶籍地址：{editedProject.consultantContract?.addressB || '_________________________________________'}</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="absolute bottom-2 right-2 border border-dashed border-slate-300 rounded-full w-20 h-20 flex items-center justify-center text-[10px] text-slate-400 select-none">
                      (乙方簽章處)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs font-mono font-bold text-slate-800 pt-4 border-t border-dashed border-slate-200">
                契 約 簽 署 日： {editedProject.consultantContract?.signDate || '中華民國 115 年 1 月 13 日'}
              </div>

            </div>

            {/* Actions for printing and copy */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              
              {/* Copy plain contract text */}
              <button
                type="button"
                id="copy-contract-text-btn"
                onClick={() => {
                  const text = `特 約 委 任 顧 問 合 約 書
                  
茲因 ${editedProject.consultantContract?.partyA || '群恆新世代企業有限公司'}（以下簡稱甲方），聘請 ${editedProject.consultantContract?.partyB || '張婷崴'}（以下簡稱乙方）委任甲方之客戶 ${editedProject.consultantContract?.partyC || '資拓宏宇國際股份有限公司'}（以下稱丙方）之 ${editedProject.consultantContract?.projectName || 'ESG永續報告輔導專案'}（以下簡稱專案），雙方協議如下：

第一條	委任期間
1、本合約自民國 ${editedProject.consultantContract?.startDate || '114年12月1日'} 起，至民國 ${editedProject.consultantContract?.endDate || '115年8月31日'}，期滿本合約當然終止。
2、除本合約另有約定外，甲方同意於本合約有效期間屆至前1個月，明確對乙方表示是否繼續聘任丙方之專案。
3、乙方於本合約有效期間內，同意在專案範圍（以下稱合約範圍），就丙方不定時所提出之具體問題，提供：
(a) 乙、丙雙方約定合約範圍之輔導與建議。
(b) 乙、丙雙方合議交付之ESG永續報告文件，並提交ESG文稿報告，由甲方審核通過，作為費用給付驗收條件。
(c) 乙方提供合約範圍內，至丙方提供之場地辦理 ${editedProject.consultantContract?.sessionsCount || 8} 場次教育訓練。
4、乙方於本合約有效期間內，同意輔導丙方產出之合約範圍之文件交由甲方留存，如涉屬丙方機密文件，甲、乙雙方均不予留存，並告知丙方參與刪除。
5、乙方於本合約有效期間內，同意與甲方另行簽訂協議，就特定具體之事項提供書面報告，其協議內容包括但不限費用、期間、內容等。

第二條	費用支付
本合約範圍，總價金為新台幣 ${(editedProject.consultantContract?.totalAmount || 80000).toLocaleString()} 元整，甲方依據第一條第三項(a)、(b)款支付款項。此費用已包括交通、住宿、餐飲之相關費用，並提供相應的交通票據於專案驗收時一併交由甲方。
1、乙方於本委任期間，進行第一場教育訓練，並經甲方確認後於次月10日支付新台幣 ${(editedProject.consultantContract?.stage1Amount || 40000).toLocaleString()} 元整。
2、乙方於本委任期間，提交丙方ESG報告書文稿(定稿)，並經甲方確認後於次月10日支付新台幣 ${(editedProject.consultantContract?.stage2Amount || 40000).toLocaleString()} 元整。
3、前項乙方可斟酌案件之困難度，與甲方協議調整價金，惟需雙方書面協議之。
4、乙方應提交每堂課之輔導紀錄表作為請款依據。
5、乙方如因丙方之要求且同意其他之支出，均由甲方支應，惟單筆費用超出300元以上，乙方至遲應於支付之前10日，先以書面徵得甲方同意，且本項之支出總額不得超過3,000元。

第三條	所有權歸屬
1、甲方於本合約有效期間對乙方所為實物形式之提供或贊助，以乙方因甲方提供經費所購買之用品、設備，除雙方另有約定外，其所有權歸屬於乙方。
2、乙方於本合約有效期間所提供予甲方之諮詢服務與建議、研究與分析、佐證資料等相類書面文件或物品，其所有權均歸屬於甲方。

第四條	智慧財產權之歸屬
1、甲、乙雙方均明瞭於本合約有效期間內，甲方所為之創作、發明或發現，無論乙方是否曾經提供諮詢或建議、或是否曾經參考乙方所提供之研究報告等相類文件，其智慧財產權（包括但不限於著作權、專利等）均屬甲方所有。
2、甲、乙雙方同意於本合約有效期間內，共同所為之創作、發明或發現，非本專案之智慧財產權（包括但不限於著作權、專利等）為雙方所共有，並授權他方有償或無償使用。並由甲、乙雙方議定之。

第五條	資訊使用權
1、乙方對提供予丙方之諮詢服務與建議內容，未經甲方書面同意前，應予保密，不得洩漏於第三方。
2、乙方於本合約有效期間內，與丙方另行協議，就特定事項所進行之數據、分析，除雙方於協議中另有特別約定外，乙方就該分析所得之任何報告、數據或資料，有著作、出版、揭露、宣傳與使用等權利，惟不得洩露丙方之機密文件或以非善良管理人行為揭露丙方機密文件。
3、甲、乙雙方同意得揭露丙方所給予未經書面標示為「機密」之 報告、數據或資料。

第六條	保密義務
1、乙方同意在本合約執行過程中，獲知有關丙方之營業袐密之資訊、如編制人數、料理製作配方、原料來源、製程、食品相關之作業指導書及新產品研究或計畫等，負有保密義務，如於合約範圍外知悉，未經甲、丙方書面同意，不得以任何形式洩漏或公開予其他第三者或利用為不利於甲、丙方之行為。
2、下列情形，乙方不負保密義務：
(a) 丙方已公開之文件或資料。
(b) 乙方已擁有之文件或資料，且有書面紀錄證明。
(c) 乙方以合法方法從不負保密義務之第三人處得知。
(d) 乙方非以甲方提供之保密義務為基礎，而獨立發展之文件或資料者。
(e) 基於法律之規定，由法院或政府命令而揭露者。
3、乙方承諾彼此所約定之保密義務，於本合約終止後，仍應繼續遵守。

第七條	責任擔保
1、乙方明白本契約為獨立之委任契約，乙方非甲方公司之職員，不能以甲方職員名義參與甲方公司任何利益與福利計畫，或取得任何利益或權利，包括但不限於甲方公司之員工保險或退休金、儲蓄等政策。
2、甲方擔保乙方不因從事丙方之合約範圍內之活動，而受到任何傷害、損失、支出費用(包括律師費)或遭受索賠。但如係因乙方個人之故意或重大過失之行為所造成者，則甲方無須負責。
3、甲、乙雙方同意於因肇生事件遭受索賠、提付仲裁或起訴時，應盡相互協助舉證免責或防禦。

第八條	終止
1、甲、乙雙方同意本合約得隨時因一方之請求而終止，但應終止所端生之成本，由甲、乙雙方協商之。
2、合約之終止得由甲、乙雙方以書面60天前通知。

第九條	違約責任
甲、乙雙方同意，一方有違反本合約之履約義務時，除另有約定外，應按情節輕重賠償他方違約金新台幣5,000元至3萬元整。

第十條	爭議解決
1、甲、乙雙方同意以臺灣高雄地方法院為第一審管轄法院。
2、甲、乙雙方同意以中華民國法律、命令、法院判例為本合約相關法律行為之準據。
3、甲、乙雙方同意本合約所生之爭議，應先由雙方先依誠信原則協商處理、解決。

第十一條	附則
1、本合約所有附件均屬合約之一部份，與本合約具同等效力。
2、本經甲、乙雙方同意，逕就本合約內容增、減、塗改或變更，均為無效。
3、本合約一式兩份由甲、乙雙方當事人各執壹份。

立合約書人：
甲方：${editedProject.consultantContract?.partyA || '群恆新世代企業有限公司'}
代表人：${editedProject.consultantContract?.representativeA || '郭漢章'}
地址：${editedProject.consultantContract?.addressA || '高雄市左營區文瑞路27號4樓'}

乙方：${editedProject.consultantContract?.partyB || '張婷崴'}
身分證字號：${editedProject.consultantContract?.idNumberB || '________________'}
地址：${editedProject.consultantContract?.addressB || '________________'}

契 約 簽 署 日：${editedProject.consultantContract?.signDate || '中華民國 115 年 1 月 13 日'}
`;
                  navigator.clipboard.writeText(text).then(() => {
                    setCopiedContractText(true);
                    setTimeout(() => setCopiedContractText(false), 2000);
                  });
                }}
                className="w-full sm:w-auto text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {copiedContractText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>合約文字已複製！</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>複製純文字合約</span>
                  </>
                )}
              </button>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  id="close-consultant-print-btn"
                  onClick={() => setShowConsultantContractPrint(false)}
                  className="flex-1 sm:flex-initial border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  關閉
                </button>

                <button
                  type="button"
                  id="trigger-consultant-print-btn"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  列印此特約合約
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
