import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  Users as UsersIcon,
  UserCog,
  Archive,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function NavItem({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link to={to} className="block" title={collapsed ? label : undefined}>
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-3"
        } px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-amber-100 text-[#CD5C08]"
            : "text-gray-700 hover:bg-amber-50 hover:text-[#CD5C08]"
        }`}
      >
        <Icon size={18} />
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } min-h-screen bg-white border-r border-gray-200 sticky top-0 transition-[width] duration-200`}
    >
      <div className={`px-4 py-4 border-b ${collapsed ? "px-2" : "px-4"}`}>
        <Link
          to={user ? "/dashboard" : "/login"}
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-2"
          }`}
        >
          <img
            src="/NutriBin_Logo.svg"
            alt="NutriBin Logo"
            className="h-8 w-auto"
          />
          {!collapsed && (
            <span className="font-extrabold text-[#CD5C08]">NutriBin</span>
          )}
        </Link>
        <div
          className={`mt-3 ${collapsed ? "flex justify-center" : "text-right"}`}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-amber-50 text-gray-600"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronsRight size={18} />
            ) : (
              <ChevronsLeft size={18} />
            )}
          </button>
        </div>
      </div>

      <nav className={`py-3 space-y-1 ${collapsed ? "px-1" : "px-3"}`}>
        <NavItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/dashboard")}
          collapsed={collapsed}
        />
        <NavItem
          to="/machine"
          icon={Cpu}
          label="Machines"
          active={isActive("/machine")}
          collapsed={collapsed}
        />
        <NavItem
          to="/repair"
          icon={Wrench}
          label="Repairs"
          active={isActive("/repair")}
          collapsed={collapsed}
        />
        {user?.role === "admin" && (
          <NavItem
            to="/staff"
            icon={UserCog}
            label="Staff"
            active={isActive("/staff")}
            collapsed={collapsed}
          />
        )}
        <NavItem
          to="/users"
          icon={UsersIcon}
          label="Users"
          active={isActive("/users")}
          collapsed={collapsed}
        />
        {user?.role === "admin" && (
          <NavItem
            to="/archives"
            icon={Archive}
            label="Archives"
            active={isActive("/archives")}
            collapsed={collapsed}
          />
        )}
      </nav>

      <div className={`${collapsed ? "px-1" : "px-3"} py-3 mt-auto`}>
        {user && (
          <div
            className={`${
              collapsed
                ? "flex justify-center mb-2"
                : "flex items-center gap-3 mb-3 px-2 py-2 rounded-md bg-amber-50 border border-amber-100"
            }`}
            title={
              collapsed
                ? `${user.first_name} ${user.last_name} — ${user.email}`
                : undefined
            }
          >
            <Avatar className="size-9">
              <AvatarImage alt={user.first_name} />
              <AvatarFallback className="bg-[#CD5C08]/10 text-[#CD5C08] font-bold">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}

        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          active={isActive("/settings")}
          collapsed={collapsed}
        />
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${
            collapsed ? "justify-center" : "justify-start"
          } text-gray-700 hover:text-red-600`}
          title="Logout"
        >
          <LogOut size={18} className={`${collapsed ? "mr-0" : "mr-2"}`} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
