import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  DollarSign,
  HardDrive,
  Beaker,
  Cloud,
  Megaphone,
  Bell,
  Activity,
  LogIn,
  Users as UsersIcon,
  UserCog,
  Archive,
  Key,
  Settings,
  LogOut,
  ChevronDown,
  Camera,
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

function NavItem({ to, icon, label, active, collapsed }) {
  const Icon = icon;
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

function CategoryLabel({ label, collapsed }) {
  if (collapsed) return null;
  return (
    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {label}
    </div>
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
    setCollapsed(sidebarMode === "collapsed");
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
        shouldCollapse
          ? "w-16 min-w-[4rem] max-w-[4rem]"
          : "w-60 min-w-[15rem] max-w-[15rem]"
      } h-screen bg-white border-r border-gray-200 sticky top-0 left-0 z-40 transition-[width] duration-200 flex flex-col shadow-sm`}
      onMouseEnter={() => {
        if (sidebarMode === "hover") setIsHovering(true);
      }}
      onMouseLeave={() => {
        if (sidebarMode === "hover") setIsHovering(false);
      }}
    >
      <div
        className={`flex-shrink-0 px-4 py-4 border-b ${shouldCollapse ? "px-2" : "px-4"}`}
      >
        <Link
          to={user ? "/dashboard" : "/login"}
          className={`flex items-center ${
            shouldCollapse ? "justify-center" : "gap-2"
          }`}
        >
          <img src="/Logo.svg" alt="NutriBin Logo" className="h-8 w-auto" />
          {!shouldCollapse && (
            <span className="font-extrabold text-[#4F6F52] text-3xl tracking-tight">
              NutriBin
            </span>
          )}
        </Link>
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-3 space-y-1 ${shouldCollapse ? "px-1" : "px-3"} custom-scrollbar`}
      >
        <CategoryLabel label="Overview" collapsed={shouldCollapse} />
        <NavItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/dashboard")}
          collapsed={shouldCollapse}
        />

        <CategoryLabel label="Operations" collapsed={shouldCollapse} />
        <NavItem
          to="/fertilizer"
          icon={Beaker}
          label="Fertilizer"
          active={isActive("/fertilizer")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/emissions"
          icon={Cloud}
          label="Emissions"
          active={isActive("/emissions")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/camera-logs"
          icon={Camera}
          label="Camera Logs"
          active={isActive("/camera-logs")}
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
          to="/repairs"
          icon={Wrench}
          label="Repairs"
          active={isActive("/repairs")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/sales"
          icon={DollarSign}
          label="Sales"
          active={isActive("/sales")}
          collapsed={shouldCollapse}
        />

        <CategoryLabel label="Management" collapsed={shouldCollapse} />
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
        <NavItem
          to="/serial"
          icon={Key}
          label="Serials"
          active={isActive("/serial")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/announcements"
          icon={Megaphone}
          label="Announcements"
          active={isActive("/announcements")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/machine-notifications"
          icon={Bell}
          label="Machine Notifications"
          active={isActive("/machine-notifications")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/login-records"
          icon={LogIn}
          label="Login Records"
          active={isActive("/login-records")}
          collapsed={shouldCollapse}
        />
        <NavItem
          to="/mfa-records"
          icon={Key}
          label="MFA Records"
          active={isActive("/mfa-records")}
          collapsed={shouldCollapse}
        />

        {user?.role === "admin" && (
          <>
            <CategoryLabel label="System" collapsed={shouldCollapse} />
            <NavItem
              to="/firmware"
              icon={HardDrive}
              label="Firmware"
              active={isActive("/firmware")}
              collapsed={shouldCollapse}
            />
            <NavItem
              to="/archives"
              icon={Archive}
              label="Archives"
              active={isActive("/archives")}
              collapsed={shouldCollapse}
            />
          </>
        )}
      </nav>

      <div
        className={`flex-shrink-0 border-t border-gray-100 ${shouldCollapse ? "px-1" : "px-3"} py-3 mt-auto space-y-3 bg-white`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center ${
                shouldCollapse ? "justify-center" : "justify-between px-2"
              } py-2 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors`}
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
          <DropdownMenuContent align="start" className="w-48 ml-2">
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
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <div
            className={`${
              shouldCollapse
                ? "flex justify-center"
                : "flex items-center gap-3 px-2 py-2 rounded-md bg-[#FAF9F6] border border-[#ECE3CE]"
            }`}
            title={
              shouldCollapse
                ? `${user.first_name} ${user.last_name} — ${user.email}`
                : undefined
            }
          >
            <Avatar className="size-9 border border-gray-200">
              <AvatarImage
                src={
                  user.avatar ||
                  user.profile_photo ||
                  user.profile_image ||
                  user.photo ||
                  ""
                }
                alt={user.first_name}
              />
              <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xs">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            {!shouldCollapse && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#3A4D39] truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
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
          } text-gray-700 hover:text-red-600 hover:bg-red-50 cursor-pointer`}
          title="Logout"
        >
          <LogOut size={18} className={`${shouldCollapse ? "mr-0" : "mr-2"}`} />
          {!shouldCollapse && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
