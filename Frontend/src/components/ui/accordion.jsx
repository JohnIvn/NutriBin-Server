import React, { useState, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";

const AccordionContext = createContext();

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordionContext must be used within Accordion");
  }
  return context;
};

const Accordion = ({ children, type = "single", collapsible = true }) => {
  const [openItems, setOpenItems] = useState([]);

  const handleItemToggle = (value) => {
    if (type === "single") {
      setOpenItems(openItems.includes(value) && collapsible ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value],
      );
    }
  };

  return (
    <AccordionContext.Provider
      value={{ openItems, onToggle: handleItemToggle }}
    >
      <div className="w-full divide-y divide-gray-200">{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ value, children }) => {
  return <div data-value={value}>{children}</div>;
};

const AccordionTrigger = ({ children, className = "", ...props }) => {
  const { openItems, onToggle } = useAccordionContext();
  // Get the value from the parent AccordionItem
  const value = props.value || "default";
  const isOpen = openItems.includes(value);

  return (
    <button
      onClick={() => onToggle(value)}
      className={`w-full flex items-center justify-between py-4 px-6 font-medium text-left text-[#3A4D39] hover:text-[#4F6F52] hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const AccordionContent = ({ children, className = "", ...props }) => {
  const { openItems } = useAccordionContext();
  const value = props.value || "default";
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={`pb-4 px-6 pt-0 text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
