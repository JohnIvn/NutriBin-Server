import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Cpu, Box, Flame, Activity } from "lucide-react";

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#FFF5E4] flex items-center justify-center text-[#C46A1C]">
          {icon}
        </div>
        <CardTitle className="text-center text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-center text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

function ProcessStep({ icon, title, desc }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="h-12 w-12 rounded-full bg-[#F2A541]/20 flex items-center justify-center text-[#C46A1C]">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

export default function About() {
  return (
    <div className="bg-[#FFF5E4] text-[#2E2E2E]">

      {/* hero */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16 grid md:grid-cols-2 gap-4 sm:gap-6 items-center bg-[#FFF5E4]">
        <div className="flex items-center gap-6">
          <div className="h-28 w-28 rounded-xl flex items-center justify-center">
            <img src="/Logo.svg" alt="logo" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            NutriBin: Excess Food Composting and Fertilizer Monitoring System
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          NutriBin is an intelligent IoT ecosystem that bridges the gap between
          household waste and sustainable agriculture. It transforms organic food
          scraps into nutrient-rich fertilizer using high‑performance mechanical
          processing and real‑time data analytics.
        </p>
      </section>

      {/* features */}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-10">What's the Key Features?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            icon={<Cpu />}
            title="Automated Thermal Processing"
            desc="Rapidly converts food scraps into stable fertilizer using a controlled cycle of mechanical mixing and optimized heating."
          />
          <FeatureCard
            icon={<Activity />}
            title="Smart NPK Nutrient Profiling"
            desc="Integrated sensors analyze Nitrogen, Phosphorus, and Potassium levels, providing a digital Nutrient Card for every batch."
          />
          <FeatureCard
            icon={<Box />}
            title="Real‑time Hardware Monitoring"
            desc="Live tracking of machine health, including temperature and motor status, via ESP32‑powered web dashboards."
          />
          <FeatureCard
            icon={<Flame />}
            title="Safety & Gas Sensing"
            desc="MQ‑series sensors detect Ammonia and Methane levels, ensuring a safe and odor‑controlled environment."
          />
          <FeatureCard
            icon={<Leaf />}
            title="Batch History & Data Logging"
            desc="Automatically logs every cycle so you can track nutrient quality and system performance remotely."
          />
        </div>
      </section>

      {/* flow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-10">Input, Process & Output</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
          <ProcessStep
            icon={<Leaf />}
            title="Input"
            desc="Soft biodegradable food scraps"
          />
          <ProcessStep
            icon={<Leaf />}
            title="Process"
            desc="Mechanical mixing, thermal drying, and chemical sensor analysis"
          />
          <ProcessStep
            icon={<Leaf />}
            title="Output"
            desc="Organic fertilizer with digital nutrient report"
          />
        </div>
      </section>

      {/* guide */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Safety & Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>⚠️ No hard solids (bones, large seeds, fruit pits).</p>
            <p>⚠️ No plastics, metals, or glass materials.</p>
            <p>⚠️ Avoid liquids such as soups or oils.</p>
            <p>⚠️ Ensure proper ventilation if gas alerts are triggered.</p>
          </CardContent>
        </Card>
      </section>

      {/* cta button */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Card className="text-center bg-[#FFF6E8]">
          <CardHeader>
            <CardTitle className="text-2xl">
              Ready to turn your waste into life?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Create an account to connect your hardware, monitor batches, and
              join a community dedicated to science‑backed sustainability.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-[#F2A541] hover:bg-[#E19034]">
                Join Now
              </Button>
              <Button variant="outline">Browse All Guides</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}