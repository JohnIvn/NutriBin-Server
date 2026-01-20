import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinksLeft = [
    { name: "Home", href: "/" },
  ];

  const navLinksRight = [
    { name: "Login", href: "/login" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#ECE3CE]/90 backdrop-blur-md shadow-sm text-[#3A4D39]"
            : "bg-[#3A4D39] text-[#ECE3CE]"
        } py-3`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-end pr-12">
            {navLinksLeft.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                scrolled={isScrolled}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex-shrink-0 relative z-10">
            <Link
              to="/"
              className="group block text-center"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <h1
                className={`text-2xl font-black tracking-tighter px-3 py-1 rounded-lg group-hover:transition-all duration-300 ${isScrolled ? "border-2 border-[#3A4D39] group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE]" : "border-2 border-[#ECE3CE] group-hover:bg-[#ECE3CE] group-hover:text-[#3A4D39]"}`}
              >
                NutriBin
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 flex-1 justify-start pl-12">
            {navLinksRight.map((link) =>
              link.isButton ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className={
                    isScrolled
                      ? "px-5 py-2 rounded-full bg-[#3A4D39] text-[#ECE3CE] font-bold text-sm hover:bg-[#4F6F52] hover:scale-105 transition-all duration-300 shadow-md shadow-[#3A4D39]/20"
                      : "px-5 py-2 rounded-full bg-[#ECE3CE] text-[#3A4D39] font-bold text-sm hover:bg-[#F3EFD8] hover:scale-105 transition-all duration-300 shadow-md shadow-[#3A4D39]/10"
                  }
                >
                  {link.name}
                </Link>
              ) : (
                <NavLink
                  key={link.name}
                  href={link.href}
                  scrolled={isScrolled}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  {link.name}
                </NavLink>
              ),
            )}
          </nav>

          <button
            className="md:hidden text-current p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#ECE3CE] shadow-2xl z-[70] p-8 md:hidden flex flex-col"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="w-8 h-8 text-[#3A4D39]" />
                </button>
              </div>

              <div className="flex flex-col gap-6 items-center text-center">
                {[...navLinksLeft, ...navLinksRight].map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`text-xl font-bold ${
                      link.isButton
                        ? "px-8 py-3 bg-[#3A4D39] text-[#ECE3CE] rounded-full mt-4 w-full shadow-lg"
                        : "text-current hover:text-[#4F6F52]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const NavLink = ({ href, children, scrolled, onClick }) => {
  const textClass = scrolled ? "text-[#3A4D39]" : "text-[#ECE3CE]";
  const lineClass = scrolled ? "bg-[#3A4D39]" : "bg-[#ECE3CE]";
  const handleClick = (e) => {
    if (onClick) return onClick(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Link
      to={href}
      onClick={handleClick}
      className={`relative group ${textClass} font-bold text-sm uppercase tracking-wider`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 w-0 h-[2px] ${lineClass} transition-all duration-300 group-hover:w-full`}
      />
    </Link>
  );
};
