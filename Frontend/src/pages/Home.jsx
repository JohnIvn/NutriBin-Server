import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#ECE3CE] to-white p-8">
      <div className="max-w-3xl text-center">
        <h2 className="text-4xl font-extrabold text-[#3A4D39] mb-4">
          Welcome to NutriBin
        </h2>
        <p className="text-lg text-[#4F6F52]">
          This is the NutriBin homepage. Click around to access dashboards,
          guides, and machine information. Use the top navigation to get
          started.
        </p>
      </div>
    </div>
  );
}
