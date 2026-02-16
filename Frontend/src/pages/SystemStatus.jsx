import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ShieldCheck,
  Server,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageWrapper from "@/components/ui/pagewrapper";
import PageHeader from "@/components/ui/pageheader";

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await Requests({ url: "/health" });
      setStatus(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch health status:", err);
      setError(err.response?.data || "System unreachable");
      if (err.response?.data) {
        setStatus(err.response.data);
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state) => {
    if (state === "up") return "bg-green-100 text-green-700 border-green-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const StatusIndicator = ({ state }) => (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(state)}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${state === "up" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
      />
      {state === "up" ? "Operational" : "Critical"}
    </div>
  );

  return (
    <PageWrapper>
      <div className="pb-12">
        <PageHeader
          title="System Health"
          icon={<Server className="w-10 h-10 text-[#4F6F52]" />}
        />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${status?.status === "up" ? "bg-green-500" : "bg-red-500"}`}
            >
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">
                Environment Status
              </p>
              <h2 className="text-xl font-bold text-[#3A4D39]">
                {status?.status === "up"
                  ? "All Systems Functional"
                  : "System Issues Detected"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Last Check
              </p>
              <p className="text-sm font-semibold flex items-center gap-1.5 text-gray-600 justify-end">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}
              </p>
            </div>
            <Button
              onClick={fetchStatus}
              disabled={loading}
              variant="default"
              className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white shadow-lg shadow-[#4F6F52]/20 rounded-xl px-6"
            >
              <RefreshCcw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Re-validate
            </Button>
          </div>
        </div>

        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Database Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden group">
              <div
                className={`h-1.5 w-full ${status.info?.database?.status === "up" ? "bg-green-500" : "bg-red-500"}`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#F6F7F4] rounded-2xl group-hover:scale-110 transition-transform">
                    <Database className="h-6 w-6 text-[#4F6F52]" />
                  </div>
                  <StatusIndicator
                    state={
                      status.info?.database?.status ||
                      status.error?.database?.status
                    }
                  />
                </div>
                <h3 className="text-lg font-bold text-[#3A4D39] mb-1">
                  PostgreSQL Database
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  Core persistence layer connectivity
                </p>

                {status.error?.database?.message && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                      {status.error.database.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memory Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden group">
              <div
                className={`h-1.5 w-full ${status.info?.memory_heap?.status === "up" ? "bg-green-500" : "bg-red-500"}`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#F6F7F4] rounded-2xl group-hover:scale-110 transition-transform">
                    <Cpu className="h-6 w-6 text-[#4F6F52]" />
                  </div>
                  <StatusIndicator
                    state={
                      status.info?.memory_heap?.status ||
                      status.error?.memory_heap?.status
                    }
                  />
                </div>
                <h3 className="text-lg font-bold text-[#3A4D39] mb-1">
                  Heap Allocation
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  V8 Engine memory management
                </p>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Usage</span>
                    <span>150MB Limit</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${status.info?.memory_heap?.status === "up" ? "bg-[#4F6F52]" : "bg-red-500"}`}
                      style={{
                        width: `${status.info?.memory_heap?.status === "up" ? "45%" : "95%"}`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSS Memory Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden group">
              <div
                className={`h-1.5 w-full ${status.info?.memory_rss?.status === "up" ? "bg-green-500" : "bg-red-500"}`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#F6F7F4] rounded-2xl group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-[#4F6F52]" />
                  </div>
                  <StatusIndicator
                    state={
                      status.info?.memory_rss?.status ||
                      status.error?.memory_rss?.status
                    }
                  />
                </div>
                <h3 className="text-lg font-bold text-[#3A4D39] mb-1">
                  Resident Set Size
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  Total process memory footprint
                </p>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Footprint</span>
                    <span>300MB Limit</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${status.info?.memory_rss?.status === "up" ? "bg-[#4F6F52]" : "bg-red-500"}`}
                      style={{
                        width: `${status.info?.memory_rss?.status === "up" ? "30%" : "98%"}`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border border-dashed border-[#4F6F52]/30">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <RefreshCcw className="w-12 h-12 animate-spin text-[#4F6F52]" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#4F6F52]/20" />
                </div>
                <p className="text-sm font-bold text-[#4F6F52] animate-pulse">
                  Establishing contact with Terminus...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center px-6">
                <div className="p-4 bg-red-100 rounded-2xl">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#3A4D39]">
                    Connection Failed
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mt-1">
                    The health service is currently unreachable. Please check
                    the network or server logs.
                  </p>
                </div>
                <Button
                  onClick={fetchStatus}
                  variant="outline"
                  className="mt-2 rounded-xl"
                >
                  Retry Connection
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 p-6 bg-[#3A4D39] rounded-2xl text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-[#3A4D39]/20">
          <div className="p-3 bg-white/10 rounded-xl">
            <Activity className="w-6 h-6 text-[#A0C49D]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-lg">Continuous Monitoring Active</h4>
            <p className="text-sm text-[#A0C49D] font-medium mt-0.5">
              The dashboard is automatically polling the backend every 30
              seconds for real-time diagnostics.
            </p>
          </div>
          <Badge className="bg-[#4F6F52] text-white border-none py-1.5 px-4 font-bold tracking-wider">
            AUTO-SYNC ON
          </Badge>
        </div>
      </div>
    </PageWrapper>
  );
}
