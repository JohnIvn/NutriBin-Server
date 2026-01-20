import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, Check, X } from "lucide-react";
import PageHeader from "@/components/ui/pageheader";

export default function Tos() {
  return (
    <div className="min-h-screen bg-[#ECE3CE]/30 pb-12 font-sans text-[#3A4D39] overflow-x-hidden pt-6">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <PageHeader
          title="Terms of Service"
          icon={<ScrollText className="w-8 h-8 text-[#4F6F52]" />}
        />
      </div>

      {/* main container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <Card className="bg-white shadow-2xl border-none overflow-hidden rounded-2xl">
          <CardContent className="p-8 md:p-16 space-y-16">
            {/* intro */}
            <div className="space-y-6 border-b pb-10 border-[#ECE3CE]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm font-bold tracking-wide text-[#4F6F52] uppercase bg-[#4F6F52]/10 px-3 py-1 rounded-full">
                  Effective Date: January 2026
                </p>
                <div className="text-xs text-[#739072] font-mono">
                  REF: NB-TOS-V2
                </div>
              </div>
              <p className="text-lg leading-relaxed text-[#4F6F52]">
                By accessing or using the NutriBin web application, hardware
                system, or any related services (collectively referred to as the
                "System"), you agree to be bound by these Terms of Service. If
                you do not agree to these terms, you must not use the System.
              </p>
            </div>

            {/* timeline section */}
            <div className="relative">
              {/* timeline Line */}
              <div className="hidden md:block absolute left-[39px] top-4 bottom-4 w-0.5 bg-[#ECE3CE] -z-10" />

              <div className="space-y-16">
                {/* 1 */}
                <TosSection number="1" title="Purpose of the System">
                  <p>
                    NutriBin is designed to monitor and manage the composting of
                    soft or small biodegradable waste for fertilizer production.
                    The System provides real-time sensor data, status
                    monitoring, logging, and alerts related to compost quality
                    and safety.
                  </p>
                  <div className="mt-4 p-4 bg-[#ECE3CE]/30 rounded-lg border-l-4 border-[#3A4D39] text-[#4F6F52]">
                    <strong>Note:</strong> NutriBin is intended for educational,
                    research, and prototype demonstration purposes and is not a
                    certified industrial or commercial fertilizer system.
                  </div>
                </TosSection>

                {/* 2 */}
                <TosSection number="2" title="User Roles">
                  <p className="mb-4">
                    The System supports the following user roles:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#ECE3CE] hover:border-[#739072] transition-colors">
                      <strong className="text-[#3A4D39] block mb-2">
                        Admin
                      </strong>
                      <span className="text-sm text-[#739072]">
                        Full access to system management, monitoring,
                        calibration, and emergency handling.
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#ECE3CE] hover:border-[#739072] transition-colors">
                      <strong className="text-[#3A4D39] block mb-2">
                        Staff/User
                      </strong>
                      <span className="text-sm text-[#739072]">
                        Can view compost status, sensor data, and fertilizer
                        readiness.
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#ECE3CE] hover:border-[#739072] transition-colors">
                      <strong className="text-[#3A4D39] block mb-2">
                        Guest
                      </strong>
                      <span className="text-sm text-[#739072]">
                        Limited read-only access to selected system data.
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs italic text-[#739072] text-right">
                    * Each user is responsible for maintaining the
                    confidentiality of their credentials.
                  </p>
                </TosSection>

                {/* 3 */}
                <TosSection number="3" title="Acceptable Use">
                  <p className="mb-4">
                    Users agree to use the System only for its intended
                    purposes. You agree{" "}
                    <span className="font-bold text-red-600">NOT</span> to:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      "Upload or input false, misleading, or manipulated data",
                      "Attempt to bypass waste filtration or safety mechanisms",
                      "Insert non-biodegradable, hard, or prohibited waste",
                      "Tamper with sensors or calibration settings",
                      "Attempt unauthorized access to admin features",
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-[#4F6F52] bg-[#FAF9F6] p-3 rounded-lg border border-[#ECE3CE]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3A4D39] mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg inline-block">
                    Violation of acceptable use may result in immediate account
                    suspension.
                  </p>
                </TosSection>

                {/* 4 */}
                <TosSection number="4" title="Waste Handling Disclaimer">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* allowed */}
                    <div className="space-y-3">
                      <h4 className="font-bold flex items-center gap-2 text-[#3A4D39]">
                        <div className="bg-[#4F6F52] text-white p-1 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                        Supported Waste
                      </h4>
                      <p className="text-sm text-[#739072] mb-2">
                        Soft or small biodegradable items:
                      </p>
                      <ul className="space-y-2">
                        {[
                          "Food scraps",
                          "Fruit peels",
                          "Vegetable leftovers",
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm bg-[#4F6F52]/10 p-2 rounded-lg text-[#3A4D39] font-medium border border-[#4F6F52]/20"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* prohibited */}
                    <div className="space-y-3">
                      <h4 className="font-bold flex items-center gap-2 text-red-700">
                        <div className="bg-red-600 text-white p-1 rounded-full">
                          <X className="w-3 h-3" />
                        </div>
                        Prohibited Items
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        Do not insert the following:
                      </p>
                      <ul className="space-y-2">
                        {[
                          "Bones, shells, seeds, thick stems",
                          "Plastics, metals, glass",
                          "Non-biodegradable materials",
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded-lg text-red-800 font-medium border border-red-100"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-[#739072] bg-[#FAF9F6] p-4 rounded-xl text-center border border-[#ECE3CE]">
                    Users are responsible for ensuring correct waste input.
                    Improper waste may trigger emergency mode and require manual
                    maintenance.
                  </div>
                </TosSection>
              </div>
            </div>

            {/* Accept/Decline buttons removed for policies page */}
          </CardContent>
        </Card>
      </main>

      {/* copyright */}
      <footer className="text-center text-[#739072] text-sm mt-12 pb-8 font-medium">
        &copy; 2026 NutriBin System. All rights reserved.
      </footer>
    </div>
  );
}

function TosSection({ number, title, children }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 group">
      {/* number bubble */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#3A4D39] group-hover:bg-[#4F6F52] transition-colors duration-300 text-[#ECE3CE] text-2xl md:text-3xl font-black shadow-lg ring-8 ring-white z-10 relative">
          {number}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 pt-2 md:pt-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#3A4D39] group-hover:text-[#4F6F52] transition-colors">
          {title}
        </h2>
        <div className="text-[#4F6F52] leading-relaxed text-lg space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
