import React, { useState } from 'react';
import { Project, ProjectPhase, PHASES, Role } from '../types';
import { 
  Search, FileText, CheckCircle, Trash2, Eye, Download, FileSpreadsheet, 
  Image as ImageIcon, FileArchive, Upload, Sparkles, Folder, HelpCircle, 
  X, ExternalLink, Calendar, CheckSquare, File, Signature, Info
} from 'lucide-react';

interface ProjectFileItem {
  id: string;
  name: string;
  phaseId: ProjectPhase;
  phaseName: string;
  uploadedAt: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'zip' | 'other';
  size: string;
}

interface FileManagementTabProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  userRole: Role;
  canEditPhase: (phase: ProjectPhase) => boolean;
}

export function FileManagementTab({ project, onUpdateProject, userRole, canEditPhase }: FileManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<'all' | ProjectPhase>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'excel' | 'word' | 'image' | 'zip'>('all');
  
  // Custom mock file input states
  const [newFileName, setNewFileName] = useState('');
  const [targetPhase, setTargetPhase] = useState<ProjectPhase>('demand');
  const [customFileType, setCustomFileType] = useState<'pdf' | 'docx' | 'xlsx' | 'zip' | 'jpg'>('pdf');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Preview panel state
  const [previewFile, setPreviewFile] = useState<ProjectFileItem | null>(null);

  // Collate all files from this project
  const getAllFiles = (): ProjectFileItem[] => {
    const items: ProjectFileItem[] = [];

    const phaseConfig: { key: 'phase1UploadedFiles' | 'phase2UploadedFiles' | 'phase3UploadedFiles' | 'phase4UploadedFiles' | 'phase5UploadedFiles'; id: ProjectPhase; title: string }[] = [
      { key: 'phase1UploadedFiles', id: 'demand', title: '需求確認' },
      { key: 'phase2UploadedFiles', id: 'quote', title: '議價報價' },
      { key: 'phase3UploadedFiles', id: 'contract', title: '簽約協議' },
      { key: 'phase4UploadedFiles', id: 'execute', title: '啟動執行' },
      { key: 'phase5UploadedFiles', id: 'close', title: '結案核銷' },
    ];

    phaseConfig.forEach(p => {
      const fileNames = project[p.key] || [];
      fileNames.forEach((fileName, index) => {
        const lower = fileName.toLowerCase();
        let type: ProjectFileItem['type'] = 'other';
        let size = '1.2 MB'; // Default mock size

        if (lower.endsWith('.pdf')) {
          type = 'pdf';
          size = `${(1.5 + (index * 0.4)).toFixed(1)} MB`;
        } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
          type = 'excel';
          size = `${(85 + (index * 32)).toFixed(0)} KB`;
        } else if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
          type = 'word';
          size = `${(210 + (index * 45)).toFixed(0)} KB`;
        } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) {
          type = 'image';
          size = `${(450 + (index * 125)).toFixed(0)} KB`;
        } else if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) {
          type = 'zip';
          size = `${(4.2 + (index * 1.8)).toFixed(1)} MB`;
        }

        // Try to parse timestamp from simulated naming "[已核備_11:30] ..."
        let uploadedAt = '系統預載';
        const timeMatch = fileName.match(/已核備[^\d]*(\d{2}:\d{2})/);
        if (timeMatch && timeMatch[1]) {
          uploadedAt = `今天 ${timeMatch[1]}`;
        } else if (project.updatedAt) {
          // Fall back to formatted date
          uploadedAt = new Date(project.updatedAt).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }

        items.push({
          id: `${p.id}-${index}-${fileName}`,
          name: fileName,
          phaseId: p.id,
          phaseName: p.title,
          uploadedAt,
          type,
          size
        });
      });
    });

    // Also parse photos inside field records
    if (project.fieldRecords && project.fieldRecords.length > 0) {
      project.fieldRecords.forEach((record, index) => {
        if (record.signInPhoto) {
          items.push({
            id: `field-sign-${index}`,
            name: `現場簽到出席表_輔導第${index + 1}次.jpg`,
            phaseId: 'execute',
            phaseName: '啟動執行',
            uploadedAt: record.date || '今日輔導',
            type: 'image',
            size: '720 KB'
          });
        }
        if (record.sessionPhoto) {
          items.push({
            id: `field-session-${index}`,
            name: `顧問現場指導寫照_輔導第${index + 1}次.jpg`,
            phaseId: 'execute',
            phaseName: '啟動執行',
            uploadedAt: record.date || '今日輔導',
            type: 'image',
            size: '1.4 MB'
          });
        }
      });
    }

    return items;
  };

  const allFiles = getAllFiles();

  // Filter files based on tabs and search term
  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          file.phaseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = selectedPhase === 'all' ? true : file.phaseId === selectedPhase;
    const matchesType = selectedType === 'all' ? true : file.type === selectedType;
    return matchesSearch && matchesPhase && matchesType;
  });

  // Handle mock file deletion
  const handleDelete = (fileItem: ProjectFileItem) => {
    if (!canEditPhase(fileItem.phaseId)) {
      alert(`您目前的 Role 權限不允許操作「${fileItem.phaseName}」階段的檔案。`);
      return;
    }

    if (window.confirm(`確定要刪除「${fileItem.name}」嗎？此操作不可復原。`)) {
      let fieldKey: 'phase1UploadedFiles' | 'phase2UploadedFiles' | 'phase3UploadedFiles' | 'phase4UploadedFiles' | 'phase5UploadedFiles' | null = null;
      switch (fileItem.phaseId) {
        case 'demand': fieldKey = 'phase1UploadedFiles'; break;
        case 'quote': fieldKey = 'phase2UploadedFiles'; break;
        case 'contract': fieldKey = 'phase3UploadedFiles'; break;
        case 'execute': fieldKey = 'phase4UploadedFiles'; break;
        case 'close': fieldKey = 'phase5UploadedFiles'; break;
      }

      if (fieldKey) {
        const updatedFiles = (project[fieldKey] || []).filter(f => f !== fileItem.name);
        onUpdateProject({
          ...project,
          [fieldKey]: updatedFiles,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Field record photos
        if (fileItem.id.startsWith('field-')) {
          const isSign = fileItem.id.includes('sign');
          const indexStr = fileItem.id.split('-').pop();
          const targetIndex = indexStr ? parseInt(indexStr, 10) : -1;
          
          if (targetIndex >= 0 && project.fieldRecords) {
            const updatedRecords = [...project.fieldRecords];
            if (isSign) {
              updatedRecords[targetIndex] = { ...updatedRecords[targetIndex], signInPhoto: undefined };
            } else {
              updatedRecords[targetIndex] = { ...updatedRecords[targetIndex], sessionPhoto: undefined };
            }
            onUpdateProject({
              ...project,
              fieldRecords: updatedRecords,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
      
      if (previewFile?.id === fileItem.id) {
        setPreviewFile(null);
      }
    }
  };

  // Handle mock upload simulator
  const handleAddNewMockFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    if (!canEditPhase(targetPhase)) {
      alert(`您目前的 Role 權限不允許在「${PHASES.find(p => p.id === targetPhase)?.name}」階段上傳檔案。`);
      return;
    }

    const ext = `.${customFileType}`;
    let finalSelection = newFileName.trim();
    if (!finalSelection.toLowerCase().endsWith(ext)) {
      finalSelection += ext;
    }

    const timeStamp = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const formattedName = `[已核備_${timeStamp}] ${finalSelection}`;

    let fieldKey: 'phase1UploadedFiles' | 'phase2UploadedFiles' | 'phase3UploadedFiles' | 'phase4UploadedFiles' | 'phase5UploadedFiles';
    switch (targetPhase) {
      case 'demand': fieldKey = 'phase1UploadedFiles'; break;
      case 'quote': fieldKey = 'phase2UploadedFiles'; break;
      case 'contract': fieldKey = 'phase3UploadedFiles'; break;
      case 'execute': fieldKey = 'phase4UploadedFiles'; break;
      case 'close': fieldKey = 'phase5UploadedFiles'; break;
    }

    const currentList = project[fieldKey] || [];
    const updated = {
      ...project,
      [fieldKey]: [...currentList, formattedName],
      updatedAt: new Date().toISOString()
    };

    onUpdateProject(updated);
    
    setUploadSuccessMessage(`成功模擬上傳：${formattedName}`);
    setNewFileName('');
    setTimeout(() => {
      setUploadSuccessMessage(null);
    }, 4000);
  };

  // Quick select system for upload templates
  const templateFiles: Record<ProjectPhase, string[]> = {
    demand: ['客戶轉型痛點查證確認表', '現場硬體機台規格評估報告'],
    quote: ['細部成本支出核算模組', '初擬議價同意及備忘條款'],
    contract: ['顧問委託代行協議書', '保密與智慧財產回饋NDA條款'],
    execute: ['現場輔導訪談實錄講義', '期中交付與補助審核投影片'],
    close: ['最終全案結案成果報告', '核銷審計費用單據佐證壓縮檔'],
  };

  const getFileIconAndColor = (type: ProjectFileItem['type']) => {
    switch (type) {
      case 'pdf':
        return { icon: <FileText className="w-5 h-5 text-rose-600 animate-pulse-subtle" />, color: 'bg-rose-50 text-rose-800 border-rose-100' };
      case 'excel':
        return { icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-100' };
      case 'word':
        return { icon: <FileText className="w-5 h-5 text-indigo-600" />, color: 'bg-indigo-50 text-indigo-800 border-indigo-100' };
      case 'image':
        return { icon: <ImageIcon className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-100' };
      case 'zip':
        return { icon: <FileArchive className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 text-purple-800 border-purple-100' };
      default:
        return { icon: <File className="w-5 h-5 text-slate-500" />, color: 'bg-slate-50 text-slate-800 border-slate-100' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Introduce & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">全案累計檔案</p>
            <p className="text-xl font-black text-slate-800 font-mono mt-0.5">{allFiles.length} <span className="text-xs font-normal">個</span></p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PDF 文件數</p>
            <p className="text-xl font-black text-slate-800 font-mono mt-0.5">
              {allFiles.filter(f => f.type === 'pdf').length} <span className="text-xs font-normal">個</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EXCEL / 報表</p>
            <p className="text-xl font-black text-slate-800 font-mono mt-0.5">
              {allFiles.filter(f => f.type === 'excel').length} <span className="text-xs font-normal">個</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">輔導照片 / 圖檔</p>
            <p className="text-xl font-black text-slate-800 font-mono mt-0.5">
              {allFiles.filter(f => f.type === 'image').length} <span className="text-xs font-normal">個</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main File Management Core Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: File Explorer List (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Filters & Search Header */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-3">
            
            {/* Row 1: Search and Type filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜尋專案檔案名稱、上傳階段..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                />
              </div>

              {/* Type Category Filter */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-xl text-[10px] font-extrabold max-w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedType('all')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${selectedType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('pdf')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${selectedType === 'pdf' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('excel')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${selectedType === 'excel' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('word')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${selectedType === 'word' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  Word
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('image')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${selectedType === 'image' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  圖片
                </button>
              </div>
            </div>

            {/* Row 2: Phase Tags filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 mr-2 shrink-0">篩選階段：</span>
              <button
                type="button"
                onClick={() => setSelectedPhase('all')}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition ${
                  selectedPhase === 'all' 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                全部階段 ({allFiles.length})
              </button>
              {PHASES.map(ph => {
                const count = allFiles.filter(f => f.phaseId === ph.id).length;
                return (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setSelectedPhase(ph.id)}
                    className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border transition ${
                      selectedPhase === ph.id 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    PHSE {ph.num} {ph.name} ({count})
                  </button>
                );
              })}
            </div>

          </div>

          {/* Files List Execution */}
          <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto custom-scrollbar">
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Folder className="w-10 h-10 stroke-1 mx-auto mb-2.5 text-slate-300" />
                <p className="text-xs font-bold font-sans">無符合篩選條件的專案檔案</p>
                <p className="text-[10px] text-slate-450 mt-1 font-sans">您可以於右側面板上傳模擬檔案，或調整篩選器。</p>
              </div>
            ) : (
              filteredFiles.map((file) => {
                const typeStyle = getFileIconAndColor(file.type);
                const canDelete = canEditPhase(file.phaseId);

                return (
                  <div 
                    key={file.id} 
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition group"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-xl shrink-0 border ${typeStyle.color}`}>
                        {typeStyle.icon}
                      </div>
                      
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200/60 text-indigo-700">
                            {file.phaseName}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {file.size}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            • {file.uploadedAt}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-805 truncate group-hover:text-indigo-600 transition" title={file.name}>
                          {file.name}
                        </h4>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                        title="點擊預覽檔案"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <a
                        href={`#download-${file.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`模擬下載流程成功：已將「${file.name}」(${file.size}) 排程下載。`);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 rounded-lg transition"
                        title="虛擬下載"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(file)}
                        className={`p-1.5 rounded-lg transition ${
                          canDelete 
                            ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer' 
                            : 'text-slate-200 hover:text-slate-200 cursor-not-allowed opacity-40'
                        }`}
                        title={canDelete ? '刪除檔案' : '您對此階段檔案無刪除權限'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Prompt banner */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-505 flex items-center justify-between font-sans">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              點擊預覽圖示
              <Eye className="w-3 h-3 inline text-slate-400" />
              可查看專案真實數據產生的精美 A4 報表／合約／簽到單。
            </span>
            <span className="text-slate-400 font-mono">系統已啟用檔案交叉追蹤</span>
          </div>

        </div>

        {/* Right Side: Mock File Uploader & Guidelines (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Simulator Panel */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-xs">模擬檔案上傳器</h3>
            </div>
            
            <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
              您可在此模擬任何 PDF / Excel 文件之上傳。系統將連動該專案對應流程、通知紀錄並即時入帳。
            </p>

            <form onSubmit={handleAddNewMockFile} className="space-y-3 pt-1">
              
              {/* Field 1: Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  自訂檔案名稱
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：聯新織造技術評審確認表"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Grid 2x1 for Phase & File extension */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">
                    所屬階段
                  </label>
                  <select
                    value={targetPhase}
                    onChange={(e) => setTargetPhase(e.target.value as ProjectPhase)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    {PHASES.map(ph => (
                      <option key={ph.id} value={ph.id}>
                        PH-{ph.num} {ph.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">
                    副檔名格式
                  </label>
                  <select
                    value={customFileType}
                    onChange={(e) => setCustomFileType(e.target.value as any)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="pdf">.pdf (手冊文檔)</option>
                    <option value="xlsx">.xlsx (計算表)</option>
                    <option value="docx">.docx (說明書)</option>
                    <option value="zip">.zip (壓縮包)</option>
                    <option value="jpg">.jpg (相片圖檔)</option>
                  </select>
                </div>
              </div>

              {/* Status Indicator */}
              {!canEditPhase(targetPhase) && (
                <div className="bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg text-rose-300 text-[10px] leading-snug font-sans">
                  ⚠️ 當前角色對此階段無編輯權，上傳按鍵已禁用。
                </div>
              )}

              {uploadSuccessMessage && (
                <div className="bg-emerald-950/50 border border-emerald-900/60 p-2 rounded-lg text-emerald-300 text-[10px] font-semibold leading-relaxed">
                  ✓ {uploadSuccessMessage}
                </div>
              )}

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={!canEditPhase(targetPhase) || !newFileName.trim()}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  canEditPhase(targetPhase) && newFileName.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow shadow-indigo-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                模擬上傳並發送簽核
              </button>

            </form>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-850">
              <span className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5">推薦快捷範本：</span>
              <div className="flex flex-wrap gap-1">
                {templateFiles[targetPhase]?.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewFileName(tpl)}
                    className="text-[9px] bg-slate-800 hover:bg-slate-750 text-indigo-300 px-2 py-1 rounded max-w-full truncate transition text-left"
                    title={`點擊快速套用此範本`}
                  >
                    📑 {tpl}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Technical Info Checklist */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              檔案上傳檢驗指標說明
            </h4>
            
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              全案推進設有「應備文件」控制閘道。若對應指標未齊全，將無法向下流轉或提出最終尾款核銷結算：
            </p>

            <ul className="space-y-2 text-[10px] text-slate-600 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">1.需求確認：</span>
                <span>最少應備 1 份《客戶需求說明功能文件》。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">2.議價報價：</span>
                <span>一般專案最少 3 份，大專案最少 4 份核備佐證。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">3.簽約協議：</span>
                <span>雙方用印合約及顧問外聘代行契約共 2 份。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">4.啟動執行：</span>
                <span>每次輔導均應具備簽到照片與現場實錄。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">5.結案核銷：</span>
                <span>結案成果、核銷單據憑證等最少應備 2 份。</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* FULL IMMERSIVE PREVIEW LIGHTBOX DIALOG */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-950/80 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-100 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-slate-250 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Lightbox Header */}
            <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg shrink-0 border border-indigo-500/30">
                  {getFileIconAndColor(previewFile.type).icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-white max-w-xl truncate leading-normal" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    大小：{previewFile.size} • 所屬階段：{previewFile.phaseName} • 歸檔：{previewFile.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`模擬下載：已成功請求檔案「${previewFile.name}」下載流。`);
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-lg font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  下載原檔
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Immersive Scrollable A4 Canvas Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-slate-200 custom-scrollbar">
              
              {/* Image Previewer */}
              {previewFile.type === 'image' ? (
                <div className="bg-white p-4 rounded-xl shadow-md border border-slate-250 flex flex-col items-center justify-center max-w-2xl h-fit">
                  <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex flex-col items-center justify-center relative group p-6">
                    
                    {/* Simulated High Quality Graphics */}
                    <div className="w-full h-full rounded border border-slate-300 text-slate-400 flex flex-col items-center justify-center text-center p-4">
                      {isSignInPhoto(previewFile.name) ? (
                        <div className="space-y-4">
                          <Signature className="w-16 h-16 text-indigo-500 stroke-1 block mx-auto animate-pulse" />
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-indigo-50 text-indigo-700 p-1 px-2.5 rounded">現場簽到出席會簽實體掃描件</span>
                            <h4 className="font-extrabold text-slate-805 mt-2.5 text-sm">【專案輔導成果】學員手寫簽章核可版</h4>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-sm">包含委聘講師 {project.assignedConsultantName || '黃自強 顧問'} 現場手繪執業章、企業客戶主辦人承諾簽署與受學學員手繪簽章。</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <ImageIcon className="w-16 h-16 text-amber-500 stroke-1 block mx-auto transition" />
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-50 text-amber-700 p-1 px-2.5 rounded">實地輔導實錄寫照相片</span>
                            <h4 className="font-extrabold text-slate-805 mt-2.5 text-sm">【顧問進場輔導】現場專案協作情境</h4>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-sm">影像記錄：{project.name}、企業學員與輔導顧問討論核心數位架構及里程碑。影像細緻，經理級簽核佐證使用。</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full mt-3.5 pt-3 border-t border-slate-150 text-center text-[10px] text-slate-405 font-sans">
                    備註：輔導影像佐證均採 GPS 座標與時間戳記浮水印校验，符合政府補助計畫結案查驗格式。
                  </div>
                </div>
              ) : previewFile.type === 'excel' ? (
                
                /* Excel/Spreadsheet Mock Viewer */
                <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-3xl w-full h-fit overflow-hidden font-sans">
                  
                  {/* Sheets selection tabs */}
                  <div className="bg-slate-100 border-b border-slate-200 flex text-[10px] font-bold divide-x divide-slate-200">
                    <span className="px-4 py-2 bg-white text-emerald-800 border-t-2 border-emerald-600 flex items-center gap-1">
                      🟢 Sheet 1 - 總表
                    </span>
                    <span className="px-4 py-2 text-slate-500 hover:bg-slate-50 cursor-pointer">
                      Sheet 2 - 細目核算
                    </span>
                  </div>

                  {/* Excel Formula Row */}
                  <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 font-mono text-[10px]">
                    <span className="bg-white border border-slate-200 px-1.5 rounded font-extrabold text-slate-500">fx</span>
                    <input 
                      type="text" 
                      readOnly 
                      value={`=SUM(D3:D${(project.costAnalysisItems?.length || 0) + 2})`}
                      className="bg-transparent text-slate-600 focus:outline-none flex-1 font-semibold"
                    />
                  </div>

                  {/* Excel Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-slate-150 text-slate-500 font-extrabold select-none text-[10px] border-b border-slate-200">
                          <th className="py-1 px-2 text-center border-r border-slate-200 bg-slate-200 w-10"></th>
                          <th className="py-1 px-3 border-r border-slate-200">A (品項名稱)</th>
                          <th className="py-1 px-3 border-r border-slate-200">B (大分類)</th>
                          <th className="py-1 px-3 text-right border-r border-slate-200">C (單價 / NTD)</th>
                          <th className="py-1 px-3 text-right border-r border-slate-200">D (數量 / 時數)</th>
                          <th className="py-1 px-3 text-right">E (小計金額)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {project.costAnalysisItems && project.costAnalysisItems.length > 0 ? (
                          project.costAnalysisItems.map((item, id) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="py-1 text-center border-r border-slate-200 bg-slate-100 text-slate-500 font-extrabold text-[10px]">{id + 1}</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-800">{item.name}</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 text-slate-500">
                                {item.category === 'human' ? '👨‍💼 顧問人力' : item.category === 'travel' ? '✈️ 交通差旅' : item.category === 'material' ? '📦 講義教材' : '⚙️ 其他支出'}
                              </td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">${item.unitCost.toLocaleString()}</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">{item.quantity}</td>
                              <td className="py-1.5 px-3 text-right font-bold text-slate-800">${(item.unitCost * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          // Default mock rows if empty
                          <>
                            <tr className="hover:bg-slate-50/50">
                              <td className="py-1 text-center border-r border-slate-200 bg-slate-100 text-slate-500 font-extrabold text-[10px]">1</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-800">專業顧問策略輔導 (工時核算)</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 text-indigo-700">👨‍💼 顧問人力</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">$15,000</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">8</td>
                              <td className="py-1.5 px-3 text-right font-bold text-slate-850">$120,000</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="py-1 text-center border-r border-slate-200 bg-slate-100 text-slate-500 font-extrabold text-[10px]">2</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-800">往返現場實地差旅費用實報實銷</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 text-orange-700">✈️ 交通差旅</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">$8,000</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">3</td>
                              <td className="py-1.5 px-3 text-right font-bold text-slate-850">$24,000</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="py-1 text-center border-r border-slate-200 bg-slate-100 text-slate-500 font-extrabold text-[10px]">3</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-800">輔導講義編排與培訓問卷授權</td>
                              <td className="py-1.5 px-3 border-r border-slate-200 text-emerald-700">📦 講義教材</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">$16,000</td>
                              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-600">1</td>
                              <td className="py-1.5 px-3 text-right font-bold text-slate-850">$16,000</td>
                            </tr>
                          </>
                        )}
                        {/* Summary Block */}
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-1 text-center border-r border-slate-200 bg-slate-150 text-slate-500 font-extrabold text-[10px]">*</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-sans font-extrabold text-slate-800">合計總預算額 / NTD</td>
                          <td className="py-2 px-3 border-r border-slate-200"></td>
                          <td className="py-2 px-3 text-right border-r border-slate-200"></td>
                          <td className="py-2 px-3 text-right border-r border-slate-200 font-mono text-slate-450">SUBTOTAL</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-indigo-700 text-sm">
                            ${(project.finalQuoteAmount || project.basicQuoteAmount || 180000).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-indigo-50/50 p-3.5 border-t border-slate-200 text-[10px] text-indigo-800 flex items-center justify-between font-sans">
                    <span>✓ 本計算書已連動到【財團法人智慧專案管理顧問推廣中心】ERP 資料庫</span>
                    <span className="font-mono text-indigo-500">Verified by CFO Audit</span>
                  </div>

                </div>
              ) : (
                
                /* Word/PDF Document Template Viewer */
                <div className="bg-white rounded-xl shadow-2xl border border-slate-250 max-w-3xl w-full h-fit p-8 md:p-14 font-sans text-stone-800 relative select-text leading-relaxed">
                  
                  {/* Corner Watermark */}
                  <div className="absolute top-10 right-10 w-24 h-24 border-3 border-dashed border-indigo-400/30 text-indigo-500/25 rounded-full flex items-center justify-center text-center font-black uppercase text-[10px] tracking-widest rotate-12 pointer-events-none select-none">
                    CONFIDENTIAL
                  </div>

                  {/* Header Title */}
                  <div className="text-center space-y-1.5 pb-6 border-b-2 border-stone-300">
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">
                      智慧企業輔助大聯盟專案計畫合約書
                    </p>
                    <h2 className="text-xl md:text-2xl font-black text-stone-850 tracking-wide">
                      {isContractFile(previewFile.name) ? '顧問委託研究服務契約協議書' : '企業輔導轉型痛點與需求說明書'}
                    </h2>
                    <p className="text-[10px] text-stone-400 font-mono">
                      合約序號：{project.id} • 專案代碼：AP-2026-XQ
                    </p>
                  </div>

                  {/* Document Metas */}
                  <div className="my-6 grid grid-cols-2 gap-y-2 text-xs text-stone-600 bg-stone-50 p-4 rounded-lg font-sans border border-stone-200/60">
                    <div>
                      <strong className="text-stone-800">甲方（委委託人）：</strong> 
                      <span className="font-semibold">{project.clientName}</span>
                    </div>
                    <div>
                      <strong className="text-stone-800">簽署日期：</strong> 
                      <span>中華民國 115 年 05 月 20 日</span>
                    </div>
                    <div>
                      <strong className="text-stone-800">乙方（受託人）：</strong> 
                      <span className="font-semibold">財團法人智慧專案管理顧問推廣中心</span>
                    </div>
                    <div>
                      <strong className="text-stone-800">法定代理人：</strong> 
                      <span>郭漢章 主任</span>
                    </div>
                  </div>

                  {/* Text Contents based on File Topic */}
                  {isContractFile(previewFile.name) ? (
                    
                    /* Contract Content */
                    <div className="space-y-4 text-xs text-stone-650 font-sans text-justify mt-4">
                      <p>
                        茲因甲方為推動數位轉型與企業經營之卓越成長，委託乙方提供專業顧問輔導及策略診斷，雙方依誠實信用原則，合意訂立本顧問研究服務合約（以下簡稱本合約）條約如下：
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">第一條：委託研究與策略標的</h4>
                      <p className="text-stone-600 pl-4">
                        甲方委託乙方執行之專案名稱為「<strong className="text-stone-800 font-extrabold">{project.name}</strong>」。其工作範疇包括企業核心實力評估、雲端與物聯網架構擬定、流程控管輔導及全體學員培訓，預計投入諮詢天數為專案時限內積極完成。
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">第二條：合約總價與付款條件</h4>
                      <p className="text-stone-600 pl-4">
                        本專案合約總金額經雙方協定，議定為<strong className="text-stone-900 font-black">新台幣 ${(project.finalQuoteAmount || project.basicQuoteAmount || 180000).toLocaleString()} 元整</strong>（含稅）。甲方應依系統訂定之里程碑查核點，在接獲乙方發票後十四日（14）內匯款全額交付。
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">第三條：外聘顧問與派工約章</h4>
                      <p className="text-stone-600 pl-4">
                        乙方指派外聘顧問核心導師『<strong className="text-stone-800 font-bold">{project.assignedConsultantName || '黃自強 顧問'}</strong>』共同執行，按月到場輔導甲方學員。顧問應本著專家執業道德，維護甲方之極高商業與製造秘密機密（NDA約束）。
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">第四條：智慧財產與歸屬權</h4>
                      <p className="text-stone-600 pl-4">
                        本合約執行期間所產生之輔導講義、診斷建議、及研究報告等之智慧財產權歸雙方共有。未經另一方书面同意，任一方不得擅自洩漏予第三人。
                      </p>

                      {/* Official Stamp Box Grid */}
                      <div className="mt-10 pt-8 border-t border-stone-250 flex justify-between items-center pr-6 flex-wrap gap-4">
                        <div>
                          <p className="text-[10px] text-stone-500">甲方（用印簽署）：</p>
                          <div className="mt-2 text-stone-700 space-y-1 font-semibold">
                            <p>{project.clientName}</p>
                            <p className="text-[9px] text-stone-500">主辦代表：{project.contactPerson}</p>
                          </div>
                        </div>

                        {/* Visual Corporate Seals */}
                        <div className="flex gap-4">
                          <div className="w-16 h-16 border-2 border-rose-600 rounded-lg flex flex-col items-center justify-center text-rose-600 text-[8px] font-bold p-1 select-none font-mono">
                            <span className="border-b border-rose-600 pb-0.5 w-full text-center">甲方用印</span>
                            <span className="text-[8px] mt-1 scale-90 leading-normal text-center">專用合約章<br />SEALED</span>
                          </div>
                          
                          <div className="w-16 h-16 border-2 border-rose-600 rounded-full flex flex-col items-center justify-center text-rose-600 text-[8px] font-bold p-1 select-none font-mono">
                            <span className="border-b border-rose-600 pb-0.5 text-center">財團智慧</span>
                            <span className="text-[8px] mt-1 leading-normal text-center">推廣中心<br />專用印</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    
                    /* Demands Document Content */
                    <div className="space-y-4 text-xs text-stone-650 font-sans text-justify mt-4">
                      <p>
                        本說明書旨在詳加彙整與追蹤研析「<strong className="text-stone-850 font-black">{project.name}</strong>」之前期委託痛點、技術實施可行度以及內部運作之量能查證：
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">一、核心轉型需求與痛點詳解</h4>
                      <p className="text-stone-600 pl-4 bg-stone-50 p-2.5 rounded border border-stone-150 leading-relaxed font-sans">
                        {project.demandDesc || '暫無需求說明紀錄。欲模擬更多資料，請至右側面板錄入自訂內容。'}
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">二、接案技術可行性核備評估</h4>
                      <p className="text-stone-600 pl-4 leading-relaxed font-sans">
                        {project.techFeasibility || '針對本案，本會數位策略組與各派工顧問均完成核心諮詢可行性核備。本技術能百分百落地並達到輔導預期值。'}
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">三、內部執行量能（人天及排程排班）</h4>
                      <p className="text-stone-600 pl-4 leading-relaxed font-sans">
                        {project.resourceFeasibility || '經主辦及PM調度，人力調配充足。已事先協調對應月度排班進場，本會量能可百分百容納。'}
                      </p>

                      <h4 className="font-black text-stone-800 text-xs mt-3">四、結論建議與下一步</h4>
                      <p className="text-stone-600 pl-4 font-sans">
                        本評估報告業已通過本會承案部門主管覆審核准。建議立即提交至 Phase 2 進行成本細目估算，並生成對應報價單，儘速配合進行協商議價。
                      </p>

                      <div className="mt-12 pt-6 border-t border-stone-200 flex justify-between items-center flex-wrap gap-2 text-[10px] text-stone-400 font-sans">
                        <span>複查審計：財團法人智慧專案管理顧問推廣中心 業務暨法物部門</span>
                        <span>中華民國 115 年 5 月制</span>
                      </div>

                    </div>
                  )}

                  {/* Document Footer Page details */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>PAGE 1 OF 1</span>
                    <span>© AI-Generated Immersive Viewer Mode</span>
                  </div>

                </div>
              )}

            </div>

            {/* Lightbox Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span>輔導對象：{project.clientName} | 聯絡渠道：{project.contactPerson} ({project.contactPhone})</span>
              <span className="font-semibold text-slate-700">智慧合約流轉系統安全認證件</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Helpers
function isContractFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('合約') || lower.includes('contract') || lower.includes('協議') || lower.includes('委託') || lower.includes('seal');
}

function isSignInPhoto(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('簽到') || lower.includes('attendance') || lower.includes('sign');
}
