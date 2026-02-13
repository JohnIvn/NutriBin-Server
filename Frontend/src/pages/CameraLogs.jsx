import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Camera,
  Search,
  Filter,
  Calendar,
  Maximize2,
  Box,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Trello,
  PieChart as PieIcon,
  ChevronRight,
  User,
  Monitor,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const COLORS = {
  small: "#4F6F52",
  medium: "#3A4D39",
  large: "#739072",
  "N/A": "#A9B388",
};

export default function CameraLogs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, summaryRes] = await Promise.all([
        Requests({ url: "/camera-logs?limit=250", method: "GET" }),
        Requests({ url: "/camera-logs/summary", method: "GET" }),
      ]);

      if (logsRes.data?.ok) setLogs(logsRes.data.logs);
      if (summaryRes.data?.ok) {
        setSummary(summaryRes.data.summary);
        setTrends(summaryRes.data.trends || []);
      }
    } catch (err) {
      toast.error("Failed to fetch camera logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.machine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.classification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${log.first_name} ${log.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesClass =
        selectedClass === "all" || log.classification === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [logs, searchTerm, selectedClass]);

  const pieData = useMemo(() => {
    return summary.map((item) => ({
      name:
        item.classification.charAt(0).toUpperCase() +
        item.classification.slice(1),
      value: parseInt(item.count),
      color: COLORS[item.classification] || "#cbd5e1",
    }));
  }, [summary]);

  const chartData = useMemo(() => {
    return trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }),
      count: parseInt(t.count),
    }));
  }, [trends]);

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Machine ID",
      "Details",
      "Classification",
      "Customer",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          log.camera_log_id,
          log.machine_id,
          `"${log.details}"`,
          log.classification,
          `"${log.first_name} ${log.last_name}"`,
          log.date_created,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `camera_logs_${new Date().toISOString()}.csv`,
    );
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
          Analyzing Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen pb-20 overflow-x-hidden">
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#4F6F52]/10 rounded-lg">
                <Camera className="h-6 w-6 text-[#4F6F52]" />
              </div>
              <Badge
                variant="outline"
                className="text-[#4F6F52] border-[#4F6F52]/20"
              >
                Live Feed Active
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A2421]">
              Vision Analytics
            </h1>
            <p className="text-[#5C6361] text-lg max-w-2xl">
              Monitor machine classification events and telemetry logs in
              real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155]"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Key Metrics */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summary.map((item, idx) => (
              <motion.div
                key={item.classification}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div
                    className="h-1.5 w-full"
                    style={{
                      backgroundColor: COLORS[item.classification] || "#cbd5e1",
                    }}
                  />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {item.classification} Items
                        </p>
                        <h3 className="text-3xl font-black text-slate-900">
                          {item.count}
                        </h3>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52] transition-colors">
                        <Box className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="sm:col-span-2"
            >
              <Card className="border-none shadow-sm bg-[#4F6F52] text-white overflow-hidden relative">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Trello className="h-24 w-24" />
                </div>
                <CardContent className="p-6">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
                    Total Visual Events
                  </p>
                  <h3 className="text-3xl font-black">{logs.length}</h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Trend */}
          <Card className="lg:col-span-5 border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-[#4F6F52]" />
                <CardTitle className="text-lg">Event Activity (7D)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorCount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4F6F52"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4F6F52"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#4F6F52"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card className="lg:col-span-3 border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-[#4F6F52]" />
                <CardTitle className="text-lg">Mix</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[200px]">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm p-4 overflow-visible">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events, machine IDs, or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <p className="text-sm font-semibold text-slate-500 mr-2 whitespace-nowrap">
                  Filter by:
                </p>
                {["all", "small", "medium", "large"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                      ${
                        selectedClass === c
                          ? "bg-[#4F6F52] text-white shadow-md shadow-[#4F6F52]/20"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Machine & Hardware
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Event Detail
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Classification
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Associated User
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => (
                      <motion.tr
                        key={log.camera_log_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52] transition-colors">
                              <Monitor className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-mono font-bold text-slate-700">
                                {log.machine_id?.slice(0, 8)}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Terminal Node
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {log.details?.toLowerCase().includes("fault") ||
                            log.details?.toLowerCase().includes("error") ? (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[11px] font-medium">
                                <AlertCircle className="h-3 w-3" />
                                {log.details}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-sm">
                                {log.details}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-tight"
                            style={{
                              backgroundColor: `${COLORS[log.classification]}15`,
                              color: COLORS[log.classification],
                            }}
                          >
                            <Box className="h-3 w-3 mr-1" />
                            {log.classification}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">
                              {log.first_name
                                ? `${log.first_name} ${log.last_name}`
                                : "System Event"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700 font-medium">
                              {new Date(log.date_created).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(log.date_created).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#4F6F52] transition-all"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Search className="h-12 w-12 mb-4 text-slate-300" />
                          <p className="text-lg font-bold text-slate-400">
                            No matching events
                          </p>
                          <p className="text-sm text-slate-400">
                            Try adjusting your filters or search term
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1A2421]">
              Event Details
            </DialogTitle>
            <DialogDescription>
              Technical breakdown for telemetry event ID:{" "}
              {selectedLog?.camera_log_id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Machine
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-700 truncate">
                    {selectedLog.machine_id}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Classification
                  </p>
                  <Badge
                    style={{
                      backgroundColor: COLORS[selectedLog.classification],
                      color: "white",
                    }}
                    className="border-none"
                  >
                    {selectedLog.classification}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Telemetric Feed
                </p>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedLog.details ||
                    "No telemetric description provided for this event."}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#4F6F52]/5 rounded-xl border border-[#4F6F52]/10">
                <div className="h-10 w-10 rounded-full bg-[#4F6F52] flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedLog.first_name
                      ? `${selectedLog.first_name} ${log.last_name}`
                      : "System Process"}
                  </p>
                  <p className="text-xs text-slate-500">Authorized Operator</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 px-1 pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Captured on{" "}
                  {new Date(selectedLog.date_created).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
