import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ModuleCard({ title, icon: Icon, offline, subtext }) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
        offline
          ? "bg-red-50/50 border-red-100 text-red-700"
          : "bg-green-50/50 border-green-100 text-green-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`p-2.5 rounded-lg ${
              offline ? "bg-red-100" : "bg-green-100"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{title}</p>
            <p className="text-xs opacity-75">{subtext}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {offline ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>
      <p className="text-xs font-semibold">
        {offline ? "Offline" : "Operational"}
      </p>
    </div>
  );
}
