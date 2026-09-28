export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-5 dark:bg-black/70" onClick={onClose}><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-slate-100" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold">{title}</h3><button className="text-2xl text-stone-400 dark:text-slate-500" onClick={onClose}>×</button></div>{children}</div></div>
}