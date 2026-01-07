import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";

export default function Header() {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <>
      {loading ? (
        <header className="flex w-full justify-between items-center h-12 bg-orange-500 text-white px-2">
          <h1>Loading...</h1>
        </header>
      ) : (
        <header className="flex flex-wrap w-full justify-between items-center bg-[#CD5C08] text-white px-2 py-2">
          <Link to={"/"} className="flex items-center">
            <img
              src="/NutriBin_Logo.svg"
              alt="NutriBin Logo"
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
          </Link>
          {user ? (
            <nav className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/dashboard"}>Dashboard</Link>
              </Button>
              {user.role === "admin" && (
                <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                  <Link to={"/staff"}>Staff</Link>
                </Button>
              )}
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/users"}>Users</Link>
              </Button>
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/machines"}>Repairs</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={
                      "bg-transparent border-none outline-none cursor-pointer truncate max-w-xs sm:max-w-sm"
                    }
                    variant="outline"
                  >
                    {user.first_name} {user.last_name}
                    <Avatar className={"m-1"}>
                      <AvatarFallback>
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-full max-w-xs sm:max-w-sm"
                  align="start"
                >
                  <DropdownMenuLabel className="truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          ) : (
            <nav className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/login"}>Home</Link>
              </Button>
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/guide"}>Guide</Link>
              </Button>
              {/* <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                  <Link to={'/register'}>
                    Register
                  </Link>
                </Button> */}
            </nav>
          )}
        </header>
      )}
    </>
  );
}
