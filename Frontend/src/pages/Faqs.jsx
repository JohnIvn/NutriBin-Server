import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots, FaPlus, FaMinus } from "react-icons/fa";
import PageHeader from "@/components/ui/pageheader";

const faqsData = [
  {
    question: "What does the compost bin system do?",
    answer:
      "The compost bin system processes organic waste such as food scraps and plant materials and converts them into nutrient-rich fertilizer through controlled composting.",
  },
  {
    question: "What types of waste can be placed in the compost bin?",
    answer:
      "The system accepts biodegradable materials such as fruit and vegetable waste, leaves, grass clippings, and other organic matter. Non-biodegradable materials like plastics, metals, and chemicals should not be added.",
  },
  {
    question: "How does the system monitor the composting process?",
    answer:
      "The system uses sensors to monitor parameters such as temperature, humidity, and gas levels to ensure optimal conditions for efficient composting and safe operation.",
  },
  {
    question: "Does the compost bin require regular maintenance?",
    answer:
      "Minimal maintenance is required. Users need to periodically add organic waste, ensure proper moisture levels, and collect the finished fertilizer as instructed by the system.",
  },
  {
    question: "Is the system odor-free?",
    answer:
      "The system is designed to minimize odor through proper airflow and controlled composting conditions. Odors may occur if non-recommended materials are added.",
  },
  {
    question: "Can users track compost data and fertilizer output?",
    answer:
      "Yes. The system includes a monitoring interface that allows users to view compost status, historical data, and fertilizer output records.",
  },
];

// --- custom styled accordion component ---
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? "bg-white border-[#3A4D39] shadow-md"
          : "bg-white/60 border-[#ECE3CE] hover:border-[#739072]"
      }`}
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left gap-4 cursor-pointer"
      >
        <span
          className={`text-lg font-bold transition-colors ${
            isOpen ? "text-[#3A4D39]" : "text-[#4F6F52]"
          }`}
        >
          {question}
        </span>
        <div
          className={`flex-shrink-0 p-2 rounded-full transition-colors ${
            isOpen
              ? "bg-[#3A4D39] text-[#ECE3CE]"
              : "bg-[#ECE3CE] text-[#3A4D39]"
          }`}
        >
          {isOpen ? <FaMinus size={12} /> : <FaPlus size={12} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 pt-0">
              <div className="h-[1px] w-full bg-[#ECE3CE] mb-4" />
              <p className="text-[#739072] font-medium leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Faqs() {
  return (
    <div className="w-full min-h-screen bg-[#ECE3CE]/30 font-sans pt-6">
      <div className="w-full max-w-5xl mx-auto px-6 py-16">
        <PageHeader
          title="FAQs"
          icon={<FaCommentDots className="w-8 h-8 text-[#4F6F52]" />}
        />
        <p className="mt-4 text-[#4F6F52] text-lg max-w-xl">
          Everything you need to know about the compost system, maintenance, and
          monitoring.
        </p>

        {/* --- FAQ grid --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {faqsData.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 120, damping: 14 },
                },
              }}
            >
              <FaqItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </motion.div>

        {/* --- footer note --- */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[#739072] text-sm">
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-[#3A4D39] font-bold underline hover:text-[#4F6F52] transition-colors cursor-pointer"
            >
              Contact Support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
