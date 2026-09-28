import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";

const LegalSiteLinks = () => {
  return (
    <footer className="fixed bottom-3 right-3 z-50 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur">
      <span className="hidden text-slate-400 sm:inline">Digital Alife Pvt Ltd</span>
      <Link to={ROUTES.TERMS_AND_CONDITIONS} className="text-slate-600 hover:text-blue-700">
        Terms & Conditions
      </Link>
      <span className="text-slate-300">|</span>
      <Link to={ROUTES.PRIVACY_POLICY} className="text-slate-600 hover:text-blue-700">
        Privacy Policy
      </Link>
    </footer>
  );
};

export default LegalSiteLinks;
