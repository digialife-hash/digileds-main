import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { PostProvider } from "./context/PostContext.jsx";
import { SocialProvider } from "./context/SocialContext.jsx";
import { Outlet } from "react-router-dom";

export default function SocialPostProviders({ children }) {
  const content = children || <Outlet />;

  return (
    <AuthProvider>
      <NotificationProvider>
        <SocialProvider>
          <PostProvider>{content}</PostProvider>
        </SocialProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
