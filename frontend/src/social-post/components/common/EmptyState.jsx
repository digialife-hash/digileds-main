export default function EmptyState({ title = 'Nothing here yet', text = 'Your content will appear here.' }) {
  return <div className="py-12 text-center text-stone-400 dark:text-slate-500"><span className="text-3xl">◌</span><h3 className="mt-3 font-bold text-stone-700 dark:text-slate-200">{title}</h3><p className="mt-1 text-sm">{text}</p></div>
}