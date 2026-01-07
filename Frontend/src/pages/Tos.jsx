import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, Check, X } from "lucide-react";

export default function Tos() {
  return (
    <div className="min-h-screen bg-[#FFF5E4] pb-12 font-sans text-[#2E2E2E] overflow-x-hidden">
      
      {/* header */}
      <header className="bg-gradient-to-r from-[#F2A541] to-[#C46A1C] pt-20 pb-32 px-1 text-center text-white shadow-md relative">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-inner">
              <ScrollText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm">
            Terms of Service (TOS)
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            NutriBin: Excess Food Composting and Fertilizer Monitoring System
          </p>
        </div>
      </header>

      {/* main container */}
      <main className="max-w-6xl mx-auto -mt-24 px-4 sm:px-6 relative z-10">
        <Card className="bg-[#FAF9F6] shadow-2xl border-none overflow-hidden rounded-xl">
          <CardContent className="p-8 md:p-16 space-y-16">
            
            {/* intro */}
            <div className="space-y-6 border-b pb-10 border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm font-bold tracking-wide text-[#C46A1C] uppercase">
                  Effective Date: January 2026
                </p>
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  Doc Ref: NB-TOS-V2
                </div>
              </div>
              <p className="text-lg leading-relaxed text-gray-700">
                By accessing or using the NutriBin web application, hardware
                system, or any related services (collectively referred to as the
                "System"), you agree to be bound by these Terms of Service. If
                you do not agree to these terms, you must not use the System.
              </p>
            </div>

            {/* timeline section */}
            <div className="relative">
              <div className="hidden md:block absolute left-[35px] top-4 bottom-4 w-0.5 bg-gray-200 -z-10" />
              <div className="space-y-16">
                
                {/* 1 */}
                <TosSection
                  number="1"
                  title="Purpose of the System"
                >
                  <p>
                    NutriBin is designed to monitor and manage the composting of
                    soft or small biodegradable waste for fertilizer production.
                    The System provides real-time sensor data, status monitoring,
                    logging, and alerts related to compost quality and safety.
                  </p>
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border-l-4 border-[#F2A541] text-muted-foreground">
                    <strong>Note:</strong> NutriBin is intended for educational,
                    research, and prototype demonstration purposes and is not a
                    certified industrial or commercial fertilizer system.
                  </div>
                </TosSection>

                {/* 2 */}
                <TosSection
                  number="2"
                  title="User Roles"
                >
                  <p className="mb-4">The System supports the following user roles:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <strong className="text-[#C46A1C] block mb-2">Admin</strong>
                      <span className="text-sm text-gray-600">Full access to system management, monitoring, calibration, and emergency handling.</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <strong className="text-[#C46A1C] block mb-2">Staff/User</strong>
                      <span className="text-sm text-gray-600">Can view compost status, sensor data, and fertilizer readiness.</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <strong className="text-[#C46A1C] block mb-2">Guest</strong>
                      <span className="text-sm text-gray-600">Limited read-only access to selected system data.</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic text-gray-500 text-right">
                    * Each user is responsible for maintaining the confidentiality of their account credentials.
                  </p>
                </TosSection>

                {/* 3 */}
                <TosSection
                  number="3"
                  title="Acceptable Use"
                >
                  <p className="mb-4">
                    Users agree to use the System only for its intended purposes.
                    You agree <span className="font-bold text-red-600">NOT</span> to:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      "Upload or input false, misleading, or manipulated data",
                      "Attempt to bypass waste filtration or safety mechanisms",
                      "Insert non-biodegradable, hard, or prohibited waste",
                      "Tamper with sensors or calibration settings",
                      "Attempt unauthorized access to admin features",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C46A1C] mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-red-600 font-medium text-sm">
                    Violation of acceptable use may result in immediate account suspension.
                  </p>
                </TosSection>

                {/* 4 */}
                <TosSection
                  number="4"
                  title="Waste Handling Disclaimer"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* allowed */}
                    <div className="space-y-3">
                      <h4 className="font-bold flex items-center gap-2 text-green-700">
                        <Check className="w-5 h-5" /> Supported Waste
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">Soft or small biodegradable items:</p>
                      <ul className="space-y-2">
                        {["Food scraps", "Fruit peels", "Vegetable leftovers"].map((item) =>(
                          <li key={item} className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded border border-green-100 text-green-800">
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* prohibited */}
                    <div className="space-y-3">
                      <h4 className="font-bold flex items-center gap-2 text-red-700">
                        <X className="w-5 h-5" /> Prohibited Items
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">Do not insert the following:</p>
                      <ul className="space-y-2">
                         {["Bones, shells, seeds, thick stems", "Plastics, metals, glass", "Non-biodegradable materials"].map((item) =>(
                          <li key={item} className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded border border-red-100 text-red-800">
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                    Users are responsible for ensuring correct waste input. Improper waste may trigger emergency mode and require manual maintenance.
                  </div>
                </TosSection>

              </div>
            </div>

            {/* ACCEPT / DECLINE - Paremove nalang clark pag na copy mona para sa user TOS modal */}
            <div className="pt-10 border-t border-gray-200 mt-12">
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button 
                  className="bg-[#C46A1C] hover:bg-[#A05515] text-white h-14 px-12 text-lg rounded-full font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-1"
                >
                  <Check className="mr-2 h-6 w-6" /> I Accept the Terms
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-2 border-gray-200 text-gray-500 hover:text-[#C46A1C] hover:border-[#C46A1C] hover:bg-orange-50 h-14 px-12 text-lg rounded-full font-bold transition-all"
                >
                  Decline
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
      
      {/* copyright */}
      <footer className="text-center text-gray-500/60 text-sm mt-12 pb-8">
        &copy; 2026 NutriBin System. All rights reserved.
      </footer>
    </div>
  );
}

// Reusable Section Component
function TosSection({ number, title, children }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 group">
      
      {/* number bubble */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F2A541] group-hover:bg-[#C46A1C] transition-colors duration-300 text-white text-2xl md:text-3xl font-bold shadow-lg ring-8 ring-[#FAF9F6] z-10 relative">
          {number}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 pt-2 md:pt-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#2E2E2E] group-hover:text-[#C46A1C] transition-colors">
          {title}
        </h2>
        <div className="text-gray-600 leading-relaxed text-lg space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}