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
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// eslint-disable-next-line no-unused-vars
function NavItem({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link to={to} className="block" title={collapsed ? label : undefined}>
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-3"
        } px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-[#4F6F52] text-white"
            : "text-gray-700 hover:bg-[#ECE3CE]/35 hover:text-[#4F6F52]"
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
  const [sidebarMode, setSidebarMode] = useState(() => {
    const saved = localStorage.getItem("sidebar:mode");
    return saved || "expanded";
  });
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar:mode");
    return saved === "collapsed";
  });
  const [isHovering, setIsHovering] = useState(false);

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  useEffect(() => {
    localStorage.setItem("sidebar:mode", sidebarMode);
    if (sidebarMode === "collapsed") {
      setCollapsed(true);
    } else if (sidebarMode === "expanded") {
      setCollapsed(false);
    }
  }, [sidebarMode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const shouldCollapse = collapsed && !isHovering;

  return (
    <aside
      className={`${
        shouldCollapse ? "w-16" : "w-60"
      } min-h-screen bg-white border-r border-gray-200 sticky top-0 transition-[width] duration-200`}
      onMouseEnter={() => {
        if (sidebarMode === "hover") setIsHovering(true);
      }}
      onMouseLeave={() => {
        if (sidebarMode === "hover") setIsHovering(false);
      }}
    >
      <div className={`px-4 py-4 border-b ${shouldCollapse ? "px-2" : "px-4"}`}>
        <Link
          to={user ? "/dashboard" : "/login"}
          className={`flex items-center ${
            shouldCollapse ? "justify-center" : "gap-2"
          }`}
        >
          <img src="/Logo.svg" alt="NutriBin Logo" className="h-8 w-auto" />
          {!shouldCollapse && (
            <span className="font-extrabold text-[#4F6F52] text-4xl">
              NutriBin
            </span>
          )}
        </Link>
      </div>

      <nav className={`py-3 space-y-1 ${shouldCollapse ? "px-1" : "px-3"}`}>
        <NavItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/dashboard")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/machine"
          icon={Cpu}
          label="Machines"
          active={isActive("/machine")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/repair"
          icon={Wrench}
          label="Repairs"
          active={isActive("/repair")}
          collapsed={shouldCollapse}
        />
        {user?.role === "admin" && (
          <NavItem
            to="/staff"
            icon={UserCog}
            label="Staff"
            active={isActive("/staff")}
            collapsed={shouldCollapse}
          />
        )}
        <NavItem
          to="/users"
          icon={UsersIcon}
          label="Users"
          active={isActive("/users")}
          collapsed={shouldCollapse}
        />
        {user?.role === "admin" && (
          <NavItem
            to="/archives"
            icon={Archive}
            label="Archives"
            active={isActive("/archives")}
            collapsed={shouldCollapse}
          />
        )}
      </nav>

      <div
        className={`${shouldCollapse ? "px-1" : "px-3"} py-3 mt-auto space-y-3`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center ${
                shouldCollapse ? "justify-center" : "justify-between px-2"
              } py-2 rounded-md text-xs font-medium text-gray-600 hover:bg-amber-50 transition-colors`}
              title="Sidebar control"
            >
              {!shouldCollapse ? (
                <>
                  <span>Sidebar control</span>
                  <ChevronDown size={14} />
                </>
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sidebar Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sidebarMode}
              onValueChange={setSidebarMode}
            >
              <DropdownMenuRadioItem value="expanded">
                Expanded
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="collapsed">
                Collapsed
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="hover">
                Expand on hover
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 text-gray-700"
            >
              {shouldCollapse ? "Expand" : "Collapse"}
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <div
            className={`${
              shouldCollapse
                ? "flex justify-center"
                : "flex items-center gap-3 px-2 py-2 rounded-md bg-amber-50 border border-amber-100"
            }`}
            title={
              shouldCollapse
                ? `${user.first_name} ${user.last_name} — ${user.email}`
                : undefined
            }
          >
            <Avatar className="size-9">
              <AvatarImage alt={user.first_name} />
              <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            {!shouldCollapse && (
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
          collapsed={shouldCollapse}
        />
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${
            shouldCollapse ? "justify-center" : "justify-start"
          } text-gray-700 hover:text-red-600`}
          title="Logout"
        >
          <LogOut size={18} className={`${shouldCollapse ? "mr-0" : "mr-2"}`} />
          {!shouldCollapse && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
