import { useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

function Sparkline({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={`url(#grad-${dataKey})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Emissions() {
  const { user } = useUser();

  // Example (placeholder) telemetry for each gas — replace with real API data later
  const gases = useMemo(
    () => [
      { id: "methane", label: "Methane", unit: "ppm", color: "#4F6F52" },
      { id: "hydrogen", label: "Hydrogen", unit: "ppm", color: "#C26A4A" },
      { id: "benzene", label: "Benzene", unit: "ppm", color: "#6C5CE7" },
      { id: "ammonia", label: "Ammonia", unit: "ppm", color: "#F6C85F" },
      { id: "nitrogen", label: "Nitrogen", unit: "ppm", color: "#3A8DFF" },
    ],
    [],
  );

  const sampleData = (seed = 1) =>
    Array.from({ length: 12 }).map((_, i) => ({
      t: i,
      val: Math.max(
        0,
        Math.round(
          (2 + Math.sin((i + seed) / 2) * 2 + Math.random() * 1.2) * 10,
        ) / 10,
      ),
    }));

  return (
    <div className="w-full bg-gradient-to-br from-[#ECE3CE]/10 via-white to-[#ECE3CE]/5 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] rounded-2xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12s1.5-4 9-4 9 4 9 4-1.5 4-9 4S3 12 3 12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#3A4D39] tracking-tight">
              Emissions
            </h1>
            <p className="text-sm text-[#6B6F68] mt-1">
              Track air discharge from your NutriBin (per-device telemetry)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {gases.map((g, idx) => (
            <Card
              key={g.id}
              className="rounded-2xl border shadow-sm hover:shadow-md overflow-hidden"
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-[#3A4D39]">
                      {g.label}
                    </CardTitle>
                    <div className="text-xs text-gray-400">
                      Current ({g.unit})
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-[#3A4D39]">
                    {sampleData(idx + 1).slice(-1)[0].val}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <Sparkline
                  data={sampleData(idx + 1).map((d) => ({
                    t: d.t,
                    [g.id]: d.val,
                  }))}
                  dataKey={g.id}
                  color={g.color}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Last 12 readings
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-6">
          <Card className="rounded-2xl p-4">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Details (Per Device)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="py-2 pr-4">Device</th>
                      <th className="py-2 pr-4">Location</th>
                      <th className="py-2 pr-4">Methane (ppm)</th>
                      <th className="py-2 pr-4">Hydrogen (ppm)</th>
                      <th className="py-2 pr-4">Benzene (ppm)</th>
                      <th className="py-2 pr-4">Ammonia (ppm)</th>
                      <th className="py-2 pr-4">Nitrogen (ppm)</th>
                      <th className="py-2 pr-4">Last</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Array.from({ length: 4 }).map((_, di) => {
                      const seed = di + 2;
                      const m = sampleData(seed + 1).slice(-1)[0].val;
                      const h = sampleData(seed + 2).slice(-1)[0].val;
                      const b = sampleData(seed + 3).slice(-1)[0].val;
                      const a = sampleData(seed + 4).slice(-1)[0].val;
                      const n = sampleData(seed + 5).slice(-1)[0].val;
                      const last = new Date().toLocaleString();
                      return (
                        <tr key={di} className="align-top">
                          <td className="py-3 pr-4 font-medium text-[#3A4D39]">
                            Bin #{String(di + 1).padStart(2, "0")}
                          </td>
                          <td className="py-3 pr-4 text-gray-600">
                            Zone {String.fromCharCode(65 + di)}
                          </td>
                          <td className="py-3 pr-4">{m} ppm</td>
                          <td className="py-3 pr-4">{h} ppm</td>
                          <td className="py-3 pr-4">{b} ppm</td>
                          <td className="py-3 pr-4">{a} ppm</td>
                          <td className="py-3 pr-4">{n} ppm</td>
                          <td className="py-3 pr-4 text-gray-500">{last}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  to="/guide"
                  className="text-sm text-[#4F6F52] font-medium"
                >
                  View telemetry guide
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
