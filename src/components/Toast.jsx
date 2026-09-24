import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className="fixed right-4 top-4 z-[100] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex gap-3">
        <div className={`mt-0.5 ${isError ? 'text-rose-500' : 'text-emerald-500'}`}>
          {isError ? <XCircle size={19} /> : <CheckCircle2 size={19} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{isError ? 'Could not complete action' : 'Done'}</p>
          <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">×</button>
      </div>
    </div>
  );
}
