export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = variant === 'ghost'
    ? 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
    : 'bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`} {...props}>{children}</button>
}