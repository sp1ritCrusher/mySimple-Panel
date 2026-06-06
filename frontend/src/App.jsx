import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ValidateCodePage from "./pages/ValidateCodePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import RecoverPasswordPage from "./pages/RecoverPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductFormPage from "./pages/ProductFormPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminLogsPage from "./pages/admin/AdminLogsPage.jsx";
import AdminLogDetailPage from "./pages/admin/AdminLogDetailPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/validate-code" element={<ValidateCodePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/recover-password" element={<RecoverPasswordPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <ProtectedRoute adminOnly>
              <AdminLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/logs/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminLogDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
