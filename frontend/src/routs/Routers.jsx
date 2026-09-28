import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import Home from "../components/page/Home";
import Abouts from "../components/page/Abouts";
import WhyChooseUs from "../components/page/WhychUs";
import WebDevelopment from "../components/services/WebDevelopment";
import MobileAppDevelopment from "../components/services/MobileAppDevelopment";
import Ecommerce from "../components/services/Ecommerce";
import DigitalMarketing from "../components/services/DigitalMarketing";
import GoogleSEO from "../components/services/GoogleSEO";
import SocialMediaHandling from "../components/services/SocialMediaHandling";
import MetaAds from "../components/services/MetaAds";
import GoogleAds from "../components/services/GoogleAds";
import WhatsAppMarketing from "../components/services/WhatsAppMarketing";
import EmailMarketing from "../components/services/EmailMarketing";
import VideoEditing from "../components/services/VideoEditing";
import CustomSoftware from "../components/services/CustomSoftware";
import UIUXDesign from "../components/services/UIUXDesign";
import GraphicsDesign from "../components/services/GraphicsDesign";
import Careers from "../components/page/Careers";
import DevelopmentProcess from "../components/page/DevelopmentProcess";
import Contact from "../components/page/Contact";
import Quote from "../components/page/Quote";
import NotFound from "../components/page/NotFound";
import OurTeam from "../components/ui/OurTeam";
import Demo from "../components/page/Demo";
import Subcription from "../components/page/Subcription";
import PolicyPage from "../components/page/PolicyPage";
import CompanyProfile from "../components/page/CompanyProfile";

import DemoProjectsPage from "../demo/demo-projects/DemoProjectsPage";
import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";
import AuthPage from "../components/auth/AuthPage";
import ResetPasswordPage from "../components/auth/ResetPasswordPage";
import NoDashboardPage from "../components/auth/NoDashboardPage";
import { socialRouteObjects } from "../social-post/router/router";
import SocialPostProviders from "../social-post/SocialPostProviders";
import { officeRouteObjects } from "../office-management/routes/officeRouteConfig";
import ProductAds from "../components/page/ProductAds";
import Profile from "../components/page/Profile";
import Purchases from "../components/ui/Purchases";

const getRouterBasename = () => {
  if (typeof window === "undefined") return "/";
  const match = window.location.pathname.match(/^\/d\/[^/]+/i);
  return match ? match[0] : "/";
};

const namespaceRoutes = (routes, namespace, parentIndex = "") =>
  routes.map((route, index) => {
    const routeIndex = parentIndex ? `${parentIndex}-${index}` : `${index}`;

    return {
      ...route,
      id: `${namespace}-${routeIndex}`,
      children: route.children
        ? namespaceRoutes(route.children, namespace, routeIndex)
        : undefined,
    };
  });

const namespacedSocialRoutes = namespaceRoutes(socialRouteObjects, "social");
const namespacedOfficeRoutes = namespaceRoutes(officeRouteObjects, "office");

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "about", element: <Abouts /> },
        { path: "why-us", element: <WhyChooseUs /> },
        { path: "services/web-development", element: <WebDevelopment /> },
        {
          path: "services/mobile-app-development",
          element: <MobileAppDevelopment />,
        },
        { path: "services/e-commerce", element: <Ecommerce /> },
        { path: "services/digital-marketing", element: <DigitalMarketing /> },
        { path: "services/google-seo", element: <GoogleSEO /> },
        {
          path: "services/social-media-handling",
          element: <SocialMediaHandling />,
        },
        { path: "services/meta-ads", element: <MetaAds /> },
        { path: "services/google-ads", element: <GoogleAds /> },
        { path: "services/whatsapp-marketing", element: <WhatsAppMarketing /> },
        { path: "services/email-marketing", element: <EmailMarketing /> },
        { path: "services/video-editing", element: <VideoEditing /> },
        { path: "services/custom-software", element: <CustomSoftware /> },
        { path: "services/ui-ux-design", element: <UIUXDesign /> },
        { path: "services/graphics-design", element: <GraphicsDesign /> },
        { path: "careers", element: <Careers /> },
        { path: "development-process", element: <DevelopmentProcess /> },
        { path: "subcription", element: <Subcription /> },
        { path: "contact", element: <Contact /> },
        { path: "quote", element: <Quote /> },
        { path: "team", element: <OurTeam /> },
        { path: "demo", element: <Demo /> },
        // CHANGED: ":id" add kiya taaki har ad apne alag id ke saath
        // /product_ads/1, /product_ads/2, ... pe khul sake.
        { path: "product_ads/:id", element: <ProductAds /> },
        { path: "profile", element: <Profile /> },
        { path: "profile/purchases", element: <Purchases /> },
        // Purana "/product_ads" (bina id) ab home pe redirect ho jayega
        { path: "product_ads", element: <Navigate to="/" replace /> },
        { path: "company-profile", element: <CompanyProfile /> },
        { path: "privacy-policy", element: <PolicyPage type="privacy" /> },
        { path: "cookie-policy", element: <PolicyPage type="cookies" /> },
      ],
    },
    { path: "/login", element: <AuthPage mode="login" /> },
    { path: "/signup", element: <AuthPage mode="signup" /> },
    { path: "/forgot-password", element: <AuthPage mode="forgot" /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/no-dashboard", element: <NoDashboardPage /> },
    {
      path: "/admin/dashboard/*",
      element: (
        <ProtectedAdminRoute>
          <DemoProjectsPage />
        </ProtectedAdminRoute>
      ),
    },
    {
      element: <SocialPostProviders />,
      children: namespacedSocialRoutes,
    },
    ...namespacedOfficeRoutes,
    {
      path: "/social-pos/*",
      element: <Navigate to="/social-post/login" replace />,
    },
    { path: "*", element: <NotFound /> },
  ],
  {
    basename: getRouterBasename(),
  },
);

export default router;