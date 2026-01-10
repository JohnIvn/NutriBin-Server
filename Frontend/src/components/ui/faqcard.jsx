import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function FaqCard({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCard = () => setIsOpen(!isOpen);

  return (
    <motion.div
      className="w-full max-w-[90%] mx-auto relative flex flex-col cursor-pointer my-2"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Primary Card */}
      <motion.div
        className="px-6 py-2 sm:px-8 sm:py-3 bg-[#F17720] text-[#FFF5E4] shadow-md relative z-10 font-bold text-lg md:text-xl rounded-t-lg rounded-l-lg rounded-tr-lg"
        onClick={toggleCard}
        animate={{
          borderBottomRightRadius: isOpen ? 0 : 8,
          boxShadow: isOpen
            ? "0 8px 20px rgba(0,0,0,0.25)"
            : "0 4px 12px rgba(0,0,0,0.2)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {question}
      </motion.div>

      {/* Secondary Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="overflow-hidden shadow-md bg-[#FFF5E4] text-[#F17720] ml-4 sm:ml-6 md:ml-8 lg:ml-10 relative z-0 rounded-b-lg"
            initial={{ height: 0, y: -10 }}
            animate={{ height: "auto", y: 0 }}
            exit={{ height: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="px-6 sm:px-8 md:px-8 lg:px-10 py-2 sm:py-3 text-base sm:text-lg md:text-lg lg:text-xl">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
