import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaTwitter, FaLink } from "react-icons/fa6";

export default function Socials() {
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
      icon: <FaTwitter />,
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

  // Parent container variants for staggered children
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };

  // Button animation: slide from left + fade + pop
  const buttonVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 }, // x: -50 for left
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gray-50">
      {/* Right-side illustration */}
      <motion.div
        className="absolute top-0 right-0 w-[45%] h-full hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src="/Socials.png"
          alt="Socials Illustration"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Left-side content */}
      <div className="flex flex-col justify-start gap-4 w-full lg:w-[55%] relative z-10 pt-12">
        {/* Header */}
        <div className="w-full max-w-[90%] mx-auto mb-8">
          <div className="flex items-center gap-4">
            <FaLink className="w-10 h-10 text-black" />
            <h1 className="text-4xl lg:text-5xl font-extrabold text-black">
              Socials
            </h1>
          </div>
        </div>

        {/* Buttons (slide from left) */}
        <motion.div
          className="flex flex-col gap-5 w-full h-full justify-center items-center"
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
              className="
                group flex items-center gap-5 px-20 py-5 w-full max-w-md
                rounded-lg font-bold text-white
                bg-gradient-to-b from-orange-400 to-orange-600
                transition-all duration-300 ease-out
                hover:pl-24
                hover:bg-white hover:from-white hover:to-white
                hover:text-orange-500
                border border-orange-500
                shadow-md hover:shadow-orange-400/50
              "
              variants={buttonVariants}
            >
              <span className="text-3xl transition-colors duration-300 group-hover:text-orange-500">
                {social.icon}
              </span>
              <span className="text-xl">{social.name}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
