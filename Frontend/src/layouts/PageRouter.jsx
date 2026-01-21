import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import Account from "@/pages/Account";
import Sales from "@/pages/Sales";
import Fertilizer from "@/pages/Fertilizer";
import Firmware from "@/pages/Firmware";
import Login from "@/pages/Login";
import PasswordReset from "@/pages/PasswordReset";
import { VerifyMFA } from "@/pages/VerifyMFA";
import { VerifyMFASMS } from "@/pages/VerifyMFASMS";
import Machines from "@/pages/Machines";
import MachinesGrid from "@/pages/MachinesGrid";
import Modules from "@/pages/Modules";
import MachineDetails from "@/pages/MachineDetails";
import { Routes, Route, Navigate } from "react-router-dom";
import Staff from "@/pages/Staff";
import Users from "@/pages/Users";
import Archives from "@/pages/Archives";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import About from "@/pages/About";
import Faqs from "@/pages/Faqs";
import Tos from "@/pages/Tos";
import Socials from "@/pages/Socials";
import Studies from "@/pages/Studies";
import Guide from "@/pages/Guide";
import Announcements from "@/pages/Announcements";
import Emissions from "@/pages/Emissions";
import Home from "@/pages/Home";
import LoginRecords from "@/pages/LoginRecords";
import MfaRecords from "@/pages/MfaRecords";
import { useUser } from "@/contexts/UserContext";

function RootRedirect() {
  const { user } = useUser();
  return <Navigate replace to={user ? "/dashboard" : "/login"} />;
}

function LoginRoute() {
  const { user } = useUser();
  if (user) {
    return <Navigate replace to="/dashboard" />;
  }
  return <Login />;
}

function PasswordResetRoute() {
  const { user } = useUser();
  if (user) return <Navigate replace to="/dashboard" />;
  return <PasswordReset />;
}

function FallbackRoute() {
  const { user } = useUser();
  return <Navigate replace to={user ? "/dashboard" : "/login"} />;
}

function PageRouter() {
  return (
    <Routes>
      <Route path="*" element={<FallbackRoute />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/password-reset" element={<PasswordResetRoute />} />
      <Route path="/verify-mfa" element={<VerifyMFA />} />
      <Route path="/verify-mfasms" element={<VerifyMFASMS />} />

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
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/archives"
        element={
          <ProtectedRoute>
            <Archives />
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
        path="/fertilizer"
        element={
          <ProtectedRoute>
            <Fertilizer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/machine"
        element={
          <ProtectedRoute>
            <MachinesGrid />
          </ProtectedRoute>
        }
      />
      <Route
        path="/machine/:machineId"
        element={
          <ProtectedRoute>
            <MachineDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repairs"
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
      <Route
        path="/firmware"
        element={
          <ProtectedRoute>
            <Firmware />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emissions"
        element={
          <ProtectedRoute>
            <Emissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login-records"
        element={
          <ProtectedRoute>
            <LoginRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mfa-records"
        element={
          <ProtectedRoute>
            <MfaRecords />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/faqs" element={<Faqs />} />
      <Route path="/policies" element={<Tos />} />
      <Route path="/socials" element={<Socials />} />
      <Route path="/studies" element={<Studies />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/home" element={<Home />} />
      <Route path="/guides" element={<Guide />} />
    </Routes>
  );
}

export default PageRouter;
