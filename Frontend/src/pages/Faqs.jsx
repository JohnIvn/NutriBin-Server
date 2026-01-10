import React from "react";
import FaqCard from "../components/ui/faqcard";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaCommentDots } from "react-icons/fa";

const faqsData = [
  {
    question: "Q: What does the compost bin system do?",
    answer:
      "A: The compost bin system processes organic waste such as food scraps and plant materials and converts them into nutrient-rich fertilizer through controlled composting.",
  },
  {
    question: "Q: What types of waste can be placed in the compost bin?",
    answer:
      "A: The system accepts biodegradable materials such as fruit and vegetable waste, leaves, grass clippings, and other organic matter. Non-biodegradable materials like plastics, metals, and chemicals should not be added.",
  },
  {
    question: "Q: How does the system monitor the composting process?",
    answer:
      "A: The system uses sensors to monitor parameters such as temperature, humidity, and gas levels to ensure optimal conditions for efficient composting and safe operation.",
  },
  {
    question: "Q: Does the compost bin require regular maintenance?",
    answer:
      "A: Minimal maintenance is required. Users need to periodically add organic waste, ensure proper moisture levels, and collect the finished fertilizer as instructed by the system.",
  },
  {
    question: "Q: Is the system odor-free?",
    answer:
      "A: The system is designed to minimize odor through proper airflow and controlled composting conditions. Odors may occur if non-recommended materials are added.",
  },
  {
    question: "Q: Can users track compost data and fertilizer output?",
    answer:
      "A: Yes. The system includes a monitoring interface that allows users to view compost status, historical data, and fertilizer output records.",
  },
];
export default function Faqs() {
  return (
    <div className="w-full min-h-screen pt-12">
      {/* Header (LEFT ALIGNED) */}
      <div className="w-full max-w-[90%] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <FaCommentDots className="text-black text-3xl" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-black">
            FAQs
          </h1>
        </div>
      </div>

      {/* FAQ Cards */}
      <motion.div
        className="w-full flex flex-col gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {faqsData.map((faq, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              },
            }}
          >
            <FaqCard question={faq.question} answer={faq.answer} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
