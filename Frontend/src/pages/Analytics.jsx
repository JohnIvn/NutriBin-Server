import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  });
  const [nutrients, setNutrients] = useState({ n: 0, p: 0, k: 0 });
  const [cameraStats, setCameraStats] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const formatPeso = (v) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(v) || 0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [summaryRes, nutrientRes, cameraRes, backupRes] =
          await Promise.all([
            Requests({ url: "/dashboard/summary" }),
            Requests({ url: "/fertilizer/averages" }),
            Requests({ url: "/camera-logs/summary" }),
            Requests({ url: "/backup/list" }),
          ]);

        if (!mounted) return;

        // Dashboard Summary
        const body = summaryRes?.data;
        const c = body?.counts || {};
        const s = body?.sums || {};
        const prod = body?.production || {};
        const health = body?.health || {};

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
        });

        // Nutrients
        if (nutrientRes?.data?.ok) {
          const navg = nutrientRes.data.averages;
          setNutrients({
            n: parseFloat(navg.nitrogen || 0).toFixed(1),
            p: parseFloat(navg.phosphorus || 0).toFixed(1),
            k: parseFloat(navg.potassium || 0).toFixed(1),
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
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const basePrices = [4.2, 3.8, 5.1, 4.5, 6.2, 7.4];
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      name: days[d.getDay()],
      yield: i === 6 ? parseFloat(stats.fertilizerYieldKg) || 0 : basePrices[i],
    };
  });

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
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1"
              >
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live Feed
              </Badge>
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
                      89.4%
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-md bg-white">
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
            <CardContent className="p-0">
              <div className="max-h-[350px] overflow-y-auto">
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

          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#4F6F52]" />
                Surveillance Intelligence
              </CardTitle>
              <CardDescription>Object detection summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cameraStats.length > 0 ? (
                  cameraStats.map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                        <span className="text-gray-500">
                          {stat.classification}
                        </span>
                        <span className="text-[#3A4D39]">{stat.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4F6F52] opacity-70"
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
                <Button
                  variant="outline"
                  className="w-full mt-4 text-xs font-bold border-[#ECE3CE] text-[#4F6F52]"
                  asChild
                >
                  <Link to="/camera-logs">Open Camera Hub</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/machine">
                    <Cpu className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Machine Hub
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/sales">
                    <DollarSign className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      POS System
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/camera-logs">
                    <Camera className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Surveillance
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 border-[#ECE3CE] hover:bg-[#F6F7F4] hover:border-[#4F6F52]"
                >
                  <Link to="/repairs">
                    <Wrench className="h-5 w-5 text-[#4F6F52]" />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      Maintenance
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#4F6F52]" />
                  Internal Comms
                </CardTitle>
                <Badge className="bg-[#4F6F52] text-white">3 New</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#3A4D39]">
                        Mixer #02 Calibration
                      </p>
                      <p className="text-xs text-gray-500">
                        Scheduled for tomorrow, 10:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 rounded-full bg-[#4F6F52] mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#3A4D39]">
                        v1.2.3 Patch Successful
                      </p>
                      <p className="text-xs text-gray-500">
                        Rollout completed on 82% of fleet
                      </p>
                    </div>
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
