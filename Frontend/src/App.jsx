import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import History from "./pages/History";
import Goals from "./pages/Goal";
import Pocket from "./pages/Pocket";
import Profil from "./pages/Profil";
import Register from "./auth/registerForm";
import Login from "./auth/loginForm";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import ProtectedRoute from "./context/protectedRoute";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster
        richColors="true"
        position="top-center"
        theme={theme}
        toastOptions={{
          style: {
            width: "min(400px, calc(100vw - 2rem))",
            maxWidth: "400px",
            fontSize: "16px",
            padding: "18px 22px",
            borderRadius: "12px",
          },
        }}
      />
      <AppRoutes theme={theme} setTheme={setTheme} />
    </BrowserRouter>
  );
}

function AppRoutes({ theme, setTheme }) {
  const location = useLocation();
  const authPaths = [
    "/register",
    "/login",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {!isAuthPage && (
        <div className="layout">
          <nav>
            <Sidebar />
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Dashboard />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    {" "}
                    <History />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Goals />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pocket"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Pocket />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profil"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Profil theme={theme} setTheme={setTheme} />{" "}
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
