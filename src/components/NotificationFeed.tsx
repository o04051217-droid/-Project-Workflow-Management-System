import { WorkflowNotification } from '../types';
import { Bell, Check, Clock, ShieldCheck, Mail, Send } from 'lucide-react';

interface NotificationFeedProps {
  notifications: WorkflowNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerDemoAlert: (type: 'contract' | 'reminder') => void;
}

export function NotificationFeed({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerDemoAlert
}: NotificationFeedProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Simulation triggers block */}
      <div className="lg:col-span-4 bg-slate-50 p-5 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Automated Workflows</span>
            <h3 className="font-bold text-sm text-slate-800 mt-1">
              自動化流程與通知模擬器 (Power Automate)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              系統在背景依據專案階段與付款應收日期進行時程警告或狀態通聯。點擊下方按鈕可手動觸發流程，測試各主辦人信件、警示自動化寄發。
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              id="trigger-contract-notification-btn"
              onClick={() => onTriggerDemoAlert('contract')}
              className="w-full text-left bg-white border border-slate-200 hover:border-indigo-400 p-2.5 rounded-xl transition shadow-sm hover:shadow text-xs flex items-start gap-2 group"
            >
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block text-xs group-hover:text-indigo-600">
                  模擬用印合約歸檔流程
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  自動觸發財務開立首期發票通知 (第一期發票)
                </span>
              </div>
            </button>

            <button
              type="button"
              id="trigger-reminder-notification-btn"
              onClick={() => onTriggerDemoAlert('reminder')}
              className="w-full text-left bg-white border border-slate-200 hover:border-amber-400 p-2.5 rounded-xl transition shadow-sm hover:shadow text-xs flex items-start gap-2 group"
            >
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block text-xs group-hover:text-amber-700">
                  帳期應收 7 天前提醒
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  對「啟動執行」中預估應收帳款之項目發信提醒 PM / 財務
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>🎯 架設於沙盒模擬環境</span>
          <span>系統狀態：正常運行</span>
        </div>
      </div>

      {/* Real notification list */}
      <div className="lg:col-span-8 p-5 flex flex-col justify-between min-h-[350px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 rounded-xl text-rose-600">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">當前流程執行通知紀錄</h3>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                  {unreadCount} 條未讀
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                id="mark-all-read-btn"
                onClick={onMarkAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                全部標記為已讀
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-slate-400 font-medium">尚無流程觸發事件與付款提醒通知</p>
                <p className="text-[10px] text-slate-400 mt-1">可點擊左側黃色與藍色按鈕觸發流程測試</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-all ${
                    n.isRead ? 'bg-white border-slate-200 text-slate-600' : 'bg-indigo-50/40 border-indigo-100 text-slate-800 shadow-sm'
                  } flex items-start justify-between gap-3`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50 truncate max-w-[200px]">
                        {n.projectName}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      id={`mark-read-btn-${n.id}`}
                      onClick={() => onMarkAsRead(n.id)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50 p-1 rounded-full transition-colors self-start"
                      title="標記已讀"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>📨 自動化電郵收發模擬</span>
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-emerald-500" />
            已與財務帳務模組即時串接
          </span>
        </div>
      </div>
    </div>
  );
}
