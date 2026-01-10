import { BookOpenIcon } from "@heroicons/react/24/solid";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import StudyCard from "../components/ui/studycard"; // lowercase filename

const researchData = [
  {
    title:
      "Assessment of the agronomic value of organic fertilizer made of composted sludge",
    link: "https://doi.org/10.18280/ijdne.190514",
  },
  {
    title:
      "Comparative performance of integrated nutrient management between composted agricultural wastes, chemical fertilizers, and biofertilizers in improving soil quantitative and qualitative properties and crop yields under arid conditions",
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
      "Waste reduction and bioconversion of quail, chicken and pig manure by Black Soldier Fly (Hermetia illucens L.)",
    link: "https://philjournalsci.dost.gov.ph/wp-content/uploads/2024/04/waste-reduction-and-bioconversion-of-quail-chicken-and-pig-manure-by-black-soldier-fly_.pdf",
  },
  {
    title:
      "Design and optimization of a bio-composter system using genetic algorithm",
    link: "https://jurnal.unai.edu/index.php/isc/article/view/3581",
  },
  {
    title:
      "Fruit and vegetable waste characteristics and management practices at Pasig Mega Market in Pasig City, Philippines",
    link: "https://pdfs.semanticscholar.org/310f/310f472d61d6caf7b778bf548afa0cc5f9aea31c.pdf",
  },
];

const Studies = () => {
  // Motion variants for staggered slide-up animation
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1, // slight delay between cards
      },
    },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
  };

  return (
    <div className="min-h-screen pt-12">
      {/* Header */}
      <div className="w-full max-w-[90%] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <BookOpenIcon className="w-10 h-10 text-black" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-black">
            Studies
          </h1>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center items-start"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {researchData.map((item, index) => (
          <motion.div
            className="w-full max-w-xs"
            key={index}
            variants={cardVariant}
          >
            <StudyCard title={item.title} link={item.link} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Studies;
