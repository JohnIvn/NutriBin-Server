import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false) //Temporary

  // TODO - Fetch user session
  // if (!user) {
  //   setLoading(true)
  //   setLoading(false)
  // }

  return (
    <>
      {loading ? (
        <header className='flex w-full justify-between items-center h-12 bg-orange-500 text-white px-2'>
          <h1>Loading...</h1>
        </header>
      ) :
        (

          <header className='flex w-full justify-between items-center h-12 bg-orange-500 text-white px-2'>
            <Link to={"/"} className="text-center h-auto">
              <img
                src="/NutriBin_Logo.svg"
                alt="NutriBin Logo"
                className="h-8 px-4"
              />


            </Link>
            {user ? (
              <nav className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className={'bg-transparent border-none outline-none'} variant="outline">MattCania
                      <Avatar className={'m-1'}>
                        {/* Arbitrary Image */}
                        <AvatarImage src="https://github.com/MattCania.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>matthewgab24@gmail.com</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        Profile
                        {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Settings
                        {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Log out
                      {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            ) : (

              <nav className="flex w-auto px-2 gap-4">
                <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                  <Link to={'/login'}>
                    Home
                  </Link>
                </Button>
                <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                  <Link to={'/guide'}>
                    Guide
                  </Link>
                </Button>
                <Button asChild className={"bg-transparent hover:bg-amber-700"}>
                  <Link to={'/register'}>
                    Register
                  </Link>
                </Button>
              </nav>
            )}
          </header>
        )}
    </>
  );
}
