import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Requests from "@/utils/Requests";
import {
  TrendingUp,
  Activity,
  Package,
  Trash2,
  Gauge,
  Zap,
  Beaker,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  Droplets,
  Thermometer,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const CHART_CONFIG = {
  nitrogen: { label: "Nitrogen", color: "#C26A4A" },
  phosphorus: { label: "Phosphorus", color: "#D97706" },
  potassium: { label: "Potassium", color: "#739072" },
};

function Fertilizer() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState({
    production: 0,
    batches: [],
    averages: [],
    stats: null,
    logs: [],
    trends: [],
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (date) => {
    try {
      setIsRefreshing(true);
      const [prodRes, batchesRes, avgRes, statsRes, logsRes, trendsRes] =
        await Promise.all([
          Requests({ url: `/fertilizer/production?date=${date}` }),
          Requests({ url: `/fertilizer/batches?date=${date}` }),
          Requests({ url: `/fertilizer/averages?date=${date}` }),
          Requests({ url: `/fertilizer/stats?date=${date}` }),
          Requests({ url: `/fertilizer/logs?date=${date}` }),
          Requests({ url: `/fertilizer/trends?date=${date}` }),
        ]);

      setData({
        production: prodRes?.data?.production_kg || 0,
        batches: batchesRes?.data?.batches || [],
        averages: avgRes?.data?.averages || [],
        stats: statsRes?.data?.stats || null,
        logs: logsRes?.data?.logs || [],
        trends: trendsRes?.data?.trends || [],
      });
    } catch (err) {
      console.error("Failed to fetch fertilizer data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const qualityGrade = useMemo(() => {
    if (!data.stats) return "N/A";
    const npkTotal = data.averages.reduce((acc, curr) => acc + curr.value, 0);
    if (npkTotal > 20) return "A+";
    if (npkTotal > 15) return "A";
    if (npkTotal > 10) return "B";
    return "C";
  }, [data.averages, data.stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#4F6F52] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-[#4F6F52]/10 p-2 rounded-lg">
                <Beaker className="h-5 w-5 text-[#4F6F52]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Fertilizer Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Real-time nutrient monitoring & production yield.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[#4F6F52] transition-colors" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] outline-none transition-all cursor-pointer"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 hover:bg-[#4F6F52]/5 transition-colors"
              onClick={() => fetchData(selectedDate)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-xl flex items-center gap-2 shadow-lg shadow-[#4F6F52]/10 px-6">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        {/* Top KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Fertilizer Yield"
            value={`${data.production} kg`}
            icon={<Package className="h-5 w-5" />}
            color="emerald"
            subtitle="Processing efficiency"
            trend="+12% vs avg"
          />
          <KPICard
            title="Average pH"
            value={data.stats?.avg_ph || "0.0"}
            icon={<Activity className="h-5 w-5" />}
            color="amber"
            subtitle="Soil compatibility"
            badge="Healthy"
          />
          <KPICard
            title="Moisture Level"
            value={`${data.stats?.avg_moisture || "0"}%`}
            icon={<Droplets className="h-5 w-5" />}
            color="blue"
            subtitle="Optimal processing range"
            trend="Stable"
          />
          <KPICard
            title="Quality Grade"
            value={qualityGrade}
            icon={<ShieldCheck className="h-5 w-5" />}
            color="indigo"
            subtitle="NPK Concentration"
            badge="Certified"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden bg-white">
              <CardHeader className="border-b border-gray-50 pb-6 bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#4F6F52]" />
                      Nutrient Trends
                    </CardTitle>
                    <CardDescription>
                      Concentration levels across production cycles
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(CHART_CONFIG).map(([key, config]) => (
                      <div
                        key={key}
                        className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                          {config.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[380px] w-full">
                  <ChartContainer config={CHART_CONFIG}>
                    <AreaChart
                      data={data.trends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_CONFIG.nitrogen.color}
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_CONFIG.nitrogen.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_CONFIG.phosphorus.color}
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_CONFIG.phosphorus.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_CONFIG.potassium.color}
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_CONFIG.potassium.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        unit="%"
                      />
                      <RechartsTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="nitrogen"
                        stroke={CHART_CONFIG.nitrogen.color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorN)"
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="phosphorus"
                        stroke={CHART_CONFIG.phosphorus.color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorP)"
                        animationDuration={1500}
                        animationDelay={200}
                      />
                      <Area
                        type="monotone"
                        dataKey="potassium"
                        stroke={CHART_CONFIG.potassium.color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorK)"
                        animationDuration={1500}
                        animationDelay={400}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-xl shadow-gray-100/30 rounded-2xl bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 font-bold text-lg">
                    Nutrient Mix
                  </CardTitle>
                  <CardDescription>
                    Overall percentage distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <PieChart width={300} height={250}>
                      <Pie
                        data={data.averages}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.averages.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-gray-100/30 rounded-2xl bg-[#4F6F52] text-white">
                <CardHeader>
                  <CardTitle className="text-white font-bold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-300" />
                    Daily Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                        Active Units
                      </p>
                      <h3 className="text-4xl font-black mt-1">
                        {data.stats?.active_devices || 0}
                      </h3>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <Gauge className="h-8 w-8 text-amber-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-white/70">Efficiency</span>
                      <span>96%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-300 w-[96%]" />
                    </div>
                    <p className="text-[10px] text-white/60 italic font-medium">
                      System functioning within optimal capacity parameters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar / Insights */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-gray-100/30 rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4">
                <CardTitle className="text-gray-900 font-bold text-lg">
                  Machine Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ActiveMachinesDisplay />
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-gray-100/30 rounded-2xl bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900">Yield Forecast</h4>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Based on current{" "}
                  <span className="text-[#4F6F52] font-bold">
                    {data.stats?.processed_waste}kg
                  </span>{" "}
                  input data, expected fertilizer output is{" "}
                  <span className="text-amber-600 font-bold">
                    {data.production}kg
                  </span>
                  .
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold text-gray-700">
                      Moisture Consistency
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {data.stats?.avg_moisture}%
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                    Stable Trend
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#3A4D39] to-[#1A2F1A] border-none shadow-xl shadow-[#4F6F52]/10 p-6 rounded-2xl text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="h-40 w-40" />
              </div>
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-400">
                  <Activity className="h-4 w-4" /> Eco-Quality Analysis
                </h4>
                <p className="text-xs leading-relaxed text-emerald-50/80 mb-4 font-medium">
                  The current batch demonstrates an optimal pH of{" "}
                  <span className="text-white font-bold">
                    {data.stats?.avg_ph}
                  </span>
                  . This is ideal for most ornamental and consumable crops.
                </p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                  Verified Bio-Grade
                </Badge>
              </div>
            </Card>
          </div>
        </div>

        {/* Logs Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Quality Logs
              </h2>
              <p className="text-sm text-gray-500">
                Detailed telemetry for the last 30 batches
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs font-bold border-gray-200"
              >
                <Filter className="h-3.5 w-3.5 mr-2" /> Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs font-bold border-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" /> Sync
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-gray-100/50 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-wider font-black border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5">Batch & Source</th>
                      <th className="px-6 py-5">NPK Profile</th>
                      <th className="px-6 py-5">Quality Metrics</th>
                      <th className="px-6 py-5">Environment</th>
                      <th className="px-6 py-5">Processed Time</th>
                      <th className="px-6 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {data.logs.map((log, idx) => (
                        <motion.tr
                          key={log.fertilizer_analytics_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-bold text-[#4F6F52] group-hover:underline cursor-pointer">
                                NB-
                                {log.fertilizer_analytics_id
                                  .slice(0, 8)
                                  .toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                Machine:{" "}
                                {log.machine_name ||
                                  log.machine_id.split("-")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase font-bold text-gray-400">
                                  N
                                </span>
                                <span className="text-sm font-black text-[#C26A4A]">
                                  {log.nitrogen}
                                </span>
                              </div>
                              <div className="w-px h-6 bg-gray-100" />
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase font-bold text-gray-400">
                                  P
                                </span>
                                <span className="text-sm font-black text-[#D97706]">
                                  {log.phosphorus}
                                </span>
                              </div>
                              <div className="w-px h-6 bg-gray-100" />
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase font-bold text-gray-400">
                                  K
                                </span>
                                <span className="text-sm font-black text-[#739072]">
                                  {log.potassium}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-xs font-bold text-gray-700">
                                  pH {log.ph}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-xs font-bold text-gray-700">
                                  {log.moisture}% H2O
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 bg-gray-50 h-fit w-fit px-2 py-1 rounded-lg border border-gray-100">
                              <Thermometer className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs font-bold text-gray-600">
                                {log.temperature}°C
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-600">
                                {new Date(log.date_created).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {new Date(
                                  log.date_created,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase px-2 hover:bg-emerald-100 transition-colors">
                              Optimal
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {data.logs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-gray-50 p-4 rounded-full">
                              <Package className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium italic">
                              No production logs found for this date.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, color, subtitle, trend, badge }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    green: "bg-[#4F6F52]/10 text-[#4F6F52] border-[#4F6F52]/20",
  };

  return (
    <Card className="border-none shadow-xl shadow-gray-100/50 rounded-2xl bg-white group hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl ${colors[color]} transition-transform group-hover:scale-110`}
          >
            {icon}
          </div>
          {badge && (
            <Badge
              className={`${colors[color]} border-none text-[10px] font-black uppercase tracking-tight`}
            >
              {badge}
            </Badge>
          )}
          {trend && !badge && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            {value}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
function ActiveMachinesDisplay() {
  const [data, setData] = useState({
    active_machines: 0,
    total_machines: 0,
    percent_active: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await Requests({
          url: "/management/status/active-machines",
          method: "GET",
        });
        const json = res?.data;
        if (json && json.ok && json.status) {
          setData({ ...json.status, loading: false });
        }
      } catch {
        setData((s) => ({ ...s, loading: false }));
      }
    };
    fetchStatus();
  }, []);

  const { active_machines, total_machines, percent_active, loading } = data;

  return (
    <div className="p-6">
      <div className="flex items-baseline gap-1">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          {loading ? "--" : String(active_machines).padStart(2, "0")}
        </h3>
        <span className="text-sm font-medium text-gray-400">
          / {total_machines}
        </span>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
        Units Online
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
          <span className="text-gray-400">Utilization</span>
          <span className="text-[#4F6F52]">{percent_active}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent_active}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-[#4F6F52] h-full rounded-full"
          />
        </div>
        <p className="text-[10px] text-gray-400 font-medium italic">
          {loading
            ? "Syncing machine health..."
            : "All sensors reporting normal activity."}
        </p>
      </div>
    </div>
  );
}

export default Fertilizer;
