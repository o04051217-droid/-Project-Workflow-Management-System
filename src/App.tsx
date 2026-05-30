import React, { useState, useEffect } from 'react';
import { Project, Role, ProjectPhase, PHASES, ROLES, WorkflowNotification, Milestone, PaymentNode } from './types';
import { INITIAL_PROJECTS, INITIAL_NOTIFICATIONS } from './data';
import { GanttView } from './components/GanttView';
import { BrandLogo } from './components/BrandLogo';
import { ListView } from './components/ListView';
import { TemplatesTab } from './components/TemplatesTab';
import { NotificationFeed } from './components/NotificationFeed';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { 
  Building2, Plus, Bell, Shield, TrendingUp, DollarSign, ListTodo, FileText, 
  HelpCircle, Sparkles, FolderKanban, CheckCircle2, UserCheck
} from 'lucide-react';

export default function App() {
  // Persistence with LocalStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('proflow_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [notifications, setNotifications] = useState<WorkflowNotification[]>(() => {
    const saved = localStorage.getItem('proflow_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentRole, setCurrentRole] = useState<Role>('pm'); // Admin/PM default
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'templates' | 'notifications'>('kanban');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('proflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('proflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle phase quick move from Kanban board
  const handleMovePhase = (id: string, newPhase: ProjectPhase) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          currentPhase: newPhase,
          updatedAt: new Date().toISOString()
        };

        // Automatic action logic when moving phase
        if (newPhase === 'execute' && p.paymentNodes.length === 0) {
          // Auto generate standard installments
          updated.paymentNodes = [
            { id: `p-init-${Date.now()}`, title: '第一期：簽約預付款 (30%)', amount: Math.round(p.finalQuoteAmount * 0.3), billingDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'reminding' },
            { id: `p-mid-${Date.now()}`, title: '第二期：期中報告審查 (40%)', amount: Math.round(p.finalQuoteAmount * 0.4), billingDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'draft' },
            { id: `p-end-${Date.now()}`, title: '第三期：驗收結案款 (30%)', amount: Math.round(p.finalQuoteAmount * 0.3), billingDate: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'draft' }
          ];
          updated.milestones = [
            { id: `m-init-${Date.now()}`, title: '初次現場輔導與診斷訪談', dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'pending' },
            { id: `m-end-${Date.now()}`, title: '期末成果審查會議與產出意見書', dueDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'pending' }
          ];

          // Trigger automatic workflow notification for finance
          const notif: WorkflowNotification = {
            id: `notif-${Date.now()}`,
            projectId: p.id,
            projectName: p.name,
            timestamp: new Date().toISOString(),
            type: 'contract_signed',
            message: `🎉 專案「${p.name}」已推展至【啟動執行】，系統已自動提醒財務備妥本案首期發票開立作業，並生成里程碑。`,
            isRead: false
          };
          setNotifications(nPrev => [notif, ...nPrev]);
        }

        return updated;
      }
      return p;
    }));
  };

  // Handle detail modal save update
  const handleSaveProject = (updated: Project) => {
    // Check if transition trigger detected
    const oldProject = projects.find(x => x.id === updated.id);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(null);

    // If transitioned automatically add notification
    if (oldProject && oldProject.currentPhase !== updated.currentPhase) {
      const phName = PHASES.find(ph => ph.id === updated.currentPhase)?.name || '';
      const notif: WorkflowNotification = {
        id: `notif-${Date.now()}`,
        projectId: updated.id,
        projectName: updated.name,
        timestamp: new Date().toISOString(),
        type: 'info',
        message: `📢 專案已被主辦人更新流程，當前狀態已成功轉移入【${phName}】。`,
        isRead: false
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Create project form inputs state
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsGov, setNewIsGov] = useState(false);
  const [newQuote, setNewQuote] = useState<number>(150000);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClient.trim() || !newContact.trim() || !newPhone.trim()) return;

    const newPrj: Project = {
      id: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      name: newName.trim(),
      clientName: newClient.trim(),
      contactPerson: newContact.trim(),
      contactPhone: newPhone.trim(),
      isLargeOrGov: newIsGov,
      currentPhase: 'demand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      demandDesc: newDesc.trim() || '尚無描述，待業務評定。',
      techFeasibility: '',
      resourceFeasibility: '',
      phase1UploadedFiles: [],
      basicQuoteAmount: newQuote,
      finalQuoteAmount: newQuote,
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
      midtermReportStatus: newIsGov ? 'pending' : 'not_required',
      phase4UploadedFiles: [],
      closingChecks: {
        serviceDelivered: false,
        allInvoicesIssued: false,
        allPaymentsReceived: false,
        finalReportApproved: false
      },
      finalInvoicedAmount: 0,
      phase5UploadedFiles: []
    };

    setProjects(prev => [newPrj, ...prev]);
    setShowCreateForm(false);
    
    // Reset form
    setNewName('');
    setNewClient('');
    setNewContact('');
    setNewPhone('');
    setNewDesc('');
    setNewIsGov(false);
    setNewQuote(150000);

    // Trigger notification
    const notif: WorkflowNotification = {
      id: `notif-${Date.now()}`,
      projectId: newPrj.id,
      projectName: newPrj.name,
      timestamp: new Date().toISOString(),
      type: 'info',
      message: `🆕 業務成功開立全新諮詢需求案「${newPrj.name}」，已歸入階段一【需求確認】。`,
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
    setActiveTab('kanban');
  };

  // Automated workflows trigger simulations
  const handleTriggerDemoAlert = (type: 'contract' | 'reminder') => {
    if (type === 'contract') {
      // Find quote stage or standard projects
      const contractProject = projects.find(p => p.currentPhase === 'contract' || p.currentPhase === 'quote');
      if (!contractProject) {
        alert('ℹ️ 模擬失敗：當前專案資料中，無符合此狀態(簽約/報價中)之專案可供模擬演練！可進入詳情手動切換一組。');
        return;
      }

      // Progress it into execution
      setProjects(prev => prev.map(p => {
        if (p.id === contractProject.id) {
          return {
            ...p,
            currentPhase: 'execute',
            contractSealingStatus: 'sealed',
            phase3UploadedFiles: ['[已核簽] 用印契約持存檔_v1.pdf', '[自動歸檔] 特聘技術研究授權規章.pdf'],
            paymentNodes: [
              { id: `p-notif-${Date.now()}-1`, title: '第一期：簽約預付款 (30%)', amount: Math.round(p.finalQuoteAmount * 0.3), billingDate: new Date().toISOString().split('T')[0], status: 'reminding' },
              { id: `p-notif-${Date.now()}-2`, title: '第二期：期末成果核撥款 (70%)', amount: Math.round(p.finalQuoteAmount * 0.7), billingDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'draft' }
            ],
            milestones: [
              { id: `m-notif-${Date.now()}-1`, title: '首期現場對接與診斷書', dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'pending' }
            ],
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      }));

      const n: WorkflowNotification = {
        id: `notif-${Date.now()}`,
        projectId: contractProject.id,
        projectName: contractProject.name,
        timestamp: new Date().toISOString(),
        type: 'contract_signed',
        message: `🎉 專案「${contractProject.name}」已由 PM 執行線上合約歸檔與用印確認！系統(Power Automate)已自動觸發工作信件通知財務準備開立首期發票。`,
        isRead: false
      };
      setNotifications(prev => [n, ...prev]);
    } else {
      // 7-day payment reminder trigger
      const executionPrj = projects.find(p => p.currentPhase === 'execute');
      if (!executionPrj) {
        alert('ℹ️ 模擬失敗：當前並無處於「啟動與執行」狀態之服務輔導專案可供提醒模擬。');
        return;
      }

      setProjects(prev => prev.map(p => {
        if (p.id === executionPrj.id) {
          const updatedNodes = p.paymentNodes.map(node => {
            if (node.status === 'draft') {
              return { ...node, status: 'reminding' as const };
            }
            return node;
          });
          return { ...p, paymentNodes: updatedNodes, updatedAt: new Date().toISOString() };
        }
        return p;
      }));

      const n: WorkflowNotification = {
        id: `notif-${Date.now()}`,
        projectId: executionPrj.id,
        projectName: executionPrj.name,
        timestamp: new Date().toISOString(),
        type: 'payment_reminder',
        message: `⏰ [入帳通知警示] 專案「${executionPrj.name}」下之付款期程已在 7 日催收警示水位（預計應收: 2026-06-15）。已向主辦業務、PM 與財務同仁聯名提醒跟進催收。`,
        isRead: false
      };
      setNotifications(prev => [n, ...prev]);
    }
  };

  // Notifications basic actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Clean local storage and restore demo default values if they want to restart
  const handleResetData = () => {
    if (window.confirm('確定要初始化專案資料庫，清除目前所有變更嗎？')) {
      localStorage.clear();
      setProjects(INITIAL_PROJECTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSelectedProject(null);
      setActiveTab('kanban');
    }
  };

  // KPI calculations
  const totalActive = projects.length;
  const totalValue = projects.reduce((sum, p) => sum + (p.finalQuoteAmount || p.basicQuoteAmount || 0), 0);
  const totalInvoiced = projects.reduce((sum, p) => {
    if (p.currentPhase === 'demand' || p.currentPhase === 'quote') return sum;
    const projectPaid = p.paymentNodes?.filter(node => node.status === 'paid' || node.status === 'invoiced')
                                      .reduce((s, n) => s + n.amount, 0) || 0;
    return sum + projectPaid;
  }, 0);
  const pendingSealing = projects.filter(p => p.currentPhase === 'contract' && p.contractSealingStatus !== 'sealed').length;

  // Unread badge count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header Navigation Panel */}
      <header className="bg-white text-[#2B2927] shadow-sm py-4 px-4 md:px-6 sticky top-0 z-40 border-b border-[#E4DDD3]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <BrandLogo className="h-11" />

          {/* RBAC Persona Selector widget */}
          <div className="bg-[#FAF6F0] p-1.5 rounded-xl border border-[#E4DDD3] flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-stone-550 font-black uppercase tracking-wider px-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#F77F35]" />
              角色切換:
            </span>
            {(Object.keys(ROLES) as Role[]).map((rKey) => {
              const r = ROLES[rKey];
              const isSelected = currentRole === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  id={`role-switch-btn-${rKey}`}
                  onClick={() => {
                    setCurrentRole(rKey);
                    // Filter project detail accessibility alert automatically if modal open
                    if (selectedProject) {
                      // refresh mock
                      const p = projects.find(x => x.id === selectedProject.id);
                      if (p) setSelectedProject({ ...p });
                    }
                  }}
                  className={`text-[11px] font-extrabold py-1 px-2.5 rounded-lg transition ${
                    isSelected 
                      ? 'bg-[#132247] text-white shadow shadow-[#132247]/20' 
                      : 'text-stone-600 hover:bg-[#E4DDD3]/40 hover:text-stone-900'
                  }`}
                >
                  {r.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Role description banner */}
      <div className="bg-slate-100 border-b border-slate-200 py-2 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p className="font-medium">
            💡 當前角色：<strong className="text-slate-800">{ROLES[currentRole].name}</strong> — {ROLES[currentRole].description}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">2026-05-24 | 組織核心庫</span>
            <button
              onClick={handleResetData}
              className="text-[11px] text-rose-500 hover:text-rose-700 font-bold underline"
            >
              重置系統資料
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Metric Cards Banner row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3.5 hover:shadow transition">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                在管輔導專案總數
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {totalActive} <span className="text-xs font-medium text-slate-500">個項目</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3.5 hover:shadow transition">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                約定合約預估收益
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                ${totalValue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3.5 hover:shadow transition">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                已開立發票及實進
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                ${totalInvoiced.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3.5 hover:shadow transition">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                簽約中待公印印信
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {pendingSealing} <span className="text-xs font-medium text-slate-500">份專約</span>
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs and Adding New Project Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-brand-border pb-1">
          
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl transition ${
                activeTab === 'kanban' 
                  ? 'bg-brand-accent/25 text-brand-accent border border-brand-accent/30 shadow' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-alt border border-transparent'
              }`}
            >
              📅 流程控管甘特圖看板 (Gantt Chart)
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl transition ${
                activeTab === 'list' 
                  ? 'bg-brand-accent/25 text-brand-accent border border-brand-accent/30 shadow' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-alt border border-transparent'
              }`}
            >
              📋 專案數據明細 (Spreadsheet)
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl transition ${
                activeTab === 'templates' 
                  ? 'bg-brand-accent/25 text-brand-accent border border-brand-accent/30 shadow' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-alt border border-transparent'
              }`}
            >
              📁 公版範本庫
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl transition relative ${
                activeTab === 'notifications' 
                  ? 'bg-brand-accent/25 text-brand-accent border border-brand-accent/30 shadow' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-alt border border-transparent'
              }`}
            >
              🔔 流程通知
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono scale-90">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Create Project triggers only if sales or pm */}
          {(currentRole === 'sales' || currentRole === 'pm') && (
            <button
              type="button"
              id="new-project-toggle-frm"
              onClick={() => setShowCreateForm(prev => !prev)}
              className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg rounded-xl px-4 py-2 text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              新增需求輔導專案
            </button>
          )}

        </div>

        {/* Newly Adding Project Form Panel */}
        {showCreateForm && (
          <form onSubmit={handleCreateProject} className="bg-brand-surface border-2 border-brand-accent/55 p-5 rounded-2xl shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h3 className="font-bold text-sm text-brand-accent flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                登載全新委託諮詢專案 (業務開案專區)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-xs text-brand-muted hover:text-brand-text"
              >
                關閉
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="new-prj-name" className="block text-slate-700 font-semibold mb-1">專案名稱</label>
                <input
                  id="new-prj-name"
                  type="text"
                  placeholder="例如: 大林高智能碳中和輔導案"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-prj-client" className="block text-slate-700 font-semibold mb-1">委託廠商名稱</label>
                <input
                  id="new-prj-client"
                  type="text"
                  placeholder="例如: 茂發實業廠"
                  required
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-prj-quote" className="block text-slate-700 font-semibold mb-1">首輪預估總額 (NTD)</label>
                <input
                  id="new-prj-quote"
                  type="number"
                  min="0"
                  required
                  value={newQuote}
                  onChange={(e) => setNewQuote(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="new-prj-contact" className="block text-slate-700 font-semibold mb-1">聯絡窗口名字/職位</label>
                <input
                  id="new-prj-contact"
                  type="text"
                  placeholder="如: 江經理"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-prj-phone" className="block text-slate-700 font-semibold mb-1">窗口電話/分機</label>
                <input
                  id="new-prj-phone"
                  type="text"
                  placeholder="如: 02-3344-9988 #112"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  id="new-prj-isgov"
                  type="checkbox"
                  checked={newIsGov}
                  onChange={(e) => setNewIsGov(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="new-prj-isgov" className="text-slate-700 font-semibold">標記為「大型/政府補助案」</label>
              </div>
            </div>

            <div className="text-xs">
              <label htmlFor="new-prj-desc" className="block text-slate-700 font-semibold mb-1">初步客戶需求詳述</label>
              <textarea
                id="new-prj-desc"
                placeholder="請輸入前期電話訪談、或客戶提出之痛點、預計診斷大綱..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="border border-brand-border text-brand-muted hover:text-brand-text text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-surface-alt transition"
              >
                取消
              </button>
              <button
                type="submit"
                id="submit-create-project-btn"
                className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg text-xs font-black px-5 py-2 rounded-xl transition shadow"
              >
                存檔送出 (立案)
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Nav Tabs Rendering Content */}
        {activeTab === 'kanban' && (
          <div className="w-full">
            <GanttView
              projects={projects}
              onSelectProject={(project) => setSelectedProject(project)}
              onMovePhase={handleMovePhase}
              userRole={currentRole}
            />
          </div>
        )}

        {activeTab === 'list' && (
          <ListView
            projects={projects}
            onSelectProject={(project) => setSelectedProject(project)}
            userRole={currentRole}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab />
        )}

        {activeTab === 'notifications' && (
          <NotificationFeed
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onTriggerDemoAlert={handleTriggerDemoAlert}
          />
        )}

      </main>

      {/* Footer system details */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <p>© 2026 財團法人智慧專案管理顧問推廣中心. All rights reserved.</p>
        <p className="mt-1 font-mono text-[10px]">Security certified under ISO 27001 | Powered by React SPA Layout</p>
      </footer>

      {/* Floating detail overlay modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={handleSaveProject}
          userRole={currentRole}
        />
      )}

    </div>
  );
}
