import React, { useState } from 'react';
import { Project, ProjectPhase, PHASES, PaymentNode } from '../types';
import { 
  Calendar, ChevronRight, Search, FileText, UserPlus, DollarSign, 
  TrendingUp, ArrowUpRight, CheckCircle2, AlertTriangle, AlertCircle, 
  Lock, Eye, Layers, Filter, UserCheck, Shield, Award, Sparkles, Sliders
} from 'lucide-react';

interface GanttViewProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onMovePhase: (id: string, newPhase: ProjectPhase) => void;
  userRole: string;
  // Callback to allow updating projects states (like payments or contract details) from this dashboard
  onUpdateProjects?: (updatedProjects: Project[]) => void;
}

const MONTHS = ['3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function GanttView({ projects, onSelectProject, onMovePhase, userRole }: GanttViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showFinanceDashboard, setShowFinanceDashboard] = useState(true);
  const [searchTermFinance, setSearchTermFinance] = useState('');

  // Local copy of projects for quick demo interactive state if needed (synced to app through alerts or prompt)
  // Inside GanttView, we can render fully interactive simulated states for finance tasks
  const [localFeedbackMsg, setLocalFeedbackMsg] = useState<string | null>(null);

  // Helper: Get project start and end month indices on a 10-month grid (2026-03 to 2026-12)
  const getProjectTimelineIndex = (project: Project): { start: number; span: number; end: number } => {
    // Deterministic ranges base on ID & date to make a beautiful, realistic spread
    if (project.id === 'PRJ-2026-001') {
      return { start: 2, span: 4, end: 5 }; // May - Sep
    } else if (project.id === 'PRJ-2026-002') {
      return { start: 1, span: 6, end: 7 }; // Apr - Oct
    } else if (project.id === 'PRJ-2026-003') {
      return { start: 1, span: 5, end: 6 }; // Apr - Sep
    } else if (project.id === 'PRJ-2026-004') {
      return { start: 0, span: 4, end: 4 }; // Mar - Jul
    } else if (project.id === 'PRJ-2026-005') {
      return { start: 2, span: 6, end: 8 }; // May - Nov
    } else {
      // General fallbacks based on creation date or standard defaults
      const createdMonth = new Date(project.createdAt).getMonth(); // 0-indexed (Jan=0, May=4)
      let startIndex = createdMonth - 2; // offset so May (4) map to index 2 (May) of our scale
      if (startIndex < 0 || startIndex > 8) startIndex = 2; // May (Index 2) default
      
      const duration = project.isLargeOrGov ? 6 : 4;
      return { start: startIndex, span: duration, end: Math.min(startIndex + duration, 9) };
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = filterPhase === 'all' || p.currentPhase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  // KPI math for Cash Flow Dashboard
  const totalContractsCount = projects.length;
  const projectStats = projects.reduce((acc, p) => {
    // Revenues
    const rev = p.finalQuoteAmount || p.basicQuoteAmount || 0;
    acc.totalRevenue += rev;
    
    // Payments
    p.paymentNodes?.forEach(node => {
      if (node.status === 'paid') {
        acc.totalPaid += node.amount;
      } else if (node.status === 'invoiced' || node.status === 'reminding') {
        acc.totalReceivables += node.amount;
      }
    });

    // Consultant payout budget (Contracting stage)
    const consultantCost = (p.consultantHours * p.consultantHourlyRate) + (p.consultantExpenses || 0);
    acc.totalConsultantPayable += consultantCost;

    if (p.currentPhase === 'execute') {
      acc.executingCount += 1;
    } else if (p.currentPhase === 'close') {
      acc.closedCount += 1;
    }

    return acc;
  }, {
    totalRevenue: 0,
    totalPaid: 0,
    totalReceivables: 0,
    totalConsultantPayable: 0,
    executingCount: 0,
    closedCount: 0
  });

  const netCorporateProfit = projectStats.totalRevenue - projectStats.totalConsultantPayable;
  const corporateMarginPercent = projectStats.totalRevenue > 0 
    ? Math.round((netCorporateProfit / projectStats.totalRevenue) * 1000) / 10 
    : 0;

  // Custom coloring for phase bars
  const getPhaseColorClasses = (phase: ProjectPhase) => {
    switch(phase) {
      case 'demand':
        return {
          bar: 'bg-stone-500 hover:bg-stone-600',
          text: 'text-stone-800 bg-stone-100 border-stone-200',
          indicator: 'bg-stone-400',
          label: '需求確認'
        };
      case 'quote':
        return {
          bar: 'bg-amber-500 hover:bg-amber-600',
          text: 'text-amber-800 bg-amber-50 border-amber-200',
          indicator: 'bg-amber-400',
          label: '議價報價'
        };
      case 'contract':
        return {
          bar: 'bg-[#F77F35] hover:bg-orange-600',
          text: 'text-[#F77F35] bg-orange-50 border-orange-200',
          indicator: 'bg-[#F77F35]',
          label: '簽約用印'
        };
      case 'execute':
        return {
          bar: 'bg-[#132247] hover:bg-[#1C3266]',
          text: 'text-[#132247] bg-[#132247]/10 border-[#132247]/20',
          indicator: 'bg-[#132247]',
          label: '啟動執行'
        };
      case 'close':
        return {
          bar: 'bg-emerald-600 hover:bg-emerald-700',
          text: 'text-emerald-800 bg-emerald-50 border-emerald-200',
          indicator: 'bg-emerald-500',
          label: '結案核銷'
        };
    }
  };

  const hasAccessToFinance = userRole === 'pm' || userRole === 'finance';

  // Quick Action simulations for accountant / management
  const triggerSimulationFeedback = (msg: string) => {
    setLocalFeedbackMsg(msg);
    setTimeout(() => {
      setLocalFeedbackMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 💰 金流與預算彙整資訊看板 Panel (Restricted to PM & Finance Accountant) */}
      {hasAccessToFinance ? (
        <div className="bg-white border border-[#E4DDD3] rounded-3xl shadow-md overflow-hidden transition-all duration-300">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#132247] to-[#1C3266] text-white py-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F77F35] text-white animate-pulse">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                  群恆新世代 • 經營收支與金流彙整看板
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600/90 text-white select-none">
                    核備專用
                  </span>
                </h2>
                <p className="text-[10px] text-slate-300 font-medium block mt-1">
                  授權角色：{userRole === 'pm' ? '專案負責人 (PM)' : '財務會計 (Finance)'} — 即時預算分配、合約款項期程及特約顧問酬支彙整分析
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFinanceDashboard(!showFinanceDashboard)}
              className="text-xs bg-[#FFFFFF]/15 text-white border border-white/20 hover:bg-white/25 hover:text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              {showFinanceDashboard ? '折疊此分析區' : '展開觀看金流明細'}
            </button>
          </div>

          {/* Collapsible Content */}
          {showFinanceDashboard && (
            <div className="p-5 md:p-6 space-y-6 bg-[#FAF6F0]/40">
              
              {/* Local Notification Ticker */}
              {localFeedbackMsg && (
                <div className="bg-[#FAF6F0] border-l-4 border-[#F77F35] p-3.5 rounded-xl text-xs text-stone-850 flex items-center gap-2.5 shadow-sm animate-bounce">
                  <Sparkles className="w-4 h-4 text-[#F77F35]" />
                  <span>{localFeedbackMsg}</span>
                </div>
              )}

              {/* Grid 2: 核心財務指標 (Cash flow index numbers) */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                <div className="bg-white border border-[#E4DDD3] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <span className="text-[10px] text-[#8C857E] font-bold block tracking-wider uppercase mb-1">
                    全案約定合約總容量
                  </span>
                  <span className="text-lg font-black text-[#132247] font-mono">
                    NT ${projectStats.totalRevenue.toLocaleString()} 元
                  </span>
                  <div className="mt-2.5 text-[10px] text-stone-500 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    累計 {totalContractsCount} 組委任客戶
                  </div>
                </div>

                <div className="bg-white border border-[#E4DDD3] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <span className="text-[10px] text-[#8C857E] font-bold block tracking-wider uppercase mb-1">
                    財務已作帳實收比例
                  </span>
                  <span className="text-lg font-black text-[#132247] font-mono">
                    NT ${projectStats.totalPaid.toLocaleString()} 元
                  </span>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${projectStats.totalRevenue > 0 ? (projectStats.totalPaid / projectStats.totalRevenue) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-emerald-600">
                      {projectStats.totalRevenue > 0 ? Math.round((projectStats.totalPaid / projectStats.totalRevenue) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E4DDD3] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <span className="text-[10px] text-[#8C857E] font-bold block tracking-wider uppercase mb-1">
                    應收催收中帳款 (水位)
                  </span>
                  <span className="text-lg font-black text-[#F77F35] font-mono">
                    NT ${(projectStats.totalReceivables).toLocaleString()} 元
                  </span>
                  <div className="mt-2.5 text-[10px] text-stone-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    待核與未撥付金流
                  </div>
                </div>

                <div className="bg-white border border-[#E4DDD3] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <span className="text-[10px] text-[#8C857E] font-bold block tracking-wider uppercase mb-1">
                    外部特約專家顧問預算
                  </span>
                  <span className="text-lg font-black text-slate-500 font-mono">
                    NT ${projectStats.totalConsultantPayable.toLocaleString()} 元
                  </span>
                  <div className="mt-2.5 text-[10px] text-stone-500 font-medium flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    已對接外部特聘講師聘書
                  </div>
                </div>

                <div className="bg-[#132247]/5 border-2 border-[#132247]/15 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <span className="text-[10px] text-[#132247] font-bold block tracking-wider uppercase mb-1">
                    群恆可得最大毛利
                  </span>
                  <span className="text-lg font-black text-[#132247] font-mono flex items-center gap-1">
                    NT ${netCorporateProfit.toLocaleString()} 元
                  </span>
                  <div className="mt-2.5 text-[10px] text-[#132247] font-bold font-mono flex items-center gap-1 bg-[#132247]/10 w-fit px-1.5 py-0.5 rounded">
                    毛利率: {corporateMarginPercent}%
                  </div>
                </div>

              </div>

              {/* Flex Panel: 收支流水 and 顧問預算對接 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 1. 專案輔導金流與撥款催收管理處 (8 Columns) */}
                <div className="lg:col-span-8 bg-white border border-[#E4DDD3] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-2">
                    <h3 className="text-xs font-black text-[#132247] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#F77F35]" />
                      專案款期收付明細與銷帳催款作業
                    </h3>
                    <div className="text-[9px] text-[#8C857E] font-medium font-mono">
                      ※ 模擬會計進行開票與入帳
                    </div>
                  </div>

                  {/* Payment Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse text-left">
                      <thead>
                        <tr className="bg-[#FAF6F0] font-bold text-stone-700">
                          <th className="p-2 border-b border-[#E4DDD3]">專案標的</th>
                          <th className="p-2 border-b border-[#E4DDD3]">期程標題</th>
                          <th className="p-2 border-b border-[#E4DDD3] text-right">預估金額</th>
                          <th className="p-2 border-b border-[#E4DDD3]">預定入帳日</th>
                          <th className="p-2 border-b border-[#E4DDD3] text-center">状态</th>
                          <th className="p-2 border-b border-[#E4DDD3] text-center">銷帳與催收款模擬</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.flatMap(p => 
                          (p.paymentNodes || []).map(node => ({
                            projId: p.id,
                            projName: p.name,
                            ...node
                          }))
                        ).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-[#8C857E]">
                              ⏳ 當前暫無產生中之執行期款明細。請將專案推動到 「啟動與執行」 階段即會自動生成付款期。
                            </td>
                          </tr>
                        ) : (
                          projects.flatMap(p => 
                            (p.paymentNodes || []).map(node => {
                              return (
                                <tr key={node.id} className="hover:bg-stone-50 border-b border-stone-100">
                                  <td className="p-2 font-bold text-stone-850 truncate max-w-[140px]" title={p.name}>
                                    {p.name}
                                  </td>
                                  <td className="p-2 text-stone-700 font-medium">
                                    {node.title}
                                  </td>
                                  <td className="p-2 text-right font-mono font-bold text-[#132247]">
                                    ${node.amount.toLocaleString()}
                                  </td>
                                  <td className="p-2 text-[#8C857E] font-mono">
                                    {node.billingDate}
                                  </td>
                                  <td className="p-2 text-center">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-sans ${
                                      node.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      node.status === 'invoiced' ? 'bg-[#132247]/10 text-[#132247] border border-[#132247]/20' :
                                      node.status === 'reminding' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                                      'bg-stone-100 text-stone-600 border border-stone-200'
                                    }`}>
                                      {node.status === 'paid' ? '已入帳' :
                                       node.status === 'invoiced' ? '已開票' :
                                       node.status === 'reminding' ? '七日催款中' : '審核草稿'}
                                    </span>
                                  </td>
                                  <td className="p-1 text-center">
                                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                      {node.status === 'draft' && (
                                        <button
                                          type="button"
                                          onClick={() => triggerSimulationFeedback(`🧾 系統為「${p.name}」自動向國稅局與買受人送審發票開立申請！發票號碼: GU-${Math.floor(Math.random() * 80000000) + 10000000}`)}
                                          className="bg-[#132247] hover:bg-[#1C3266] text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition"
                                        >
                                          開立發票
                                        </button>
                                      )}
                                      {node.status === 'reminding' && (
                                        <button
                                          type="button"
                                          onClick={() => triggerSimulationFeedback(`✉️ 系統(Power Automate) 聯名向「${p.name}」之承辦視窗 「${p.contactPerson}」 發送七日內請款備催信件！`)}
                                          className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition"
                                        >
                                          催發郵件
                                        </button>
                                      )}
                                      {node.status === 'invoiced' && (
                                        <button
                                          type="button"
                                          onClick={() => triggerSimulationFeedback(`✅ 已收迄輔導款 NTD$ ${node.amount.toLocaleString()}，財務已作帳核銷並生成會計憑證。`)}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition"
                                        >
                                          確認款訖
                                        </button>
                                      )}
                                      {node.status === 'paid' && (
                                        <span className="text-[9px] text-stone-400 font-mono">傳票歸檔號 #{Math.floor(Math.random()*850)+100}</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. 外部特聘講師酬支預算分配 (4 Columns) */}
                <div className="lg:col-span-4 bg-white border border-[#E4DDD3] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-2">
                    <h3 className="text-xs font-black text-[#132247] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#F77F35]" />
                      特聘專家委任合約與款率對接
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {projects.filter(p => p.assignedConsultantName).length === 0 ? (
                      <div className="text-center p-6 text-[#8C857E] text-[11px] border border-dashed border-stone-200 rounded-xl">
                        🔍 目前暫無指派特聘專家之專案合約
                      </div>
                    ) : (
                      projects.filter(p => p.assignedConsultantName).map(p => {
                        const totalPayout = (p.consultantHours * p.consultantHourlyRate) + (p.consultantExpenses || 0);
                        const ratePercent = p.finalQuoteAmount > 0 
                          ? Math.round((totalPayout / p.finalQuoteAmount) * 100) 
                          : 0;

                        return (
                          <div key={p.id} className="p-3 bg-[#FAF6F0] border border-[#E4DDD3] rounded-xl text-[11px] space-y-1.5 hover:shadow-sm transition">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[#132247] truncate max-w-[130px]">{p.name}</span>
                              <span className="text-[10px] font-bold text-slate-500 font-mono">案號: {p.id}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 text-stone-600 gap-1 mt-1 border-t border-stone-200/50 pt-1">
                              <p>專家：<span className="font-bold text-stone-850">{p.assignedConsultantName}</span></p>
                              <p className="text-right">預算比: <span className="font-bold text-[#F77F35] font-mono">{ratePercent}%</span></p>
                            </div>

                            <div className="flex justify-between items-center text-[10px] bg-white border border-stone-200/60 p-1 rounded font-mono">
                              <span className="text-stone-550">預計撥付額:</span>
                              <span className="font-extrabold text-stone-850">${totalPayout.toLocaleString()}元</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[9px] text-[#8C857E]">合約用印：{p.contractSealingStatus === 'sealed' ? '🎉 已完印' : '待歸檔'}</span>
                              <button
                                type="button"
                                onClick={() => triggerSimulationFeedback(`📝 已核批特聘專家「${p.assignedConsultantName}」所提交之第 ${p.fieldRecords.length || '一'} 次輔導佐證文檔，已排程至下月10日匯款出帳。`)}
                                className="bg-[#FAF6F0] border border-[#DDD4C7] hover:bg-white text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition shadow-none"
                              >
                                發布酬支核備
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* Hidden visual state for lower privilege roles */
        <div className="bg-[#FAF6F0] border border-[#E4DDD3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <p className="text-stone-600 font-semibold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-stone-400" />
            <span>🔒 特約與輔導財務會計管理看板：此部分合約金流、公司毛利及特聘顧問預算僅限【專案負責人 (PM)】與【財務會計 (Finance)】角色存取。</span>
          </p>
          <div className="flex items-center gap-1 text-[10px] bg-stone-100 text-[#8C857E] font-medium px-2 py-0.5 rounded-md uppercase font-mono border border-stone-200/50">
            權限水位：指導顧問 / 業務人員
          </div>
        </div>
      )}

      {/* 📊 甘特圖控制列與過濾篩選 */}
      <div className="bg-white border border-[#E4DDD3] p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1 pr-1.5">
            <Sliders className="w-4 h-4 text-[#F77F35]" />
            甘特進度篩選：
          </span>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              id="gantt-search-input"
              placeholder="搜尋專案名稱 / 委託客戶"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs py-1.5 pr-2.5 border border-[#DDD4C7] rounded-xl focus:outline-none bg-white max-w-[200px]"
            />
          </div>

          <div className="flex bg-[#FAF6F0] border border-[#E4DDD3] rounded-xl p-1 gap-1">
            <button
              onClick={() => setFilterPhase('all')}
              className={`text-[10px] font-extrabold px-3 py-1 rounded-lg transition ${filterPhase === 'all' ? 'bg-[#132247] text-white shadow' : 'text-stone-600 hover:text-stone-900'}`}
            >
              全部顯示
            </button>
            {PHASES.map(ph => (
              <button
                key={ph.id}
                onClick={() => setFilterPhase(ph.id)}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition ${filterPhase === ph.id ? 'bg-[#132247] text-white shadow' : 'text-stone-600 hover:text-stone-900'}`}
              >
                {ph.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-[#8C857E] font-mono font-bold flex items-center gap-1 bg-[#FAF6F0] p-1.5 border border-[#E4DDD3] rounded-xl">
          🕒 當前時間水位：115年/2026年 5月
        </div>
      </div>

      {/* 📅 流程管控甘特圖主看板 (Main Gantt Board Chart) */}
      <div className="bg-white border border-[#E4DDD3] rounded-3xl shadow-sm overflow-hidden">
        
        {/* Scrollable Container along timescale */}
        <div className="overflow-x-auto">
          <div className="min-w-[1100px] divide-y divide-[#E4DDD3]">
            
            {/* 1. Timescale Headers */}
            <div className="grid grid-cols-12 bg-gradient-to-r from-[#FAF6F0] to-[#FFFFFF] py-3 text-center text-xs font-black text-stone-800 leading-none">
              
              {/* Project Left Title Header label */}
              <div className="col-span-3 text-left pl-5 font-bold text-stone-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#132247]" />
                輔導標的與負責人資訊
              </div>

              {/* Timescale Months Columns (9 Column blocks for 10 months range) */}
              <div className="col-span-9 grid grid-cols-10 items-center justify-between">
                {MONTHS.map((m, idx) => (
                  <div key={idx} className="relative py-1 select-none border-l border-stone-200/40 text-stone-700 font-bold font-sans">
                    {/* Visual highlighted current active month line watermark */}
                    {m === '5月' && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#F77F35] text-white text-[8px] px-1 py-0.5 rounded scale-90 select-none">
                        當前進站
                      </span>
                    )}
                    <span className={m === '5月' ? 'text-[#F77F35] underline underline-offset-4 decoration-2 font-black' : ''}>
                      {m}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* 2. Project Gantt Rows list */}
            <div className="divide-y divide-stone-100 bg-white">
              {filteredProjects.length === 0 ? (
                <div className="h-44 text-center flex flex-col items-center justify-center p-6 space-y-2">
                  <AlertCircle className="w-8 h-8 text-[#8C857E]" />
                  <p className="text-xs text-stone-500 font-bold">沒有符合當前搜尋或過濾篩選的諮詢專案</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setFilterPhase('all'); }} 
                    className="text-[11px] text-[#F77F35] hover:underline font-bold"
                  >
                    重置篩選器
                  </button>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const timeline = getProjectTimelineIndex(project);
                  const parsedColors = getPhaseColorClasses(project.currentPhase);
                  
                  // Compute completions
                  const completePercent = project.milestones && project.milestones.length > 0
                    ? Math.round((project.milestones.filter(m => m.status === 'completed').length / project.milestones.length) * 100)
                    : null;

                  return (
                    <div 
                      key={project.id}
                      className="grid grid-cols-12 py-5.5 px-0 items-center hover:bg-[#FAF6F0]/25 transition-all duration-200 group relative"
                    >
                      {/* Left Info Column (3/12 wide) */}
                      <div className="col-span-3 pl-5 pr-4 space-y-1.5 border-r border-[#FAF6F0]">
                        
                        {/* Headers ID + Gov alert */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-extrabold font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                            {project.id}
                          </span>
                          {project.isLargeOrGov && (
                            <span className="bg-[#FAF6F0] text-amber-800 border-2 border-amber-200 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase scale-90 select-none flex items-center gap-0.5 leading-none">
                              大型政府案
                            </span>
                          )}
                        </div>

                        {/* Title & Clickable details wrapper */}
                        <button
                          type="button"
                          onClick={() => onSelectProject(project)}
                          className="text-left font-black text-xs text-stone-800 hover:text-[#F77F35] transition leading-tight line-clamp-2 block focus:outline-none"
                        >
                          {project.name}
                        </button>

                        <p className="text-[10px] text-[#8C857E] font-medium flex items-center gap-1">
                          🏢 <span className="underline decoration-stone-200">{project.clientName}</span>
                        </p>

                        {/* Assignee & Cost mini row */}
                        <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                          {project.assignedConsultantName ? (
                            <span className="text-[#132247] font-bold bg-[#132247]/5 px-2 py-0.5 rounded border border-[#132247]/10 flex items-center gap-0.5">
                              👨‍🏫 {project.assignedConsultantName.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-stone-450 italic bg-stone-50 px-2 py-0.5 rounded border border-dashed text-[9px]">
                              ⚠️ 待指派指導顧問
                            </span>
                          )}

                          <span className="text-stone-500 font-medium font-mono">
                            ${(project.finalQuoteAmount || project.basicQuoteAmount).toLocaleString()}元
                          </span>
                        </div>

                      </div>

                      {/* Right Timeline Grid (9/12 wide) */}
                      <div className="col-span-9 grid grid-cols-10 h-16 items-center relative pr-4">
                        
                        {/* 10 Vertical background divider lines (for calendar columns representation) */}
                        {Array.from({ length: 10 }).map((_, colIdx) => (
                          <div 
                            key={colIdx} 
                            className="h-full border-l border-stone-200/30 flex items-center justify-center relative pointer-events-none select-none"
                          >
                            {/* Watermark indicators: Render milestone flags directly inside calendar column slot! */}
                            {project.milestones?.map((m) => {
                              // Rough mapping: estimate milestones month index
                              const dueMonth = Number(m.dueDate.split('-')[1]); // "06" -> 6 (June)
                              const targetIndex = dueMonth - 3; // mapping to MONTHS starting in 3月 (Index 0)
                              
                              if (colIdx === targetIndex) {
                                return (
                                  <div 
                                    key={m.id}
                                    title={`成果物里程碑：${m.title} (截止日: ${m.dueDate}) — 屬 ${m.status === 'completed' ? '已核備' : '待歸檔狀態'}`}
                                    className={`absolute top-0.5 z-10 p-1 rounded-full cursor-help shadow-sm text-[8px] font-black transition ${
                                      m.status === 'completed' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-amber-400 text-stone-900 border border-amber-500'
                                    }`}
                                  >
                                    🚩
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ))}

                        {/* Horizontal Project Process scheduling bar bar element positioned dynamically */}
                        <div 
                          style={{
                            gridColumnStart: timeline.start + 1,
                            gridColumnEnd: timeline.start + timeline.span + 1
                          }}
                          className="relative h-6.5 rounded-2xl shadow-sm transition-all duration-200 border border-black/10 z-20"
                        >
                          {/* Main Coloring */}
                          <div 
                            onClick={() => onSelectProject(project)}
                            className={`w-full h-full rounded-2xl cursor-pointer ${parsedColors.bar} transition-all duration-300 flex items-center justify-between px-3 text-white shadow-inner`}
                            title={`點擊進入「${project.name}」詳情並上傳本階段簽約/查驗之證明檔案`}
                          >
                            {/* Complete State text inside Gantt bar */}
                            <span className="text-[10px] sm:text-[11px] font-black truncate drop-shadow-sm flex items-center gap-1.5 select-none text-white hover:text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              {parsedColors.label} 
                              {completePercent !== null && (
                                <span className="font-mono text-[9px] font-extrabold bg-black/15 text-white/90 px-1 py-0.2 rounded-full">
                                  稽查得率: {completePercent}%
                                </span>
                              )}
                            </span>

                            <span className="text-[10px] font-bold font-mono tracking-wider opacity-90 drop-shadow-sm select-none">
                              {MONTHS[timeline.start]} - {MONTHS[Math.min(timeline.start + timeline.span - 1, 9)]}
                            </span>
                          </div>

                          {/* Quick stage moving trigger directly on Gantt Row! (Matches workflow management of PM & Sales) */}
                          {userRole !== 'consultant' && (
                            <div className="absolute -bottom-8.5 right-1 z-30 flex items-center gap-1 justify-end shrink-0 select-none">
                              <span className="text-[8px] bg-stone-100 text-[#8C857E] border border-stone-250 py-0.5 px-1.5 rounded-l font-black uppercase leading-none mt-1">
                                快速推展進階：
                              </span>
                              {project.currentPhase === 'demand' && (
                                <button
                                  type="button"
                                  onClick={() => onMovePhase(project.id, 'quote')}
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-xs"
                                  title="移入議價報價階段"
                                >
                                  送報價價單
                                </button>
                              )}
                              {project.currentPhase === 'quote' && (
                                <button
                                  type="button"
                                  onClick={() => onMovePhase(project.id, 'contract')}
                                  className="bg-[#F77F35] hover:bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-xs"
                                  title="移入簽約用印合約階段"
                                >
                                  簽訂委任合約
                                </button>
                              )}
                              {project.currentPhase === 'contract' && (
                                <button
                                  type="button"
                                  onClick={() => onMovePhase(project.id, 'execute')}
                                  className="bg-[#132247] hover:bg-[#1C3266] text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-xs"
                                  title="啟動此案，開始實地輔導與付款期提醒"
                                >
                                  核印啟動專案
                                </button>
                              )}
                              {project.currentPhase === 'execute' && (
                                <button
                                  type="button"
                                  onClick={() => onMovePhase(project.id, 'close')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-xs"
                                  title="委任輔導服務皆已交付，送財務進行終期款與稽查作帳結案"
                                >
                                  送終審核銷
                                </button>
                              )}
                              {project.currentPhase === 'close' && (
                                <span className="text-[9px] text-[#8C857E] font-bold font-mono mt-1 pr-1">🎉 專案已核銷結案</span>
                              )}
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Board Legends explanation */}
        <div className="bg-[#FAF6F0] p-4 text-[11px] text-stone-650 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4DDD3]">
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-[#132247]">🎨 階段色塊圖例：</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3 bg-stone-500 rounded-sm inline-block"></span>
              需求確認 (Demand)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3 bg-amber-500 rounded-sm inline-block"></span>
              議價報價 (Quote)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3 bg-[#F77F35] rounded-sm inline-block"></span>
              簽約協商 (Contract)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3 bg-[#132247] rounded-sm inline-block"></span>
              啟動與執行 (Execute)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3 bg-emerald-600 rounded-sm inline-block"></span>
              結案與核銷 (Close)
            </span>
          </div>

          <div className="text-right text-[10px] text-[#8C857E] font-medium">
            🚩 代表「診斷紀錄/期末永續報告文件」關鍵提交節點
          </div>

        </div>

      </div>

    </div>
  );
}
