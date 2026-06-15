import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardShell from "./pages/DashboardShell";

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardShell /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
