import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Guide() {
  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4D39]">User Guide</h1>
            <p className="text-sm text-[#6B6F68] italic">
              Reference & instructions
            </p>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <img
              src="/UserGuide.svg"
              alt="User Guide"
              className="w-full h-auto rounded-md shadow-lg"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
