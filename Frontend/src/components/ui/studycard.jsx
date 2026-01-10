import { LightBulbIcon } from "@heroicons/react/24/solid";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const StudyCard = ({ title, link }) => {
  const [hovered, setHovered] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const COLLAPSED_HEIGHT = 84; // px

  // Measure full content height for hover expand
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [title]);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden relative transform hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      layout
    >
      {/* Card Header */}
      <div className="bg-orange-600 p-4 flex items-center gap-2 flex-shrink-0">
        <LightBulbIcon className="w-5 h-5 text-white flex-shrink-0" />
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold hover:underline transition-colors"
        >
          Learn More
        </a>
      </div>

      {/* Card Body */}
      <motion.div
        ref={contentRef}
        className="p-4 relative overflow-hidden"
        animate={{ maxHeight: hovered ? contentHeight : COLLAPSED_HEIGHT }}
        transition={{ type: "spring", stiffness: 250, damping: 30 }}
      >
        <h2 className="text-gray-800 font-semibold text-lg text-justify break-words">
          {title}
        </h2>

        {/* Fade overlay for non-hovered state */}
        {!hovered && (
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudyCard;
