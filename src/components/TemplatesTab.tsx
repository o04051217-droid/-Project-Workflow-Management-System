import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { FORM_TEMPLATES } from '../data';

export function TemplatesTab() {
  const triggerDownload = (fileName: string, content: string, type: 'excel' | 'word') => {
    const mimeType = type === 'excel' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">📁 公版合約與成本表範本庫</h3>
          <p className="text-xs text-slate-300">
            本中心內建標準範本，保障業務、專案經理、法務同仁作業格式一致。一鍵點擊便可下載成對應之 CSV 或 TXT 文字範本。
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl text-center md:text-right">
          <span className="text-xs block text-slate-300">目前模組庫</span>
          <span className="font-bold text-base font-mono">3 個標準範本</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FORM_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {tpl.type === 'excel' ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-xs text-slate-400 font-mono uppercase">Standard Template</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tpl.type === 'excel' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {tpl.type === 'excel' ? 'CSV 試算表格式' : 'TXT 文件規格'}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-800 leading-tight">
                {tpl.name.replace('.csv', '').replace('.txt', '')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
                {tpl.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                核定通用版
              </span>
              <button
                type="button"
                id={`download-tpl-${tpl.id}`}
                onClick={() => triggerDownload(tpl.name, tpl.csvContent, tpl.type as any)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                下載範本
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2">
        <span className="text-base">💡</span>
        <div className="space-y-1">
          <p className="font-bold text-slate-700">範本使用說明</p>
          <p>業務在 Phase 2 (議價與報價) 階段可以直接下載 【標準成本分析表】填寫，上傳至系統；在 Phase 3 (簽約與協議) 階段，法務與顧問可下載【顧問委託簽約合約主範本】進行微調後用印。</p>
        </div>
      </div>
    </div>
  );
}
