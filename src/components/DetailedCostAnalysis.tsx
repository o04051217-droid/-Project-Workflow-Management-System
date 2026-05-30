import React from 'react';
import { Project, ProjectDetailedCost, DetailedCostRow } from '../types';
import { Sparkles, HelpCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface DetailedCostAnalysisProps {
  project: Project;
  onChange: (costAnalysis: ProjectDetailedCost) => void;
  readOnly: boolean;
  phase: 'quote' | 'close' | 'execute';
}

export function createDefaultDetailedCostAnalysis(finalQuoteAmount: number): ProjectDetailedCost {
  const baseQuote = finalQuoteAmount || 160425;
  return {
    auditFeeTaxIncluded: 231000,
    auditFeeTaxDeducted: true,
    incomeTaxRate: 20,
    taxRateSelection: '21%',
    rows: {
      adminFee: { name: '行政費用', refPercentage: 17.24, estimatedExpense: 26342, actualExpense: 26342, note: '' },
      incomeTax: { name: '所得稅', refPercentage: 4.20, estimatedExpense: 6417, actualExpense: 6417, note: '' },
      performanceFee: { name: '績效費', refPercentage: 0.00, estimatedExpense: 0, actualExpense: 0, note: '佳芸、明姿' },
      consultantFee: { name: '講師費', refPercentage: 53.32, estimatedExpense: 0, actualExpense: 45550, note: '專案管理人費用' },
      paidConsultantFee: { name: '已支付講師費', refPercentage: 0.00, estimatedExpense: 0, actualExpense: 10000, note: '郭董出場審查會一場' },
      trafficFee: { name: '交通費', refPercentage: 2.10, estimatedExpense: 0, actualExpense: 26097, note: '8次現場輔導+2場陪稽' },
      oilFee: { name: '油資', refPercentage: 2.10, estimatedExpense: 0, actualExpense: 4608, note: '' },
      parkingFee: { name: '停車費', refPercentage: 0.04, estimatedExpense: 0, actualExpense: 300, note: '' },
      lodgingFee: { name: '住宿費', refPercentage: 0.19, estimatedExpense: 0, actualExpense: 3318, note: '' },
      entertainmentFee: { name: '交際費', refPercentage: 0.20, estimatedExpense: 0, actualExpense: 0, note: '' },
      mealFee: { name: '伙食費', refPercentage: 0.03, estimatedExpense: 0, actualExpense: 590, note: '' },
      printingFee: { name: '印刷與郵資', refPercentage: 0.09, estimatedExpense: 0, actualExpense: 693, note: '' },
      evaluationFee: { name: '評鑑費', refPercentage: 0.00, estimatedExpense: 0, actualExpense: 0, note: '' },
      otherFee: { name: '其他費用', refPercentage: 1.93, estimatedExpense: 0, actualExpense: 515, note: '' },
    }
  };
}

export function DetailedCostAnalysis({
  project,
  onChange,
  readOnly,
  phase
}: DetailedCostAnalysisProps) {
  // Ensure we have active cost analysis state, else initialize with defaults
  const data = project.detailedCostAnalysis || createDefaultDetailedCostAnalysis(project.finalQuoteAmount);

  // Quote numbers
  const quoteTaxIncluded = project.finalQuoteAmount || 160425;
  const quoteTaxExcluded = Math.round(quoteTaxIncluded / 1.05);

  // Audit Fee calculations
  const auditFeeTaxIncluded = data.auditFeeTaxIncluded;
  const auditFeeTaxExcluded = Math.round(auditFeeTaxIncluded / 1.05);
  
  // Ratio calculation: Audit Fee / (Quote + Audit Fee)
  const auditFeeRatio = ((auditFeeTaxIncluded / (quoteTaxIncluded + auditFeeTaxIncluded)) * 100).toFixed(2);

  const taxFactor = data.taxRateSelection === '21%' ? 0.042 : 0.032;
  const auditFeeTaxLoss = Math.round(auditFeeTaxExcluded * taxFactor);

  // standard item updater helper
  const updateRow = (key: keyof typeof data.rows, field: 'estimatedExpense' | 'actualExpense' | 'note', value: any) => {
    const updatedRows = { ...data.rows };
    updatedRows[key] = {
      ...updatedRows[key],
      [field]: value
    };
    onChange({
      ...data,
      rows: updatedRows
    });
  };

  const updateConfig = (field: keyof Omit<ProjectDetailedCost, 'rows'>, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const resetToTemplate = () => {
    if (window.confirm('確定要還原至公版標準估算數值嗎？這將覆蓋現有變更。')) {
      onChange(createDefaultDetailedCostAnalysis(quoteTaxIncluded));
    }
  };

  // 114年比例參考 calculation (Reasonable values B)
  const refValues: Record<string, { amount: number; pct: number }> = {};
  
  // 1. Audit Fee Tax loss (稽核費稅損)
  refValues.auditLoss = { amount: auditFeeTaxLoss, pct: 4.20 }; // fixed 4.2% as per image

  // Pre-calculate other rows
  Object.entries(data.rows).forEach(([key, row]) => {
    refValues[key] = {
      amount: Math.round(quoteTaxExcluded * (row.refPercentage / 100)),
      pct: row.refPercentage
    };
  });

  // SUM OF STANDARD REFERENCE EXPENSES (excluding audit fee tax loss row)
  const standardRefTotalExpense = Object.entries(data.rows)
    .filter(([key]) => key !== 'performanceFee' && key !== 'paidConsultantFee') // exclude non-standard reference rows
    .reduce((sum, [key, row]) => sum + Math.round(quoteTaxExcluded * (row.refPercentage / 100)), 0);

  const standardRefTotalPercentage = Object.entries(data.rows)
    .filter(([key]) => key !== 'performanceFee' && key !== 'paidConsultantFee')
    .reduce((sum, [_, row]) => sum + row.refPercentage, 0);

  // 專案合理報價(含稅)-25%
  const reasonableQuoteAmount = Math.round((standardRefTotalExpense / 0.75) * 1.05);
  const isQuoteReasonable = quoteTaxIncluded >= reasonableQuoteAmount;

  // 114 reference Profit
  const refProfitAmount = Math.round(quoteTaxExcluded * 0.2356);
  const refProfitPercentage = 23.56;

  // ESTIMATES COLUMN D & E
  const estTotalExpense = auditFeeTaxLoss + Object.values(data.rows).reduce((sum, row) => sum + (row.estimatedExpense || 0), 0);
  const estTotalPercentage = 4.20 + Object.values(data.rows).reduce((sum, row) => {
    const rowPct = quoteTaxExcluded > 0 ? (row.estimatedExpense / quoteTaxExcluded) * 100 : 0;
    return sum + rowPct;
  }, 0);
  const estProfit = quoteTaxExcluded - estTotalExpense;
  const estProfitPct = quoteTaxExcluded > 0 ? (estProfit / quoteTaxExcluded) * 100 : 0;
  const isEstProfitTargetMet = estProfitPct >= 20;

  // ACTUAL COLUMN G & H & I
  const actTotalExpense = auditFeeTaxLoss + Object.values(data.rows).reduce((sum, row) => sum + (row.actualExpense || 0), 0);
  const actTotalPercentage = 4.20 + Object.values(data.rows).reduce((sum, row) => {
    const rowPct = quoteTaxExcluded > 0 ? (row.actualExpense / quoteTaxExcluded) * 100 : 0;
    return sum + rowPct;
  }, 0);
  const actProfit = quoteTaxExcluded - actTotalExpense;
  const actProfitPct = quoteTaxExcluded > 0 ? (actProfit / quoteTaxExcluded) * 100 : 0;
  const isActProfitTargetMet = actProfitPct >= 20;

  return (
    <div className="space-y-6 bg-brand-surface p-6 rounded-2xl border border-brand-border">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h3 className="font-sans font-bold text-lg text-brand-accent flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
            細部專案成本分析估算表 (報價前與結案比對)
          </h3>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
            依照財務精算公版，比對「合理預算支出」、「自填預估支出」與「實際支出數」，查核利潤是否達標及費用是否超支異常。
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={resetToTemplate}
            className="flex items-center gap-1.5 text-xs bg-brand-surface-alt border border-brand-border text-brand-text hover:bg-brand-accent/15 hover:text-brand-accent py-1.5 px-3 rounded-xl transition font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            還原至範本數值
          </button>
        )}
      </div>

      {/* Top Header Card Grid - EXACTLY as the Excel template */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-brand-bg p-3.5 rounded-xl border border-brand-border text-xs">
        <div className="p-2 border-r border-brand-border/40">
          <span className="text-brand-muted block font-bold">專案名稱</span>
          <span className="font-extrabold text-brand-text mt-1 block truncate" title={project.name}>{project.name}</span>
        </div>
        <div className="p-2 border-r border-brand-border/40">
          <span className="text-brand-muted block font-bold">委託廠商</span>
          <span className="font-extrabold text-brand-text mt-1 block truncate" title={project.clientName}>{project.clientName}</span>
        </div>
        <div className="p-2 border-r border-brand-border/40">
          <span className="text-brand-muted block font-bold">專案負責人</span>
          <span className="font-extrabold text-brand-text mt-1 block">{project.contactPerson || '祐程'}</span>
        </div>
        <div className="p-2">
          <span className="text-brand-muted block font-bold">專案編號</span>
          <span className="font-mono font-extrabold text-brand-accent mt-1 block">{project.id}</span>
        </div>
      </div>

      {/* Pricing comparison / Profit ratio metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-surface-alt p-4 rounded-xl border-l-[4px] border-brand-accent">
        <div className="space-y-1">
          <span className="text-[10px] text-brand-muted block font-bold uppercase">專案預計報價(扣除核費)</span>
          <div className="font-mono text-brand-accent font-black text-lg block">
            ${quoteTaxExcluded.toLocaleString()} <span className="text-xs font-normal text-brand-muted">(未稅)</span>
          </div>
          <div className="font-mono text-brand-text font-bold text-xs">
            ${quoteTaxIncluded.toLocaleString()} <span className="text-[10px] text-brand-muted">(含稅)</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-brand-muted block font-bold uppercase">預計 / 實際利潤</span>
          <div className="font-mono text-[#FBBF24] font-black text-lg">
            {estProfitPct.toFixed(2)}% <span className="text-xs text-brand-muted">/</span> {actProfitPct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-brand-muted">
            基準目標利潤率 <span className="text-[#FBBF24] font-bold">≥ 20%</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-brand-muted block font-bold uppercase">25%毛利合理報價 (含稅)</span>
          <div className="font-mono text-brand-text font-black text-lg">
            ${reasonableQuoteAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-brand-muted block">
            費用總計 {standardRefTotalExpense.toLocaleString()} ÷ 0.75 * 1.05
          </span>
        </div>

        <div className="space-y-1 flex flex-col justify-center">
          <span className="text-[10px] text-brand-muted block font-bold uppercase">與市場合理定價對比</span>
          <div className="mt-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${
              isQuoteReasonable 
                ? 'bg-emerald-500/20 text-brand-success border-brand-success/30' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {isQuoteReasonable ? '報價合理' : '不合理 (偏低)'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 3 - Taxes & Audit Deducts Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-brand-surface p-4 rounded-xl border border-brand-border text-xs">
        
        {/* Left: Income Tax selector */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-brand-text">
            <span>⚙️ 營所稅費率配置</span>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <div>
              <span className="text-brand-muted block mb-1 font-semibold">營所稅率</span>
              <span className="font-mono font-bold text-brand-text text-sm block">20%</span>
            </div>
            <div>
              <label htmlFor="tax-rate-selection" className="text-brand-muted block mb-1 font-semibold">稅額級距</label>
              {readOnly ? (
                <span className="font-sans font-bold text-brand-accent text-sm">{data.taxRateSelection} → {data.taxRateSelection === '21%' ? '4.20%' : '3.20%'}</span>
              ) : (
                <select
                  id="tax-rate-selection"
                  value={data.taxRateSelection}
                  onChange={(e) => updateConfig('taxRateSelection', e.target.value)}
                  className="p-1 border border-brand-border text-xs rounded bg-brand-surface-alt font-bold text-brand-accent"
                >
                  <option value="16%">稅額 16% (總額比 3.20%)</option>
                  <option value="21%">稅額 21% (總額比 4.20%)</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Right: Audit fee breakdown */}
        <div className="md:col-span-8 space-y-2 border-t md:border-t-0 md:border-l border-brand-border/60 md:pl-4">
          <div className="flex items-center gap-1.5 font-bold text-brand-text">
            <span>🔍 稽核公務費 (自專案款項中扣除)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label htmlFor="audit-fee-inc-tax" className="text-brand-muted block mb-1 font-semibold">稽核費(含稅)</label>
              {readOnly ? (
                <span className="font-mono font-bold text-brand-text block text-sm">${auditFeeTaxIncluded.toLocaleString()}</span>
              ) : (
                <input
                  id="audit-fee-inc-tax"
                  type="number"
                  value={auditFeeTaxIncluded}
                  onChange={(e) => updateConfig('auditFeeTaxIncluded', Number(e.target.value))}
                  className="w-full text-xs p-1 rounded font-bold"
                />
              )}
            </div>
            <div>
              <span className="text-brand-muted block mb-1 font-semibold">稽核費(未稅)</span>
              <span className="font-mono font-bold text-brand-text block text-sm">${auditFeeTaxExcluded.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-brand-muted block mb-1 font-semibold">佔總項目比例</span>
              <span className="font-mono font-bold text-[#FBBF24] block text-sm">{auditFeeRatio}%</span>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  id="audit-deducted-chk"
                  type="checkbox"
                  checked={data.auditFeeTaxDeducted}
                  disabled={readOnly}
                  onChange={(e) => updateConfig('auditFeeTaxDeducted', e.target.checked)}
                  className="rounded text-brand-accent accent-brand-accent focus:ring-brand-accent"
                />
                <span className="text-xs text-brand-text font-medium">確認從專案款扣除</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Spreadsheet Grid */}
      <div className="overflow-x-auto border border-brand-border rounded-xl">
        <table className="w-full border-collapse border border-brand-border text-xs">
          <thead>
            <tr className="bg-brand-surface-alt text-brand-muted border-b border-brand-border">
              <th className="py-3 px-3 text-left w-36 border-r border-brand-border" rowSpan={2}>利潤率需 ≥20%</th>
              <th className="py-2.5 px-3 text-center border-r border-brand-border" colSpan={2}>114年比例參考</th>
              <th className="py-2.5 px-3 text-center border-r border-brand-border" colSpan={3}>自填欄位 預估支出</th>
              <th className="py-2.5 px-3 text-center border-r border-brand-border" colSpan={3}>自填欄位 實際支出 (結案報告)</th>
              <th className="py-2.5 px-3 text-center" rowSpan={2}>超支異常說明 / 其餘備註說明</th>
            </tr>
            <tr className="bg-brand-surface text-brand-muted border-b border-brand-border text-[10px]">
              <th className="py-2 px-2 text-right border-r border-brand-border w-24">合理支出</th>
              <th className="py-2 px-2 text-center border-r border-brand-border w-16">百分比%</th>
              <th className="py-2 px-2 text-right border-r border-brand-border w-24">預估支出</th>
              <th className="py-2 px-2 text-center border-r border-brand-border w-16">百分比%</th>
              <th className="py-2 px-2 text-center border-r border-brand-border w-20">結存/超支</th>
              <th className="py-2 px-2 text-right border-r border-brand-border w-24">實際支出</th>
              <th className="py-2 px-2 text-center border-r border-brand-border w-16">百分比%</th>
              <th className="py-2 px-2 text-center border-r border-brand-border w-20">超支與否</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            
            {/* Row 1: 稽核費稅損 (computed) */}
            <tr className="hover:bg-brand-bg/40 font-mono">
              <td className="py-2.5 px-3 font-sans font-extrabold text-brand-text border-r border-brand-border bg-brand-surface-alt">稽核費稅損</td>
              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-muted">${auditFeeTaxLoss.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">4.20%</td>
              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-text font-bold">${auditFeeTaxLoss.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-[#C5A059]">4.20%</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">-</td>
              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-text font-bold">${auditFeeTaxLoss.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-[#C5A059]">4.20%</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">-</td>
              <td className="py-2 px-3 text-brand-muted font-sans italic text-[11px]">固定稅損 = 220,000 * {data.taxRateSelection === '21%' ? '4.2%' : '3.2%'}</td>
            </tr>

            {/* Loop render rows */}
            {Object.entries(data.rows).map(([key, row]) => {
              const rKey = key as keyof typeof data.rows;
              const refItem = refValues[key];
              const estPct = quoteTaxExcluded > 0 ? (row.estimatedExpense / quoteTaxExcluded) * 100 : 0;
              const actPct = quoteTaxExcluded > 0 ? (row.actualExpense / quoteTaxExcluded) * 100 : 0;
              
              const isOver = row.actualExpense > refItem.amount;
              const estLeft = refItem.amount - row.estimatedExpense;

              // Hide estimating fields for fixed administrative ones, keep prefilled
              const isFixedRow = rKey === 'adminFee' || rKey === 'incomeTax';

              return (
                <tr key={key} className="hover:bg-brand-bg/40">
                  {/* Name */}
                  <td className="py-2.5 px-3 font-sans font-bold text-brand-text border-r border-brand-border bg-brand-surface-alt">
                    {row.name}
                  </td>
                  
                  {/* Reference Col B & C */}
                  <td className="py-2 px-2 text-right border-r border-brand-border text-brand-muted font-mono">
                    ${refItem.amount.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted font-mono">
                    {refItem.pct.toFixed(2)}%
                  </td>

                  {/* Estimate Col D, E, F */}
                  <td className="py-2 px-2 text-right border-r border-brand-border font-mono">
                    {readOnly || isFixedRow || phase === 'close' ? (
                      <span className="text-brand-text font-semibold">${row.estimatedExpense.toLocaleString()}</span>
                    ) : (
                      <input
                        type="number"
                        id={`est-input-${key}`}
                        value={row.estimatedExpense || ''}
                        onChange={(e) => updateRow(rKey, 'estimatedExpense', Number(e.target.value))}
                        className="w-full text-right p-1 text-xs border border-brand-border rounded bg-brand-bg font-bold font-mono text-brand-text"
                      />
                    )}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted font-mono">
                    {estPct.toFixed(2)}%
                  </td>
                  <td className={`py-2 px-2 text-center border-r border-brand-border text-[10px] font-bold ${estLeft >= 0 ? 'text-brand-success' : 'text-rose-400'}`}>
                    {estLeft >= 0 ? `餘 $${estLeft.toLocaleString()}` : `超 $${Math.abs(estLeft).toLocaleString()}`}
                  </td>

                  {/* Actual Col G, H, I */}
                  <td className="py-2 px-2 text-right border-r border-brand-border font-mono">
                    {readOnly || phase === 'quote' ? (
                      <span className="text-brand-text font-semibold">${row.actualExpense.toLocaleString()}</span>
                    ) : (
                      <input
                        type="number"
                        id={`act-input-${key}`}
                        value={row.actualExpense || ''}
                        onChange={(e) => updateRow(rKey, 'actualExpense', Number(e.target.value))}
                        className="w-full text-right p-1 text-xs border border-brand-border rounded bg-brand-bg font-bold font-mono text-[#C5A059]"
                      />
                    )}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted font-mono">
                    {actPct.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-center border-r border-brand-border text-[10px] font-bold">
                    {isOver ? (
                      <span className="text-rose-400 leading-none bg-rose-500/15 py-0.5 px-1 rounded border border-rose-500/20">
                        {row.name}超支
                      </span>
                    ) : (
                      <span className="text-brand-muted">-</span>
                    )}
                  </td>

                  {/* Note Col J */}
                  <td className="py-2 px-1 text-left">
                    {readOnly ? (
                      <span className="text-brand-text font-medium block px-2 italic">{row.note || '無'}</span>
                    ) : (
                      <input
                        type="text"
                        id={`note-input-${key}`}
                        value={row.note || ''}
                        placeholder="..."
                        onChange={(e) => updateRow(rKey, 'note', e.target.value)}
                        className="w-full text-left p-1 text-xs border border-brand-border rounded bg-brand-bg text-brand-text font-sans"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* EXPENSES ROW SUMMARY */}
            <tr className="bg-brand-surface-alt font-mono font-bold font-sans">
              <td className="py-3 px-3 text-left font-sans font-black text-[#FBBF24] border-r border-brand-border bg-brand-surface-alt">費用總計</td>
              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-muted">${standardRefTotalExpense.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">{standardRefTotalPercentage.toFixed(2)}%</td>
              
              <td className="py-2 px-2 text-right border-r border-brand-border text-[#FBBF24]">${estTotalExpense.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">{estTotalPercentage.toFixed(2)}%</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">-</td>

              <td className="py-2 px-2 text-right border-r border-brand-border text-[#FBBF24]">${actTotalExpense.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">{actTotalPercentage.toFixed(2)}%</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-muted">-</td>
              <td className="py-2 px-3 text-brand-muted font-sans font-normal italic">含固定稽核費稅損與全部費用項目</td>
            </tr>

            {/* PROFIT ROW SUMMARY */}
            <tr className="bg-brand-bg font-bold text-xs bg-brand-surface-alt border-t border-brand-border">
              <td className="py-3.5 px-3 text-left font-sans font-black text-brand-success border-r border-brand-border bg-brand-surface-alt">淨利潤金額</td>
              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-success font-mono">${refProfitAmount.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-success font-mono">{refProfitPercentage}%</td>

              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-success font-mono">${estProfit.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-success font-mono">
                <span className={isEstProfitTargetMet ? 'text-brand-success' : 'text-rose-400'}>
                  {estProfitPct.toFixed(2)}%
                </span>
              </td>
              <td className="py-2 px-1 text-center border-r border-brand-border text-[10px]">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-extrabold ${
                  isEstProfitTargetMet ? 'bg-emerald-500/20 text-brand-success' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isEstProfitTargetMet ? '利潤達標' : '利潤未達標'}
                </span>
              </td>

              <td className="py-2 px-2 text-right border-r border-brand-border text-brand-success font-mono">${actProfit.toLocaleString()}</td>
              <td className="py-2 px-2 text-center border-r border-brand-border text-brand-success font-mono">
                <span className={isActProfitTargetMet ? 'text-brand-success' : 'text-rose-400'}>
                  {actProfitPct.toFixed(2)}%
                </span>
              </td>
              <td className="py-2 px-1 text-center border-r border-brand-border text-[10px]">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-extrabold ${
                  isActProfitTargetMet ? 'bg-emerald-500/20 text-brand-success' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isActProfitTargetMet ? '利潤達標' : '利潤未達標'}
                </span>
              </td>
              <td className="py-2.5 px-3 text-brand-muted font-sans font-medium text-[11px]">目標淨利潤率門檻高於 20%</td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
