import React, { useState } from 'react';
import { CostItem } from '../types';
import { Plus, Trash, DollarSign } from 'lucide-react';

interface CostCalculatorProps {
  items: CostItem[];
  onChange: (items: CostItem[]) => void;
  proposalAmount: number;
  onProposalChange?: (amount: number) => void;
  readOnly: boolean;
}

export function CostCalculator({
  items,
  onChange,
  proposalAmount,
  onProposalChange,
  readOnly
}: CostCalculatorProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'human' | 'travel' | 'material' | 'other'>('human');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || unitCost <= 0 || quantity <= 0) return;

    const newItem: CostItem = {
      id: `cost-${Date.now()}`,
      name: name.trim(),
      category,
      unitCost,
      quantity
    };

    onChange([...items, newItem]);
    setName('');
    setUnitCost(0);
    setQuantity(1);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'human': return '👨‍💼 人力顧問輔導';
      case 'travel': return '🚗 差旅交通';
      case 'material': return '📚 教材物料耗材';
      default: return '⚙️ 其他開銷';
    }
  };

  const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const netProfit = proposalAmount - totalCost;
  const marginPercentage = proposalAmount > 0 ? (netProfit / proposalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          成本與獲利即時核估工具
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">專案預算報價 (NTD)</span>
            {readOnly || !onProposalChange ? (
              <span className="text-lg font-bold text-indigo-700 block mt-1">
                ${proposalAmount.toLocaleString()}
              </span>
            ) : (
              <input
                id="proposal-amount-val"
                type="number"
                value={proposalAmount}
                onChange={(e) => onProposalChange(Number(e.target.value))}
                className="w-full text-lg font-bold text-indigo-700 mt-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 p-1"
                min="0"
              />
            )}
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">估算總成本 (NTD)</span>
            <span className="text-lg font-bold text-rose-600 block mt-1">
              ${totalCost.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">專案預估毛利率 (%)</span>
            <span className={`text-lg font-bold block mt-1 ${marginPercentage >= 35 ? 'text-emerald-600' : marginPercentage >= 15 ? 'text-amber-600' : 'text-rose-600'}`}>
              {marginPercentage.toFixed(1)}% ({netProfit >= 0 ? '盈餘' : '虧損'}: ${Math.abs(netProfit).toLocaleString()})
            </span>
            <span className="text-[10px] text-slate-400">專案基本健康水位建議高於 35%</span>
          </div>
        </div>
      </div>

      {/* Adding item form */}
      {!readOnly && (
        <form onSubmit={handleAddItem} className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">新增成本明細項目</h5>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label htmlFor="cost-item-name" className="block text-xs text-slate-600 mb-1">細項名稱</label>
              <input
                id="cost-item-name"
                type="text"
                placeholder="例如: 顧問人天費(林教授)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="cost-item-category" className="block text-xs text-slate-600 mb-1">分類</label>
              <select
                id="cost-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="human">👨‍💼 人力顧問輔導</option>
                <option value="travel">🚗 差旅交通</option>
                <option value="material">📚 教材物料耗材</option>
                <option value="other">⚙️ 其他開銷</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cost-item-price" className="block text-xs text-slate-600 mb-1">單價 (NTD)</label>
              <input
                id="cost-item-price"
                type="number"
                min="0"
                value={unitCost || ''}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="cost-item-qty" className="block text-xs text-slate-600 mb-1">數量</label>
              <input
                id="cost-item-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                id="add-cost-item-btn"
                className="w-full bg-slate-800 text-white hover:bg-slate-700 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                新增細項
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
              <th className="py-2.5 px-4">成本項目名稱</th>
              <th className="py-2.5 px-4 text-center">類別</th>
              <th className="py-2.5 px-4 text-right">單價 (NTD)</th>
              <th className="py-2.5 px-4 text-center">數量</th>
              <th className="py-2.5 px-4 text-right">小計</th>
              {!readOnly && <th className="py-2.5 px-4 text-center w-12">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  尚未建立任何成本明細。請輸入並點擊「新增細項」。
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-700">{item.name}</td>
                  <td className="py-2.5 px-4 text-center text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                      {getCategoryLabel(item.category)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">${item.unitCost.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center text-slate-600 font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                    ${(item.unitCost * item.quantity).toLocaleString()}
                  </td>
                  {!readOnly && (
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        id={`delete-cost-item-${item.id}`}
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors"
                        title="刪除"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
