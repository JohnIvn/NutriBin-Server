import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Wind,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Download,
  History,
  Activity,
  User,
  Cpu,
  Clock,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GAS_CONFIG = [
  {
    id: "methane",
    label: "Methane",
    unit: "ppm",
    color: "#4F6F52",
    desc: "CH4 Concentration",
  },
  {
    id: "air_quality",
    label: "Air Quality",
    unit: "ppm",
    color: "#C26A4A",
    desc: "VOC & Particulates",
  },
  {
    id: "combustible_gases",
    label: "Combustibles",
    unit: "ppm",
    color: "#6C5CE7",
    desc: "Alcohol, Ethanol, NH3",
  },
  {
    id: "carbon_monoxide",
    label: "CO Level",
    unit: "ppm",
    color: "#F6C85F",
    desc: "Carbon Monoxide",
  },
  {
    id: "nitrogen",
    label: "Nitrogen",
    unit: "ppm",
    color: "#3A8DFF",
    desc: "N2 Levels",
  },
];

function Sparkline({ data, dataKey, color }) {
  return (
    <div className="h-16 w-full -mx-5 px-5 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#grad-${dataKey})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Emissions() {
  const [summaryData, setSummaryData] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState("");
  const [mainDate, setMainDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmissions = async (date = mainDate) => {
    try {
      setLoading(true);
      const [summaryRes, devicesRes] = await Promise.all([
        Requests({ url: `/emissions/summary?date=${date}`, method: "GET" }),
        Requests({ url: `/emissions/devices?date=${date}`, method: "GET" }),
      ]);

      if (summaryRes.data.ok) {
        setSummaryData(summaryRes.data.data);
        setLatestReading(summaryRes.data.latest);
      }
      if (devicesRes.data.ok) setDeviceData(devicesRes.data.devices);
    } catch {
      toast.error("Failed to fetch emissions data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (machineId, fullName, date = historyDate) => {
    try {
      setHistoryLoading(true);
      setSelectedDevice(machineId);
      setSelectedDeviceName(fullName);
      setIsModalOpen(true);
      const res = await Requests({
        url: `/emissions/history/${machineId}?date=${date}`,
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
    fetchEmissions(mainDate);
  }, [mainDate]);

  useEffect(() => {
    if (isModalOpen && selectedDevice) {
      fetchHistory(selectedDevice, selectedDeviceName, historyDate);
    }
  }, [historyDate]);

  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : 0;
  };

  const formattedChartData = useMemo(() => {
    return summaryData.map((d) => ({
      time: new Date(d.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      methane: toNumber(d.methane),
      air_quality: toNumber(d.air_quality),
      combustible_gases: toNumber(d.combustible_gases),
      carbon_monoxide: toNumber(d.carbon_monoxide),
      nitrogen: toNumber(d.nitrogen),
    }));
  }, [summaryData]);

  const filteredDevices = useMemo(() => {
    return deviceData.filter(
      (dev) =>
        dev.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dev.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [deviceData, searchTerm]);

  const exportToCSV = () => {
    const headers = [
      "Device ID",
      "Owner",
      "Methane",
      "Air Quality",
      "Combustibles",
      "CO",
      "Nitrogen",
      "Timestamp",
    ];
    const csvContent = [
      headers.join(","),
      ...deviceData.map((dev) =>
        [
          dev.machine_id,
          dev.full_name || "Unknown",
          dev.methane || 0,
          dev.air_quality || 0,
          dev.combustible_gases || 0,
          dev.carbon_monoxide || 0,
          dev.nitrogen || 0,
          dev.last_reading || "N/A",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `emissions_${mainDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDFBF7]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#4F6F52] border-t-transparent rounded-full mb-4"
        />
        <p className="text-[#3A4D39] font-medium animate-pulse">
          Syncing Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen pb-20 overflow-x-hidden">
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#4F6F52]/10 rounded-lg">
                <Wind className="h-6 w-6 text-[#4F6F52]" />
              </div>
              <Badge
                variant="outline"
                className="text-[#4F6F52] border-[#4F6F52]/20"
              >
                Atmospheric Monitoring
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A2421]">
              Emissions Analytics
            </h1>
            <p className="text-[#5C6361] text-lg max-w-2xl">
              Track air discharge and gas concentrations across all NutriBin
              units.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={mainDate}
                onChange={(e) => setMainDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fetchEmissions(mainDate)}
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-xl shadow-md"
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {GAS_CONFIG.map((g, idx) => {
            const currentVal = latestReading
              ? toNumber(latestReading[g.id])
              : 0;
            const avgVal =
              summaryData.length > 0
                ? (
                    summaryData.reduce(
                      (acc, curr) => acc + toNumber(curr[g.id]),
                      0,
                    ) / summaryData.length
                  ).toFixed(1)
                : 0;

            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group h-full">
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52] transition-colors">
                        <Activity className="h-5 w-5" />
                      </div>
                      {mainDate === new Date().toISOString().split("T")[0] && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-none text-[10px] font-bold"
                        >
                          LIVE
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {g.label}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-slate-900">
                          {currentVal}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {g.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Avg today: {avgVal} {g.unit}
                      </p>
                    </div>

                    <Sparkline
                      data={formattedChartData}
                      dataKey={g.id}
                      color={g.color}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trend Visualization & Secondary Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-slate-50">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#4F6F52]" />
                  Aggregate Trend
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Average chemical concentration over {mainDate} (hourly)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px] w-full">
                {summaryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedChartData}>
                      <defs>
                        {GAS_CONFIG.map((g) => (
                          <linearGradient
                            key={g.id}
                            id={`fill-${g.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={g.color}
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor={g.color}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                        }}
                      />
                      {GAS_CONFIG.map((g) => (
                        <Area
                          key={g.id}
                          type="monotone"
                          dataKey={g.id}
                          name={g.label}
                          stroke={g.color}
                          fill={`url(#fill-${g.id})`}
                          strokeWidth={2}
                          animationDuration={1500}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                    <History className="h-10 w-10 mb-2 opacity-20" />
                    <p className="font-medium">No trend data for this date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-none shadow-sm bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] text-white">
            <CardHeader>
              <CardTitle className="text-xl">Safety Indices</CardTitle>
              <CardDescription className="text-white/60 text-xs">
                Based on current readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {GAS_CONFIG.slice(0, 3).map((g) => {
                const val = latestReading ? toNumber(latestReading[g.id]) : 0;
                let status = "Operational";
                let color = "bg-green-400/20 text-green-100";

                if (val > 100) {
                  status = "Critial";
                  color = "bg-red-400/20 text-red-100";
                } else if (val > 50) {
                  status = "Warning";
                  color = "bg-emerald-400/20 text-emerald-100";
                }

                return (
                  <div key={g.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-80">
                        {g.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${color}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((val / 200) * 100, 100)}%`,
                        }}
                        className="h-full bg-white transition-all duration-1000 ease-out"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs italic opacity-60 leading-relaxed">
                  * All measurements are calibrated against STP (Standard
                  Temperature and Pressure).
                </p>
                <Link
                  to="/guide"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-bold hover:underline"
                >
                  View Reference Guide <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search device ID or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all"
              />
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Device Identity
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                      Methane
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                      Air Quality
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                      Nitrogen
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Last Captured
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {filteredDevices.map((dev) => (
                      <motion.tr
                        key={dev.machine_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52] transition-colors">
                              <Cpu className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-mono font-bold text-slate-700">
                                {dev.machine_id.slice(0, 12)}...
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {dev.full_name || "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-slate-700">
                            {dev.methane || "0"}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ppm
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-slate-700">
                            {dev.air_quality || "0"}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ppm
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-slate-700">
                            {dev.nitrogen || "0"}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ppm
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-300" />
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                              {dev.last_reading
                                ? new Date(dev.last_reading).toLocaleString(
                                    [],
                                    { dateStyle: "short", timeStyle: "short" },
                                  )
                                : "No Sync"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              fetchHistory(
                                dev.machine_id,
                                dev.full_name,
                                mainDate,
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#4F6F52] text-slate-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <History className="h-3.5 w-3.5" />
                            History
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Wind className="h-12 w-12 mb-4 text-slate-300" />
                          <p className="text-lg font-bold text-slate-400">
                            No device data found
                          </p>
                          <p className="text-sm text-slate-400">
                            Try selecting a different date or search term
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Enhanced History Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl p-0">
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <History className="text-[#4F6F52] h-6 w-6" />
                  Telemetry Deep Dive
                </DialogTitle>
                <DialogDescription className="mt-1 font-medium">
                  {selectedDeviceName || "System Device"} &bull;{" "}
                  <span className="font-mono text-xs">{selectedDevice}</span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  Filter Date:
                </p>
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none shadow-sm"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center h-80">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-500 font-medium">
                  Loading session data...
                </p>
              </div>
            ) : historyData.length > 0 ? (
              <div className="space-y-6">
                <Card className="border-none shadow-md bg-slate-50/50">
                  <CardContent className="p-6">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                          <defs>
                            {GAS_CONFIG.map((g) => (
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
                                  stopOpacity={0.2}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={g.color}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="date_created"
                            tickFormatter={(str) =>
                              new Date(str).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            }
                            fontSize={10}
                            axisLine={false}
                          />
                          <YAxis axisLine={false} fontSize={10} />
                          <Tooltip
                            labelFormatter={(label) =>
                              new Date(label).toLocaleString()
                            }
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          {GAS_CONFIG.map((g) => (
                            <Area
                              key={g.id}
                              type="monotone"
                              dataKey={g.id}
                              name={g.label}
                              stroke={g.color}
                              fill={`url(#modal-grad-${g.id})`}
                              strokeWidth={2.5}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4 text-left">
                          Transmission Time
                        </th>
                        {GAS_CONFIG.map((g) => (
                          <th key={g.id} className="px-6 py-4 text-center">
                            {g.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {historyData
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-slate-500 font-medium tabular-nums text-xs">
                              {new Date(entry.date_created).toLocaleString()}
                            </td>
                            {GAS_CONFIG.map((g) => (
                              <td key={g.id} className="px-6 py-4 text-center">
                                <span className="font-bold text-slate-700 capitalize">
                                  {entry[g.id] || "0"}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-1">
                                  {g.unit}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <History className="h-12 w-12 mb-4 text-slate-300 opacity-50" />
                <p className="text-xl font-black text-slate-400 tracking-tight">
                  Transmission Gap
                </p>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  No readings recorded for the specified date.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
