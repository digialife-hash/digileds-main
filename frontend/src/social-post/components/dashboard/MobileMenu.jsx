import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, Clock3, FileText, Image, LayoutDashboard, Link2, Mail, MessageCircle, PlusSquare, RefreshCw, Search, Settings, ShieldCheck, Users, X } from "lucide-react";

const sections = [
  { title: "Workspace", items: [
    [LayoutDashboard, "Overview", "/dashboard"],
    [PlusSquare, "Create post", "/dashboard/create-post"],
    [CalendarDays, "Content calendar", "/dashboard/calendar"],
    [Image, "Media library", "/dashboard/media"],
  ] },
  { title: "Posts", items: [
    [FileText, "All posts", "/dashboard/posts"],
    [FileText, "Drafts", "/dashboard/posts/drafts"],
    [Clock3, "Scheduled", "/dashboard/posts/scheduled"],
    [FileText, "Published", "/dashboard/posts/published"],
    [FileText, "Failed", "/dashboard/posts/failed"],
  ] },
  { title: "Management", items: [
    [Link2, "All accounts", "/dashboard/social-accounts"],
    [RefreshCw, "Connected platforms", "/dashboard/social-accounts/platforms"],
    [RefreshCw, "Reconnect accounts", "/dashboard/social-accounts/reconnect"],
    [MessageCircle, "Engagement", "/dashboard/engagement"],
    [BarChart3, "Analytics", "/dashboard/analytics"],
    [BarChart3, "Platform performance", "/dashboard/analytics/platforms"],
    [Users, "Audience", "/dashboard/analytics/audience"],
    [Search, "Content performance", "/dashboard/analytics/content"],
  ] },
  { title: "Tools", items: [
    [Mail, "Content library", "/dashboard/content-library"],
    [RefreshCw, "Publishing queue", "/dashboard/publishing-queue"],
    [Search, "Hashtag research", "/dashboard/hashtags"],
    [Mail, "Notifications", "/dashboard/notifications"],
  ] },
  { title: "System", items: [
    [Settings, "General settings", "/dashboard/settings"],
    [Users, "Team", "/dashboard/team"],
    [ShieldCheck, "Security", "/dashboard/security"],
  ] },
];

export default function MobileMenu({ open, onClose }) {
  return <>
    <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col bg-stone-950 p-4 text-stone-400 shadow-2xl transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white font-serif text-lg font-bold italic text-stone-900">S</div><p className="font-semibold text-white">Socially</p></div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-stone-800 hover:text-white" aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {sections.map((section) => <div key={section.title} className="mb-5"><p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.2em] text-stone-600">{section.title}</p>{section.items.map(([Icon, label, to]) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-white text-stone-950" : "hover:bg-stone-900 hover:text-white"}`}><Icon size={16} /><span>{label}</span></NavLink>)}</div>)}
      </nav>
    </aside>
  </>;
}
