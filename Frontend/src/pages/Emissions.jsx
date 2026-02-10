import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [summaryData, setSummaryData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example (placeholder) telemetry for each gas — replace with real API data later
  const gases = useMemo(
    () => [
      { id: "methane", label: "Methane", unit: "ppm", color: "#4F6F52" },
      { id: "hydrogen", label: "Hydrogen", unit: "ppm", color: "#C26A4A" },
      { id: "benzene", label: "Benzene", unit: "ppm", color: "#6C5CE7" },
      { id: "smoke", label: "Smoke/Ammonia", unit: "ppm", color: "#F6C85F" },
      { id: "nitrogen", label: "Nitrogen", unit: "ppm", color: "#3A8DFF" },
    ],
    [],
  );

  const fetchEmissions = async () => {
    try {
      setLoading(true);
      const [summaryRes, devicesRes] = await Promise.all([
        Requests({ url: "/emissions/summary", method: "GET" }),
        Requests({ url: "/emissions/devices", method: "GET" }),
      ]);

      if (summaryRes.data.ok) setSummaryData(summaryRes.data.data);
      if (devicesRes.data.ok) setDeviceData(devicesRes.data.devices);
    } catch {
      toast.error("Failed to fetch emissions data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (machineId, fullName) => {
    try {
      setHistoryLoading(true);
      setSelectedDevice(machineId);
      setSelectedDeviceName(fullName);
      setIsModalOpen(true);
      const res = await Requests({
        url: `/emissions/history/${machineId}`,
        method: "GET",
      });
      if (res.data.ok) {
        setHistoryData(res.data.history.reverse());
      }
    } catch {
      toast.error("Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, []);

  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : 0;
  };

  const formattedChartData = useMemo(() => {
    return summaryData.map((d, i) => ({
      t: i,
      methane: toNumber(d.methane),
      hydrogen: toNumber(d.hydrogen),
      benzene: toNumber(d.benzene),
      smoke: toNumber(d.smoke),
      nitrogen: toNumber(d.nitrogen),
    }));
  }, [summaryData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-14 h-14 border-[5px] border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          {gases.map((g) => (
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
                    {formattedChartData.length > 0
                      ? formattedChartData.slice(-1)[0][g.id]
                      : "0"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <Sparkline
                  data={formattedChartData}
                  dataKey={g.id}
                  color={g.color}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Last {formattedChartData.length} readings
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
                      <th className="py-2 pr-4">Device ID</th>
                      <th className="py-2 pr-4">Full Name</th>
                      <th className="py-2 pr-4">Methane (ppm)</th>
                      <th className="py-2 pr-4">Hydrogen (ppm)</th>
                      <th className="py-2 pr-4">Benzene (ppm)</th>
                      <th className="py-2 pr-4">Smoke (ppm)</th>
                      <th className="py-2 pr-4">Nitrogen (ppm)</th>
                      <th className="py-2 pr-4">Last Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deviceData.map((dev) => {
                      const lastSync = dev.last_reading
                        ? new Date(dev.last_reading).toLocaleString()
                        : "Never";
                      return (
                        <tr
                          key={dev.machine_id}
                          className="align-top hover:bg-gray-50/50"
                        >
                          <td className="py-3 pr-4 font-medium">
                            <button
                              onClick={() =>
                                fetchHistory(dev.machine_id, dev.full_name)
                              }
                              className="text-[#4F6F52] hover:underline transition-all"
                            >
                              {dev.machine_id.slice(0, 8)}...
                            </button>
                          </td>
                          <td className="py-3 pr-4 font-normal text-gray-700">
                            {dev.full_name || "Unknown"}
                          </td>
                          <td className="py-3 pr-4">{dev.methane || "0"}</td>
                          <td className="py-3 pr-4">{dev.hydrogen || "0"}</td>
                          <td className="py-3 pr-4">{dev.benzene || "0"}</td>
                          <td className="py-3 pr-4">{dev.smoke || "0"}</td>
                          <td className="py-3 pr-4">{dev.nitrogen || "0"}</td>
                          <td className="py-3 pr-4 text-xs text-gray-500">
                            {lastSync}
                          </td>
                        </tr>
                      );
                    })}
                    {deviceData.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-10 text-center text-gray-400"
                        >
                          No device telemetry found.
                        </td>
                      </tr>
                    )}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#3A4D39]">
              Emissions History
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({selectedDeviceName || "No Owner"} — {selectedDevice})
              </span>
            </DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="h-[300px] w-full bg-gray-50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      {gases.map((g) => (
                        <linearGradient
                          key={g.id}
                          id={`modal-grad-${g.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={g.color}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={g.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="date_created"
                      tickFormatter={(str) =>
                        new Date(str).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }
                      fontSize={10}
                      tickMargin={10}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    {gases.map((g) => (
                      <Area
                        key={g.id}
                        type="monotone"
                        dataKey={g.id}
                        stroke={g.color}
                        fill={`url(#modal-grad-${g.id})`}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Time</th>
                      {gases.map((g) => (
                        <th
                          key={g.id}
                          className="px-4 py-3 text-left font-medium"
                        >
                          {g.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyData
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-500 tabular-nums">
                            {new Date(entry.date_created).toLocaleString()}
                          </td>
                          {gases.map((g) => (
                            <td key={g.id} className="px-4 py-3 font-medium">
                              {entry[g.id] || "0"}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
