import React from "react";
import {
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter, FaLink, FaArrowRight } from "react-icons/fa6";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/pageheader";
import { Share2 } from "lucide-react";

export default function Socials() {
  const PageHeaderComponent = () => (
    <PageHeader
      title="Follow Us"
      icon={<Share2 className="w-8 h-8 text-[#4F6F52]" />}
    />
  );

  const socials = [
    {
      name: "GitHub",
      url: "https://github.com/yourusername",
      icon: <FaGithub />,
    },
    {
      name: "Facebook",
      url: "https://facebook.com/yourpage",
      icon: <FaFacebook />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourprofile",
      icon: <FaInstagram />,
    },
    {
      name: "X / Twitter",
      url: "https://x.com/yourhandle",
      icon: <FaXTwitter />,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/yourprofile",
      icon: <FaLinkedin />,
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@yourchannel",
      icon: <FaYoutube />,
    },
  ];

  // staggered container
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  // button animation
  const buttonVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-[#ECE3CE]/30 font-sans pt-6">
      <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
        <PageHeaderComponent />
      </div>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* --- right-side --- */}
        <motion.div
          className="absolute top-0 right-0 w-[45%] h-full hidden lg:block z-0"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#ECE3CE]/20 z-100" />
          <img
            src="/socials.jpg"
            alt="Socials Illustration"
            className="w-full h-full object-cover grayscale-[20%] contrast-[1.05]"
          />
        </motion.div>

        {/* --- left-side content --- */}
        <div className="flex flex-col justify-center items-center lg:items-start w-full lg:w-[55%] relative z-10 p-8 lg:pl-20 lg:pr-8 min-h-screen">
          {/* header */}
          <motion.div
            className="mb-10 lg:mb-14 w-full max-w-lg text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-3">
              <div className="p-3 bg-[#3A4D39] rounded-2xl shadow-lg shadow-[#3A4D39]/20">
                <FaLink className="w-6 h-6 text-[#ECE3CE]" />
              </div>
              <span className="text-[#739072] font-bold uppercase tracking-widest text-sm">
                Connect With Us
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-[#3A4D39] leading-tight">
              Our Social <br className="hidden lg:block" /> Presence.
            </h1>
            <p className="mt-4 text-[#4F6F52] text-lg font-medium max-w-md mx-auto lg:mx-0">
              Follow our journey, get updates, and join the NutriBin community
              across all platforms.
            </p>
          </motion.div>

          {/* social buttons */}
          <motion.div
            className="grid grid-cols-1 w-full max-w-md gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {socials.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between px-6 py-4 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#3A4D39]/10 bg-white"
                variants={buttonVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* bg fill */}
                <div className="absolute inset-0 bg-[#3A4D39] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left z-0" />

                {/* icon and text */}
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-2xl text-[#4F6F52] group-hover:text-[#ECE3CE] transition-colors duration-300">
                    {social.icon}
                  </span>
                  <span className="text-lg font-bold text-[#3A4D39] group-hover:text-[#ECE3CE] transition-colors duration-300">
                    {social.name}
                  </span>
                </div>

                {/* arrow */}
                <div className="relative z-10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <FaArrowRight className="text-[#ECE3CE]" />
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* footer */}
          <motion.div
            className="mt-12 text-[#739072] text-sm font-medium flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <span className="w-8 h-[2px] bg-[#739072]" />
            <span>NutriBin Official Links</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
