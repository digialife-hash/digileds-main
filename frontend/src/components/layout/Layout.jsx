import { Outlet } from "react-router-dom";
import Navbar from "../ui/Navbar";
import Footer from "../ui/Footer";
import NeedHelp from "../ui/NeedHelp";
import VisitorTracker from "../analytics/VisitorTracker";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <NeedHelp />
      <VisitorTracker />
    </>
  );
}

export default Layout;
