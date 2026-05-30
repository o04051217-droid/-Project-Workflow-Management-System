import { useState } from 'react';
import { Project, ProjectPhase, PHASES, ROLES, Role } from '../types';
import { Search, Shield, ArrowRight, UserCheck, CheckSquare, Eye } from 'lucide-react';

interface ListViewProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  userRole: Role;
}

export function ListView({ projects, onSelectProject, userRole }: ListViewProps) {
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) || 
                          project.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          project.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesPhase = phaseFilter === 'all' ? true : project.currentPhase === phaseFilter;
    const matchesType = typeFilter === 'all' ? true : 
                        typeFilter === 'gov' ? project.isLargeOrGov : !project.isLargeOrGov;

    return matchesSearch && matchesPhase && matchesType;
  });

  const getPhaseBadge = (phase: ProjectPhase) => {
    switch (phase) {
      case 'demand':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1. 需求確認</span>;
      case 'quote':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">2. 議價報價</span>;
      case 'contract':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">3. 簽約協議</span>;
      case 'execute':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">4. 啟動執行</span>;
      case 'close':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-medium">5. 結案核銷</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="list-search-input"
            type="text"
            placeholder="搜尋專案代號、名稱、廠商名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5">
            <label htmlFor="phase-filter-select" className="text-xs text-slate-500 font-medium">流程階段:</label>
            <select
              id="phase-filter-select"
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">全部階段</option>
              {PHASES.map(p => (
                <option key={p.id} value={p.id}>{p.num}. {p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="type-filter-select" className="text-xs text-slate-500 font-medium">專案類型:</label>
            <select
              id="type-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">全部類型</option>
              <option value="gov">大型 / 政府專案</option>
              <option value="standard">一般常規專案</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono font-medium ml-auto">
            已篩選: {filteredProjects.length} 筆
          </span>
        </div>
      </div>

      {/* Grid List or Table Layout */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">專案代號</th>
                <th className="py-3 px-4">專案名稱 / 委託廠商</th>
                <th className="py-3 px-4 text-center">階段</th>
                <th className="py-3 px-4 text-center">專案屬性</th>
                <th className="py-3 px-4 text-right">議約報價</th>
                <th className="py-3 px-4 text-center">指派顧問</th>
                <th className="py-3 px-4 text-center">最近更新</th>
                <th className="py-3 px-4 text-center w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    沒有符合搜尋條件的專案項目。
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {project.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <h4 className="font-bold text-slate-800 hover:text-indigo-600 transition truncate cursor-pointer" onClick={() => onSelectProject(project)}>
                        {project.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{project.clientName} (聯絡: {project.contactPerson})</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getPhaseBadge(project.currentPhase)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {project.isLargeOrGov ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          <Shield className="w-2.5 h-2.5" />
                          大型/政府專案
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">一般常規</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold font-mono text-slate-800">
                      ${(project.finalQuoteAmount || project.basicQuoteAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {project.assignedConsultantName ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-semibold">
                          {project.assignedConsultantName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">- 待分派 -</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[10px] text-slate-400">
                      {new Date(project.updatedAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        id={`view-project-btn-${project.id}`}
                        onClick={() => onSelectProject(project)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-lg font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        詳情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
