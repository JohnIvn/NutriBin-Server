import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const footerLinks = [
    { name: "About Us", path: "/about" },
    { name: "FAQs", path: "/faqs" },
    { name: "Terms of Service", path: "/policies" },
    { name: "Socials", path: "/socials" },
    { name: "Studies", path: "/studies" },
  ];

  return (
    <footer className="w-full bg-[#3A4D39] text-[#ECE3CE] font-sans pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        {/* logo */}
        <div className="mb-8">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-block text-center"
          >
            <h2 className="text-3xl font-black tracking-tighter border-2 border-[#ECE3CE] px-4 py-1 rounded-lg group-hover:bg-[#ECE3CE] group-hover:text-[#3A4D39] transition-all duration-300">
              NutriBin
            </h2>
          </Link>
        </div>

        {/* nav links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="relative group text-sm font-bold uppercase tracking-wider text-[#ECE3CE]/80 hover:text-[#ECE3CE] transition-colors duration-300"
            >
              {link.name}
              {/* animated underline */}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#ECE3CE] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* divider */}
        <div className="w-full h-[1px] bg-[#ECE3CE]/20 mb-8" />

        {/* copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full text-xs font-medium text-[#ECE3CE]/50 gap-4">
          <p>
            &copy; {new Date().getFullYear()} NutriBin. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="cursor-pointer hover:text-[#ECE3CE] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookie-policy"
              className="cursor-pointer hover:text-[#ECE3CE] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
