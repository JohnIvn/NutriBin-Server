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
import { Button } from "../ui/button";

export default function Footer() {
  return (
    <header className='flex w-full justify-between items-center h-15 bg-orange-500 text-white'>
      <nav className="flex w-auto px-2">
        <div>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={'/about'}>
              About Us
            </Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={'/faqs'}>
              FAQs
            </Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={'/policies'}>
              Terms of Service
            </Link>
          </Button>
        </div>
        <div>

          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={'/socials'}>
              Socials
            </Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={'/studies'}>
              Studies
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
