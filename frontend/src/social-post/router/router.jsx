import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import Dashboard from "../components/dashboard/Dashboard.jsx";
import CreatePost from "../components/dashboard/CreatePost.jsx";
import CreateDesign from "../components/dashboard/CreateDesign.jsx";
import Analytics from "../components/dashboard/Analytics.jsx";
import MediaLibrary from "../components/dashboard/MediaLibrary.jsx";
import PostHistory from "../components/dashboard/PostHistory.jsx";
import ScheduledPosts from "../components/dashboard/ScheduledPosts.jsx";
import Settings from "../components/dashboard/Settings.jsx";
import SocialAccounts from "../components/dashboard/SocialAccounts.jsx";
import Engagement from "../components/dashboard/Engagement.jsx";
import ConnectedPlatforms from "../components/dashboard/ConnectedPlatforms.jsx";
import ReconnectAccounts from "../components/dashboard/ReconnectAccounts.jsx";
import PlatformPerformance from "../components/dashboard/PlatformPerformance.jsx";
import Audience from "../components/dashboard/Audience.jsx";
import ContentPerformance from "../components/dashboard/ContentPerformance.jsx";
import Team from "../components/dashboard/Team.jsx";
import Security from "../components/dashboard/Security.jsx";
import ContentLibrary from "../components/dashboard/ContentLibrary.jsx";
import PublishingQueue from "../components/dashboard/PublishingQueue.jsx";
import HashtagResearch from "../components/dashboard/HashtagResearch.jsx";
import Notifications from "../components/dashboard/Notifications.jsx";

export const socialRouteObjects = [
  {
    path: "/social-post",
    element: <Navigate to="/dashboard" replace />,
  },
  { path: "/social-post/login", element: <Navigate to="/login" replace /> },
  { path: "/social-post/register", element: <Navigate to="/signup" replace /> },
  { path: "/social-post/forgot-password", element: <Navigate to="/forgot-password" replace /> },
  { path: "/social-post/reset-password", element: <Navigate to="/reset-password" replace /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/dashboard/create-post", element: <CreatePost /> },
          { path: "/dashboard/design", element: <CreateDesign /> },
          { path: "/dashboard/analytics", element: <Analytics /> },
          { path: "/dashboard/media", element: <MediaLibrary /> },
          { path: "/dashboard/history", element: <PostHistory /> },
          { path: "/dashboard/scheduled", element: <ScheduledPosts /> },
          { path: "/dashboard/social-accounts", element: <SocialAccounts /> },
          { path: "/dashboard/engagement", element: <Engagement /> },
          { path: "/dashboard/calendar", element: <ScheduledPosts /> },
          { path: "/dashboard/posts", element: <PostHistory /> },
          { path: "/dashboard/posts/:id/edit", element: <CreatePost /> },
          { path: "/dashboard/posts/:status", element: <PostHistory /> },
          { path: "/dashboard/social-accounts/platforms", element: <ConnectedPlatforms /> },
          { path: "/dashboard/social-accounts/reconnect", element: <ReconnectAccounts /> },
          { path: "/dashboard/analytics/platforms", element: <PlatformPerformance /> },
          { path: "/dashboard/analytics/audience", element: <Audience /> },
          { path: "/dashboard/analytics/content", element: <ContentPerformance /> },
          { path: "/dashboard/team", element: <Team /> },
          { path: "/dashboard/security", element: <Security /> },
          { path: "/dashboard/content-library", element: <ContentLibrary /> },
          { path: "/dashboard/publishing-queue", element: <PublishingQueue /> },
          { path: "/dashboard/hashtags", element: <HashtagResearch /> },
          { path: "/dashboard/notifications", element: <Notifications /> },
          { path: "/dashboard/settings", element: <Settings /> },
        ],
      },
    ],
  },
];
