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
<<<<<<< HEAD
    <header className="flex w-full justify-between items-center h-15 bg-orange-500 text-white">
      <nav className="flex w-auto px-2">
        <div>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/about"}>About Us</Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/faqs"}>FAQs</Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/policies"}>Terms of Service</Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/socials"}>Socials</Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/studies"}>Studies</Link>
          </Button>
          <Button asChild className={"bg-transparent hover:bg-amber-700"}>
            <Link to={"/guide"}>Guide</Link>
          </Button>
        </div>
      </nav>
    </header>
=======
<footer className="flex flex-wrap w-full justify-between items-center bg-[#CD5C08] text-white px-2 py-2">
  <nav className="flex flex-wrap gap-2 sm:gap-4 items-center w-full justify-between">
    <div className="flex flex-wrap gap-2">
      <Button asChild className={"bg-transparent hover:bg-amber-700"}>
        <Link to={"/about"}>About Us</Link>
      </Button>
      <Button asChild className={"bg-transparent hover:bg-amber-700"}>
        <Link to={"/faqs"}>FAQs</Link>
      </Button>
      <Button asChild className={"bg-transparent hover:bg-amber-700"}>
        <Link to={"/policies"}>Terms of Service</Link>
      </Button>
      <Button asChild className={"bg-transparent hover:bg-amber-700"}>
        <Link to={"/socials"}>Socials</Link>
      </Button>
      <Button asChild className={"bg-transparent hover:bg-amber-700"}>
        <Link to={"/studies"}>Studies</Link>
      </Button>
    </div>
  </nav>
</footer>

>>>>>>> 37ba42f (altered designs and fixed responsiveness)
  );
}
