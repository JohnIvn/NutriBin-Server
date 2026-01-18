import React from "react";
import {
  Leaf,
  Cpu,
  Box,
  Flame,
  Activity,
  Trash2,
  Cog,
  Sprout,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/pageheader";

// --- custom card ---
const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    className="bg-white rounded-2xl p-6 border border-[#3A4D39]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    whileHover={{ scale: 1.02 }}
  >
    <div className="h-12 w-12 rounded-xl bg-[#4F6F52]/10 flex items-center justify-center text-[#4F6F52] mb-4 group-hover:bg-[#4F6F52] group-hover:text-[#ECE3CE] transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-[#3A4D39] mb-2">{title}</h3>
    <p className="text-sm text-[#739072] leading-relaxed">{desc}</p>
  </motion.div>
);

// --- process step ---
const ProcessStep = ({ icon, title, desc, stepNumber }) => (
  <div className="relative flex flex-col items-center text-center p-6">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3A4D39] text-[#ECE3CE] flex items-center justify-center font-bold text-sm border-4 border-white z-10">
      {stepNumber}
    </div>
    <div className="h-20 w-20 rounded-full bg-[#ECE3CE] flex items-center justify-center text-[#3A4D39] mb-4 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#3A4D39] mb-2">{title}</h3>
    <p className="text-sm text-[#4F6F52] font-medium">{desc}</p>
  </div>
);

export default function About() {
  const PageHeaderComponent = () => (
    <PageHeader
      title="About NutriBin"
      icon={<Leaf className="w-8 h-8 text-[#4F6F52]" />}
    />
  );

  // animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-[#ECE3CE]/20 min-h-screen font-sans pt-6">
      {/* header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeaderComponent />
      </div>

      {/* hero */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] text-sm font-bold uppercase tracking-widest mb-6">
            <Leaf className="w-4 h-4" /> Sustainable Innovation
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#3A4D39] leading-tight mb-6">
            NutriBin: <br />
            <span className="text-[#4F6F52]">Waste to Life.</span>
          </h1>
          <p className="text-lg text-[#739072] leading-relaxed mb-8 max-w-xl">
            An intelligent IoT ecosystem bridging the gap between household
            waste and sustainable agriculture. We transform organic food scraps
            into nutrient-rich fertilizer using high‑performance mechanics and
            real‑time analytics.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white px-8 h-12 rounded-full font-bold cursor-pointer">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-[#3A4D39] text-[#3A4D39] hover:bg-[#3A4D39]/10 px-8 h-12 rounded-full font-bold cursor-pointer"
            >
              View Specs
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* logow */}
          <div className="relative w-64 h-64 lg:w-80 lg:h-80 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-8 border border-[#ECE3CE]">
            <div className="absolute inset-0 bg-[#4F6F52] opacity-5 blur-2xl rounded-full -z-10" />
            <img
              src="/Logo.svg"
              alt="NutriBin Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#3A4D39] mb-4">
            Core Capabilities
          </h2>
          <p className="text-[#739072]">
            Engineered for efficiency, safety, and ease of use.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Cpu />}
              title="Auto-Thermal Process"
              desc="Rapidly converts food scraps into stable fertilizer using a controlled cycle of mechanical mixing and optimized heating."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Activity />}
              title="Smart NPK Profiling"
              desc="Integrated sensors analyze Nitrogen, Phosphorus, and Potassium levels, providing a digital Nutrient Card for every batch."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Box />}
              title="Real‑time Monitoring"
              desc="Live tracking of machine health, including temperature and motor status, via ESP32‑powered web dashboards."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Flame />}
              title="Safety & Gas Sensing"
              desc="MQ‑series sensors detect Ammonia and Methane levels, ensuring a safe and odor‑controlled environment."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Leaf />}
              title="Batch History Logs"
              desc="Automatically logs every cycle so you can track nutrient quality and system performance remotely."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Cog />}
              title="Automated Maintenance"
              desc="Self-diagnostic systems alert users to maintenance needs, ensuring longevity and consistent performance."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* IPO */}
      <section className="bg-white py-20 border-y border-[#3A4D39]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#3A4D39] mb-2">
              How It Works
            </h2>
            <p className="text-[#739072]">
              From table scraps to garden gold in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-1 bg-[#ECE3CE] -z-0" />

            <ProcessStep
              stepNumber="1"
              icon={<Trash2 size={32} />}
              title="Input"
              desc="Soft biodegradable food scraps like peels, leftovers, and trimmings."
            />
            <ProcessStep
              stepNumber="2"
              icon={<Cog size={32} />}
              title="Process"
              desc="Mechanical mixing, thermal drying, and chemical sensor analysis."
            />
            <ProcessStep
              stepNumber="3"
              icon={<Sprout size={32} />}
              title="Output"
              desc="Ready-to-use organic fertilizer with digital nutrient reporting."
            />
          </div>
        </div>
      </section>

      {/* guidelines */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-12">
        {/* guidelines card */}
        <motion.div
          className="bg-[#FFF8EF] border-l-4 border-[#D97706] rounded-r-xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-[#D97706]/10 p-3 rounded-full text-[#D97706]">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#3A4D39] mb-4">
              Safety & Usage Guidelines
            </h3>
            <ul className="space-y-3">
              {[
                "No hard solids (bones, large seeds, fruit pits).",
                "No plastics, metals, or glass materials.",
                "Avoid liquids such as soups or oils.",
                "Ensure proper ventilation if gas alerts are triggered.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-[#4F6F52] font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* CTA card */}
        <motion.div
          className="bg-[#3A4D39] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F6F52] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#739072] opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to turn waste into life?
            </h2>
            <p className="text-[#ECE3CE] mb-8 text-lg">
              Connect your hardware, monitor batches, and join a community
              dedicated to science‑backed sustainability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#ECE3CE] text-[#3A4D39] hover:bg-white h-12 px-8 rounded-full font-bold">
                Join Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-[#ECE3CE]/30 text-[#ECE3CE] hover:bg-[#ECE3CE]/10 h-12 px-8 rounded-full"
              >
                Browse Guides
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
