import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  HardDrive,
  DollarSign,
  Beaker,
  Users as UsersIcon,
  Wrench,
  Activity,
  Megaphone,
  TrendingUp,
  Camera,
  ArrowUpRight,
  Zap,
  Leaf,
  Droplets,
  Wind,
  Settings as SettingsIcon,
  Clock,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function StatCard({ label, value, delta, icon: Icon, to, trend }) {
  return (
    <Card className="relative overflow-hidden border-none shadow-md bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {label}
            </p>
            <h3 className="text-3xl font-bold text-[#3A4D39]">{value}</h3>
          </div>
          <div className="p-2.5 bg-[#F6F7F4] rounded-xl">
            <Icon className="h-6 w-6 text-[#4F6F52]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            vs last period
          </span>
        </div>
        <Link
          to={to}
          className="absolute bottom-0 right-0 p-2 text-[#4F6F52] hover:text-[#3A4D39] transition-colors"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon: Icon, title, when, amount }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
      <div className="p-2 bg-[#F6F7F4] rounded-lg">
        <Icon className="h-5 w-5 text-[#4F6F52]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#3A4D39] truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {when}
        </div>
      </div>
      {amount && (
        <div className="text-sm font-bold text-[#4F6F52]">{amount}</div>
      )}
    </div>
  );
}

function ProgressMetric({ label, value, maxValue, color, icon: Icon, unit }) {
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
        <div className="text-sm font-bold text-[#3A4D39]">
          {value}
          <span className="text-[10px] text-gray-400 ml-1 font-normal">
            {unit}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${color.replace("text-", "bg-")}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Analytics() {
  const [dsStats, setDsStats] = useState({
    totalBatches: 0,
    avgNitrogen: 0,
    avgPhosphorus: 0,
    avgPotassium: 0,
  });
  const [stats, setStats] = useState({
    machinesActive: 0,
    machinesTotal: 0,
    fertilizerYieldKg: 0,
    processedWasteKg: 0,
    salesToday: 0,
    usersCount: 0,
    avgPh: 0,
    avgMoisture: 0,
    avgMethane: 0,
    avgCarbonMonoxide: 0,
    efficiency: 0,
    trends: [],
  });
  const [announcements, setAnnouncements] = useState([]);
  const [nutrients, setNutrients] = useState({ n: 0, p: 0, k: 0 });
  const [cameraStats, setCameraStats] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const formatPeso = (v) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(v) || 0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [
          summaryRes,
          nutrientRes,
          cameraRes,
          backupRes,
          announcementRes,
          dsRes,
        ] = await Promise.all([
          Requests({ url: `/dashboard/summary?range=${dateRange}` }),
          Requests({ url: `/fertilizer/averages?range=${dateRange}` }),
          Requests({ url: "/camera-logs/summary" }),
          Requests({ url: "/backup/list" }),
          Requests({ url: "/announcements" }),
          Requests({ url: "/data-science/summary" }),
        ]);

        if (!mounted) return;

        // Dashboard Summary
        const body = summaryRes?.data;
        const c = body?.counts || {};
        const s = body?.sums || {};
        const prod = body?.production || {};
        const health = body?.health || {};
        const trends = body?.trends || [];

        setStats({
          machinesActive: parseInt(c.active_machines || 0, 10),
          machinesTotal: parseInt(c.total_machines || 0, 10),
          fertilizerYieldKg: parseFloat(prod.production_kg || 0).toFixed(1),
          processedWasteKg: (parseInt(prod.total_batches || 0) * 1.25).toFixed(
            1,
          ),
          salesToday: s.sales_last_24h || 0,
          usersCount: parseInt(c.total_customers || 0, 10),
          avgPh: parseFloat(health.avg_ph || 0).toFixed(1),
          avgMoisture: parseFloat(health.avg_moisture || 0).toFixed(1),
          avgMethane: parseFloat(health.avg_methane || 0).toFixed(1),
          avgCarbonMonoxide: parseFloat(
            health.avg_carbon_monoxide || 0,
          ).toFixed(1),
          efficiency: parseFloat(health.efficiency || 0).toFixed(1),
          trends,
          totalAdmins: parseInt(c.total_admins || 0, 10),
          totalStaff: parseInt(c.total_staff || 0, 10),
        });

        // Nutrients
        if (nutrientRes?.data?.ok) {
          const nSum = nutrientRes.data.summary;
          setNutrients({
            n: nSum?.nitrogen || "0.0",
            p: nSum?.phosphorus || "0.0",
            k: nSum?.potassium || "0.0",
          });
        }

        // Camera
        if (cameraRes?.data?.ok) {
          setCameraStats(cameraRes.data.summary || []);
        }

        // Backups
        if (backupRes?.data?.success) {
          const backups = backupRes.data.backups || [];
          if (backups.length > 0) {
            setLastBackup(backups[0]);
          }
        }

        // Announcements
        if (announcementRes?.data?.ok) {
          setAnnouncements(announcementRes.data.announcements.slice(0, 3));
        }

        // Data Science
        if (dsRes?.data?.ok) {
          const ds = dsRes.data.summary || {};
          setDsStats({
            totalBatches: parseInt(ds.total_batches || 0),
            avgNitrogen: parseFloat(ds.avg_nitrogen || 0).toFixed(1),
            avgPhosphorus: parseFloat(ds.avg_phosphorus || 0).toFixed(1),
            avgPotassium: parseFloat(ds.avg_potassium || 0).toFixed(1),
          });
        }

        const recent = (body?.recent_sales || []).map((r) => ({
          id: r.sale_id,
          icon: DollarSign,
          title: `${r.product || "Sale"}`,
          amount: formatPeso(r.amount),
          when: r.sale_date
            ? new Date(r.sale_date).toLocaleString()
            : r.date_created,
        }));

        setRecentActivity(recent);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "machines" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fertilizer_analytics" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_customer" },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  const chartData = Array.from({ length: parseInt(dateRange, 10) }).map(
    (_, i) => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const d = new Date();
      // Use local date for year, month, date to avoid timezone shifts
      const today = new Date();
      d.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (parseInt(dateRange, 10) - 1 - i));

      // match YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const trendEntry = stats.trends?.find((t) => t.date.startsWith(dateStr));

      return {
        name:
          parseInt(dateRange, 10) <= 7
            ? days[d.getDay()]
            : d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
        yield: trendEntry ? parseFloat(trendEntry.production_kg) : 0,
      };
    },
  );

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-12">
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#3A4D39] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 font-medium">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              • System pulse is looking{" "}
              <span className="text-green-600 font-bold">healthy</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastBackup && (
              <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Last Backup
                </span>
                <span className="text-xs font-semibold text-[#3A4D39]">
                  {new Date(lastBackup.created).toLocaleDateString()} (
                  {lastBackup.sizeFormatted})
                </span>
              </div>
            )}
            <Button
              asChild
              variant="outline"
              className="border-[#ECE3CE] text-[#3A4D39] hover:bg-[#F6F7F4]"
            >
              <Link to="/settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
            </Button>
            <Button className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white">
              <Zap className="h-4 w-4 mr-2" /> Global Sync
            </Button>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Fleet"
            value={`${stats.machinesActive}/${stats.machinesTotal}`}
            delta="98%"
            trend="up"
            icon={Cpu}
            to="/machine"
          />
          <StatCard
            label="Fertilizer Yield"
            value={`${stats.fertilizerYieldKg}kg`}
            delta="+14%"
            trend="up"
            icon={Leaf}
            to="/fertilizer"
          />
          <StatCard
            label="Sales (24h)"
            value={formatPeso(stats.salesToday)}
            delta="+5.2%"
            trend="up"
            icon={DollarSign}
            to="/sales"
          />
          <StatCard
            label="Community"
            value={stats.usersCount}
            delta="+12"
            trend="up"
            icon={UsersIcon}
            to="/users"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operational Intelligence */}
          <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 px-8 pt-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#3A4D39] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#4F6F52]" />
                  Operational Intelligence
                </CardTitle>
                <CardDescription>
                  Production trends & substrate health metrics
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[120px] h-8 text-xs font-semibold bg-[#F6F7F4] border-none">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="14">Last 14 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-100 hidden sm:flex items-center gap-1"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live Feed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                {/* Left side: Progress list */}
                <div className="md:col-span-2 space-y-6">
                  <ProgressMetric
                    label="pH Level"
                    value={stats.avgPh}
                    maxValue={14}
                    color="text-green-600"
                    icon={Beaker}
                    unit="pH"
                  />
                  <ProgressMetric
                    label="Moisture"
                    value={stats.avgMoisture}
                    maxValue={100}
                    color="text-blue-500"
                    icon={Droplets}
                    unit="%"
                  />
                  <ProgressMetric
                    label="Waste Conversion"
                    value={(
                      (stats.fertilizerYieldKg /
                        (stats.processedWasteKg || 1)) *
                      100
                    ).toFixed(1)}
                    maxValue={100}
                    color="text-[#4F6F52]"
                    icon={TrendingUp}
                    unit="%"
                  />

                  <div className="pt-4 p-4 bg-[#F6F7F4] rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">
                      Current Efficiency
                    </p>
                    <div className="text-3xl font-black text-[#3A4D39] text-center">
                      {stats.efficiency}%
                    </div>
                  </div>
                </div>

                {/* Right side: Yield chart */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[#3A4D39]">
                      Yield Forecast (kg)
                    </h4>
                    <span className="text-xs text-gray-400 font-medium italic">
                      Updated{" "}
                      {lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorYield"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4F6F52"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4F6F52"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="yield"
                          stroke="#4F6F52"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorYield)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality & Environment */}
          <div className="space-y-6">
            <Card className="border-none shadow-md bg-[#3A4D39] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wind className="h-5 w-5 text-[#86A789]" />
                  Air Environment
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Safety parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      Carbon Monoxide
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        {stats.avgCarbonMonoxide}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">
                        ppm
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Safe
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      Methane Level
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        {stats.avgMethane}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">
                        ppm
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Stable
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-[#3A4D39]">
                  <Beaker className="h-5 w-5 text-[#4F6F52]" />
                  Nutrient Profile
                </CardTitle>
                <CardDescription>Average N-P-K distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 rounded-2xl bg-[#F6F7F4]">
                    <div className="text-lg font-black text-[#4F6F52]">
                      {nutrients.n}%
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Nitrogen
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-[#F6F7F4]">
                    <div className="text-lg font-black text-[#3A4D39]">
                      {nutrients.p}%
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Phosphorus
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-[#F6F7F4]">
                    <div className="text-lg font-black text-[#86A789]">
                      {nutrients.k}%
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Potassium
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Third Row: Recent Activity, Surveillance, Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="flex flex-col gap-8 h-full">
            <Card className="border-none shadow-md bg-white flex flex-col flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <CardDescription>Latest sales activity</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sales" className="text-[#4F6F52] font-bold">
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto max-h-[450px]">
                  {loading ? (
                    <div className="p-12 text-center text-gray-400 italic text-sm">
                      Synchronizing records...
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((a) => (
                      <ActivityItem
                        key={a.id}
                        icon={a.icon}
                        title={a.title}
                        when={a.when}
                        amount={a.amount}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-400 italic text-sm">
                      No recent records found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-[#3A4D39] text-white flex flex-col flex-1 min-h-[250px] overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#86A789]" />
                  Data Science Insights
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Macro-nutrient distribution & trends
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-4 relative">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center group-hover:transform group-hover:scale-105 transition-transform">
                    <p className="text-2xl font-black text-white">
                      {dsStats.avgNitrogen}%
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                      Avg N
                    </p>
                  </div>
                  <div className="text-center group-hover:transform group-hover:scale-105 transition-transform">
                    <p className="text-2xl font-black text-white">
                      {dsStats.avgPhosphorus}%
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                      Avg P
                    </p>
                  </div>
                  <div className="text-center group-hover:transform group-hover:scale-105 transition-transform">
                    <p className="text-2xl font-black text-white">
                      {dsStats.avgPotassium}%
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                      Avg K
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-gray-300">Total Batch Samples</span>
                    <span className="font-bold">{dsStats.totalBatches}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#86A789] w-[78%]" />
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed text-center px-4">
                    Machine learning models suggest optimal harvest windows are
                    currently within 48-72 hours.
                  </p>
                </div>
                <Button
                  className="w-full mt-6 bg-[#86A789] hover:bg-[#4F6F52] text-white font-bold"
                  size="sm"
                  asChild
                >
                  <Link to="/analytics">View Full Science Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-8 h-full">
            <Card className="border-none shadow-md bg-white flex flex-col flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#4F6F52]" />
                  Surveillance Intelligence
                </CardTitle>
                <CardDescription>Object detection summary</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-6">
                  {cameraStats.length > 0 ? (
                    cameraStats.map((stat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                          <span className="text-gray-500">
                            {stat.classification}
                          </span>
                          <span className="text-[#3A4D39]">{stat.count}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4F6F52] transition-all duration-500"
                            style={{
                              width: `${(stat.count / Math.max(...cameraStats.map((s) => s.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-sm italic">
                      No surveillance data processed
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 mt-auto">
                    <div className="p-4 bg-[#F6F7F4] rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Analysis Confidence
                      </p>
                      <div className="text-xl font-black text-[#3A4D39]">
                        94.2%
                      </div>
                    </div>
                    <div className="p-4 bg-[#F6F7F4] rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Active Feeds
                      </p>
                      <div className="text-xl font-black text-[#3A4D39]">
                        12
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2 text-xs font-bold border-[#ECE3CE] text-[#4F6F52]"
                    asChild
                  >
                    <Link to="/camera-logs">Open Camera Hub</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white flex flex-col flex-1 min-h-[250px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-[#4F6F52]" />
                  Eco-Impact Metrics
                </CardTitle>
                <CardDescription>Environmental contribution</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <div className="p-5 bg-green-50 rounded-2xl border border-green-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                      Carbon Offset
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-green-800">
                        12.4
                      </span>
                      <span className="text-[10px] text-green-600 font-bold">
                        TONS CO2e
                      </span>
                    </div>
                  </div>
                  <Wind className="absolute top-1/2 -right-4 -translate-y-1/2 h-24 w-24 text-green-600/10 -rotate-12" />
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                  <div>
                    <p className="text-xs font-bold text-[#3A4D39]">
                      Trees Equivalent
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Verified Estimate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#4F6F52]">~580</p>
                  </div>
                </div>

                <Button className="w-full bg-[#4F6F52] hover:bg-[#3A4D39] text-white text-xs font-bold uppercase tracking-wider h-11">
                  View Emissions Report
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-8 h-full">
            <Card className="border-none shadow-md bg-white flex flex-col flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/firmware">
                    <Zap className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Firmware OTA
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/analytics">
                    <TrendingUp className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Data Science
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/backup">
                    <HardDrive className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Backup & DBs
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/support">
                    <Wrench className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      System Support
                    </span>
                  </Link>
                </Button>
              </CardContent>

              <div className="px-6 pb-6 pt-2">
                <div className="p-4 bg-[#3A4D39] rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase">
                      System Integrity
                    </p>
                    <p className="text-sm font-bold">100% Operational</p>
                  </div>
                  <Badge className="bg-green-500 text-white border-none text-[8px]">
                    PRO
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-md bg-white flex flex-col flex-1 min-h-[250px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#4F6F52]" />
                  Announcements
                </CardTitle>
                {announcements.length > 0 && (
                  <Badge className="bg-[#4F6F52] text-white">
                    {announcements.length} Latest
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex flex-col flex-1 h-full">
                <div className="space-y-4 flex-1">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <div
                        key={ann.announcement_id}
                        className="flex items-start gap-4"
                      >
                        <div
                          className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                            ann.priority === "high"
                              ? "bg-red-500"
                              : ann.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-[#4F6F52]"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#3A4D39]">
                            {ann.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {ann.body}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">
                            {ann.date_published
                              ? new Date(
                                  ann.date_published,
                                ).toLocaleDateString()
                              : new Date(ann.date_created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-sm italic">
                      No active announcements
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Admin Count
                    </p>
                    <p className="text-sm font-bold text-[#3A4D39]">
                      {stats.totalAdmins || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Active Staff
                    </p>
                    <p className="text-sm font-bold text-[#3A4D39]">
                      {stats.totalStaff || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
