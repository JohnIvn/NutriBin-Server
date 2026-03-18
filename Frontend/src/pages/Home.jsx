import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Settings,
  BarChart3,
  BookOpen,
  Cpu,
  ShieldCheck,
  Users,
  Search,
  Zap,
  Leaf,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      title: "Real-time Analytics",
      description:
        "Monitor decomposition rates and nutrient output across all bins in real-time.",
      icon: BarChart3,
      link: "/analytics",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Machine Fleet",
      description:
        "Manage your NutriBin hardware, check connectivity, and trigger firmware updates.",
      icon: Cpu,
      link: "/machines",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inventory Control",
      description:
        "Track fertilizer batch production and nutritional profiles for distribution.",
      icon: Leaf,
      link: "/fertilizer",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Security & MFA",
      description:
        "Comprehensive access logs and multi-factor authentication management.",
      icon: ShieldCheck,
      link: "/settings",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const quickStats = [
    { label: "Active Bins", value: "128", trend: "+12%" },
    { label: "Organic Waste Processed", value: "4.2 Tons", trend: "+5.4%" },
    { label: "Fertilizer Output", value: "850kg", trend: "+8%" },
    { label: "System Health", value: "99.9%", trend: "Stable" },
  ];

  return (
    <div className="min-h-screen bg-[#ECE3CE]/20 font-sans pb-20">
      {/* Dynamic Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-[#3A4D39]">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#739072] rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#ECE3CE] border border-white/20 mb-8 backdrop-blur-md">
                <Zap className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold tracking-wide uppercase">
                  System Operational
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                Nutri<span className="text-[#A9B388]">Bin</span> <br />
                <span className="text-white/90">Ecosystem.</span>
              </h1>

              <p className="text-xl md:text-2xl text-[#ECE3CE]/80 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                The centralized command center for NutriBin industrial
                composting networks. Monitor, analyze, and scale your organic
                waste conversion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#A9B388] hover:bg-[#8F9B74] text-[#3A4D39] px-10 py-8 rounded-2xl text-xl font-black transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                  <Link to="/analytics" className="flex items-center gap-3">
                    View Fleet Analytics <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/5 border-2 border-white/20 hover:bg-white/10 text-white px-10 py-8 rounded-2xl text-xl font-black backdrop-blur-xl"
                >
                  <Link to="/guide" className="flex items-center gap-3">
                    System Guide
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats Overlay */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {quickStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100/50 backdrop-blur-sm"
            >
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-[#3A4D39]">
                  {stat.value}
                </h3>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded-md">
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black text-[#3A4D39] mb-4">
              Integrated Management
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              Access the full suite of NutriBin administrative tools designed
              for high-throughput organic waste processing.
            </p>
          </div>
          <Link
            to="/settings"
            className="flex items-center gap-2 text-[#4F6F52] font-bold hover:gap-4 transition-all pb-2"
          >
            System Settings <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <Link to={feature.link}>
                  <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8">
                      <div
                        className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-[#3A4D39] mb-3 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {feature.description}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                      <ArrowRight className="w-5 h-5 text-[#4F6F52]" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 mb-20">
        <div className="max-w-6xl mx-auto bg-[#3A4D39] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#4F6F52] rounded-full blur-[100px] opacity-20 -mr-40 -mt-40"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Need help getting <br />
                started?
              </h2>
              <p className="text-[#ECE3CE]/70 text-lg font-medium mb-10 max-w-md">
                Consult our technical documentation or reach out to the
                engineering team for hardware integration support.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#3A4D39] hover:bg-[#ECE3CE] rounded-xl font-bold px-8"
                >
                  <Link to="/guide">System Documentation</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 rounded-xl px-8 font-bold"
                >
                  Contact Support
                </Button>
              </div>
            </div>

            <div className="w-full md:w-1/3 aspect-square grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center opacity-${i * 20}`}
                >
                  <Leaf className="w-12 h-12 text-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer Simple */}
      <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center border-t border-[#4F6F52]/10 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3A4D39] rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-[#A9B388]" />
          </div>
          <span className="font-black text-[#3A4D39] text-xl tracking-tight">
            NutriBin Admin
          </span>
        </div>
        <div className="flex gap-8 text-sm font-bold text-[#4F6F52]">
          <Link to="/tos" className="hover:text-[#3A4D39]">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-[#3A4D39]">
            Privacy
          </Link>
          <Link to="/support" className="hover:text-[#3A4D39]">
            Support
          </Link>
        </div>
        <p className="text-xs font-bold text-gray-400">
          © 2026 NutriBin Cloud Services. Build v4.2.0-stable
        </p>
      </footer>
    </div>
  );
}
