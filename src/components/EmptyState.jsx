import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-500"><Inbox size={20} /></div>
      <h3 className="mt-4 font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    </div>
  );
}
