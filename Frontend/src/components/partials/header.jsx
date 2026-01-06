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
        <header className="flex w-full justify-between items-center h-15 bg-orange-500 text-white px-2">
          <Link to={"/"} className="text-center h-auto">
            <img
              src="/NutriBin_Logo.svg"
              alt="NutriBin Logo"
              className="h-8 px-4"
            />
          </Link>
          {user ? (
            <nav className="flex gap-2">
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/dashboard"}>Dashboard</Link>
              </Button>
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/admins"}>Admins</Link>
              </Button>
              <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                <Link to={"/machines"}>Repairs</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={
                      "bg-transparent border-none outline-none cursor-pointer"
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
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to={"/account"}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={"/settings"}>Settings</Link>
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
            <nav className="flex w-auto px-2 gap-4">
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
