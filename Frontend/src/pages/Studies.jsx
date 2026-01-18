import React from "react";
import {
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/pageheader";
import { BookMarked } from "lucide-react";

const PageHeaderComponent = () => (
  <PageHeader
    title="Research & Studies"
    icon={<BookMarked className="w-8 h-8 text-[#4F6F52]" />}
  />
);

const researchData = [
  {
    title:
      "Assessment of the agronomic value of organic fertilizer made of composted sludge",
    link: "https://doi.org/10.18280/ijdne.190514",
  },
  {
    title:
      "Comparative performance of integrated nutrient management between composted agricultural wastes and chemical fertilizers",
    link: "https://doi.org/10.3390/agronomy10101503",
  },
  {
    title:
      "Effect of fertilizer and food waste compost on soil carbon, nitrogen use efficiency, and yield of Chinese cabbage",
    link: "https://doi.org/10.1186/s13765-025-01044-3",
  },
  {
    title:
      "Critical factors in lab-scale compostability testing. Journal of Polymers and the Environment",
    link: "https://doi.org/10.1007/s10924-024-03311-8",
  },
  {
    title:
      "The evolution of nutrient and microbial composition and maturity during the composting of different plant-derived wastes",
    link: "https://pubmed.ncbi.nlm.nih.gov/40136524/",
  },
  {
    title:
      "Prospects for widespread adoption of organic-based fertilizers in the Philippines: A rapid appraisal",
    link: "https://pidswebs.pids.gov.ph/CDN/document/pidsdps2430.pdf",
  },
  {
    title: "Food loss and waste in the Philippines: A literature review",
    link: "https://www.myfoodresearch.com/uploads/8/4/8/5/84855864/_33__fr-2022-127_barrion.pdf",
  },
  {
    title:
      "Waste reduction and bioconversion of quail, chicken and pig manure by Black Soldier Fly",
    link: "https://philjournalsci.dost.gov.ph/wp-content/uploads/2024/04/waste-reduction-and-bioconversion-of-quail-chicken-and-pig-manure-by-black-soldier-fly_.pdf",
  },
  {
    title:
      "Design and optimization of a bio-composter system using genetic algorithm",
    link: "https://jurnal.unai.edu/index.php/isc/article/view/3581",
  },
  {
    title:
      "Fruit and vegetable waste characteristics and management practices at Pasig Mega Market",
    link: "https://pdfs.semanticscholar.org/310f/310f472d61d6caf7b778bf548afa0cc5f9aea31c.pdf",
  },
];

// --- custom internal card component ---
const StudyItem = ({ title, link }) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col justify-between h-full bg-white rounded-xl p-6 border border-[#3A4D39]/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {/* top */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#739072] to-[#3A4D39] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="space-y-4 relative z-10">
      <div className="flex justify-between items-start gap-3">
        <div className="p-2 bg-[#ECE3CE]/40 rounded-lg text-[#3A4D39] group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE] transition-colors duration-300">
          <BookOpenIcon className="w-6 h-6" />
        </div>
        <ArrowTopRightOnSquareIcon className="w-5 h-5 text-[#739072] opacity-50 group-hover:opacity-100 group-hover:text-[#4F6F52] transition-all" />
      </div>

      <h3 className="text-lg font-bold text-[#3A4D39] leading-snug group-hover:text-[#4F6F52] transition-colors line-clamp-4">
        {title}
      </h3>
    </div>

    <div className="mt-6 pt-4 border-t border-[#ECE3CE] flex items-center gap-2 text-sm font-medium text-[#739072] group-hover:text-[#3A4D39] transition-colors">
      <span>Read Publication</span>
      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        →
      </span>
    </div>
  </motion.a>
);

const Studies = () => {
  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pt-6">
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <PageHeaderComponent />
        <p className="mt-4 text-[#4F6F52] text-lg font-medium max-w-2xl">
          Scientific literature and case studies supporting sustainable
          composting and organic waste management.
        </p>

        {/* --- grid layout --- */}
        <motion.div
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {researchData.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 50, damping: 20 },
                },
              }}
              className="h-full"
            >
              <StudyItem title={item.title} link={item.link} />
            </motion.div>
          ))}
        </motion.div>

        {/* --- footer note --- */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-[#739072] text-sm">
            Access to full papers may require academic credentials or
            subscription.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Studies;
