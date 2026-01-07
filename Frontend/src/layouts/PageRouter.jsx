import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import Login from "@/pages/Login";
import Machines from "@/pages/Machines";
import Modules from "@/pages/Modules";
import { Routes, Route, Navigate } from "react-router-dom";
import Staff from "@/pages/Staff";
import Users from "@/pages/Users";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import About from "@/pages/About";
import Faqs from "@/pages/Faqs";
import Tos from "@/pages/Tos";
import Socials from "@/pages/Socials";
import Studies from "@/pages/Studies";
import Guide from "@/pages/Guide";

function PageRouter() {
  return (
    <Routes>
      <Route path="*" element={<h1>404 Not Found</h1>} />
      <Route path="/" element={<Navigate replace to={"/login"} />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/machines"
        element={
          <ProtectedRoute>
            <Machines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/machines/:user_id"
        element={
          <ProtectedRoute>
            <Modules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/machines/:user_id/:module_id"
        element={
          <ProtectedRoute>
            <Machines />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/faqs" element={<Faqs />} />
      <Route path="/policies" element={<Tos />} />
      <Route path="/socials" element={<Socials />} />
      <Route path="/studies" element={<Studies />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/guides" element={<Guide />} />
    </Routes>
  );
}

export default PageRouter;
