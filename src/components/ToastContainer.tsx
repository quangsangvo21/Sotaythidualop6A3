import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgClass = 'bg-white border-slate-200 text-slate-800';
        let IconComponent = Info;
        let iconColor = 'text-blue-600';

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-100';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-100';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-100';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-right-8 ${bgClass}`}
          >
            <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{toast.message}</p>
              {toast.subMessage && (
                <p className="text-xs text-slate-600 mt-1 opacity-90 leading-relaxed">{toast.subMessage}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
