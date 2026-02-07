import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

export default function CameraLogs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, summaryRes] = await Promise.all([
        Requests({ url: "/camera-logs", method: "GET" }),
        Requests({ url: "/camera-logs/summary", method: "GET" }),
      ]);

      if (logsRes.data?.ok) setLogs(logsRes.data.logs);
      if (summaryRes.data?.ok) setSummary(summaryRes.data.summary);
    } catch {
      toast.error("Failed to fetch camera logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.machine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.classification?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#ECE3CE]/10">
        <div className="w-14 h-14 border-[5px] border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3A4D39]">
              Camera Telemetry Logs
            </h1>
            <p className="text-sm text-[#6B6F68] italic mt-1">
              Visual classification and machine vision event history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search machine or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6F52]"
              />
            </div>
            <button
              onClick={fetchData}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 text-[#4F6F52]" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-gray-50">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Small Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-black text-[#3A4D39]">
                {summary.find((s) => s.classification === "small")?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-gray-50">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Medium Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-black text-[#3A4D39]">
                {summary.find((s) => s.classification === "medium")?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-gray-50">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Large Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-black text-[#3A4D39]">
                {summary.find((s) => s.classification === "large")?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#4F6F52] border-none shadow-sm rounded-xl overflow-hidden text-white">
            <CardHeader className="p-4 pb-2 border-b border-white/10">
              <CardTitle className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-black">{logs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card className="shadow-md border-none bg-white rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FAF9F6] rounded-lg">
                <Camera className="h-5 w-5 text-[#4F6F52]" />
              </div>
              <div>
                <CardTitle className="text-[#3A4D39] text-xl">
                  Event Stream
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological feed of camera classification events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF9F6] text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Machine ID</th>
                    <th className="px-6 py-4">Event Details</th>
                    <th className="px-6 py-4">Classification</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.camera_log_id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-[#4F6F52]">
                        {log.machine_id?.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.details?.toLowerCase().includes("fault") ? (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          ) : (
                            <Box className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-700">{log.details}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight
                          ${
                            log.classification === "large"
                              ? "bg-orange-100 text-orange-700"
                              : log.classification === "medium"
                                ? "bg-blue-100 text-blue-700"
                                : log.classification === "small"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {log.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.first_name
                          ? `${log.first_name} ${log.last_name}`
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.date_created).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#4F6F52] hover:bg-[#4F6F52]/10 p-1.5 rounded-md transition-colors">
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-20 text-center text-gray-400 italic"
                      >
                        No camera logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
