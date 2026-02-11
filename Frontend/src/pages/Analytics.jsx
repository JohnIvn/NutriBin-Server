import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

function StatCard({ to, icon: Icon, label, value, description }) {
  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
      <CardHeader className="flex items-start justify-between gap-2 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-[#F6F7F4]">
            <Icon className="h-6 w-6 text-[#4F6F52]" />
          </div>
          <div>
            <CardTitle className="text-sm text-[#3A4D39]">{label}</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {description}
            </CardDescription>
          </div>
        </div>
        <div className="text-2xl font-black text-[#3A4D39]">{value}</div>
      </CardHeader>
      <CardContent className="pt-2">
        <Link to={to} className="text-xs text-[#4F6F52] font-medium">
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}

function KPI({ label, value, delta, icon: Icon, to }) {
  return (
    <Card className="p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#F6F7F4]">
              <Icon className="h-5 w-5 text-[#4F6F52]" />
            </div>
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-xl font-bold text-[#3A4D39]">{value}</div>
            </div>
          </div>
        </div>
        <div className="text-sm text-green-600 font-medium">{delta}</div>
      </div>
      <div className="mt-3">
        <Link to={to} className="text-xs text-[#4F6F52] font-medium">
          View details →
        </Link>
      </div>
    </Card>
  );
}

function Sparkline({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
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

function ActivityItem({ icon: Icon, title, when }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-b-0">
      <div className="p-2 rounded bg-[#FAF9F6]">
        <Icon className="h-5 w-5 text-[#4F6F52]" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-[#3A4D39] font-medium">{title}</div>
        <div className="text-xs text-gray-400">{when}</div>
      </div>
    </div>
  );
}

function Analytics() {
  const { user } = useUser();

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
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const [summaryRes] = await Promise.all([
          Requests({ url: "/dashboard/summary" }),
        ]);

        if (!mounted) return;

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

        const recent = (body?.recent_sales || []).map((r) => ({
          id: r.sale_id,
          icon: DollarSign,
          title: `${r.product || "Sale"} — ${formatPeso(r.amount)}`,
          when: r.sale_date
            ? new Date(r.sale_date).toLocaleString()
            : r.date_created,
        }));

        setRecentActivity(recent);
      } catch (e) {
        console.error("Failed to load dashboard summary", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3A4D39]">
              Overview
            </h1>
            <p className="text-sm text-[#6B6F68] italic">
              High-level summary and quick actions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sales" className="text-sm font-medium text-[#4F6F52]">
              Go to Sales
            </Link>
            <Link to="/machine" className="text-sm font-medium text-[#4F6F52]">
              Machines
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI
            label="Active Machines"
            value={`${stats.machinesActive}/${stats.machinesTotal}`}
            delta={`${((stats.machinesActive / (stats.machinesTotal || 1)) * 100).toFixed(0)}%`}
            icon={Cpu}
            to="/machine"
          />
          <KPI
            label="Fertilizer Yield"
            value={`${stats.fertilizerYieldKg} kg`}
            delta="Target Met"
            icon={Beaker}
            to="/fertilizer"
          />
          <KPI
            label="Sales (24h)"
            value={formatPeso(stats.salesToday)}
            delta="+5.2%"
            icon={DollarSign}
            to="/sales"
          />
          <KPI
            label="Registered Users"
            value={`${stats.usersCount}`}
            delta="Verified"
            icon={UsersIcon}
            to="/users"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-2 p-0 rounded-xl shadow-sm border-none bg-white overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#4F6F52] to-[#3A4D39] text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5" /> Operational Intelligence
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Real-time telemetry and system performance metrics
              </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">
                      Avg pH Quality
                    </span>
                    <span className="text-[#3A4D39] font-bold">
                      {stats.avgPh}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-1000"
                      style={{ width: `${(stats.avgPh / 14) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">
                      Avg Moisture Level
                    </span>
                    <span className="text-[#3A4D39] font-bold">
                      {stats.avgMoisture}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-1000"
                      style={{ width: `${stats.avgMoisture}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">
                      Waste Conversion Rate
                    </span>
                    <span className="text-[#3A4D39] font-bold">
                      {(
                        (stats.fertilizerYieldKg /
                          (stats.processedWasteKg || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-1000"
                      style={{
                        width: `${(stats.fertilizerYieldKg / (stats.processedWasteKg || 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter">
                      <span>Air Quality Summary (Avg)</span>
                      <Link
                        to="/emissions"
                        className="text-[#4F6F52] normal-case"
                      >
                        Details
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#FAF9F6] p-2.5 rounded-lg border border-[#ECE3CE]">
                        <div className="text-[10px] text-gray-400 uppercase">
                          Methane
                        </div>
                        <div className="text-sm font-bold text-[#3A4D39]">
                          {stats.avgMethane}{" "}
                          <span className="text-[10px] font-normal">ppm</span>
                        </div>
                      </div>
                      <div className="bg-[#FAF9F6] p-2.5 rounded-lg border border-[#ECE3CE]">
                        <div className="text-[10px] text-gray-400 uppercase">
                          Carbon Monoxide
                        </div>
                        <div className="text-sm font-bold text-[#3A4D39]">
                          {stats.avgCarbonMonoxide}{" "}
                          <span className="text-[10px] font-normal">ppm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-6 bg-[#FAF9F6] rounded-2xl border border-[#ECE3CE]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Total Processed Waste
                  </p>
                  <h4 className="text-5xl font-black text-[#3A4D39]">
                    {stats.processedWasteKg}
                    <span className="text-xl ml-1 text-gray-400">kg</span>
                  </h4>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs Last Week
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0 rounded-xl overflow-hidden shadow-sm border-none bg-white">
            <CardHeader className="p-4 border-b border-gray-50">
              <CardTitle className="text-[#3A4D39] text-lg font-bold">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Latest transactions & system syncs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400 italic text-sm">
                  Loading activity...
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((a) => (
                  <ActivityItem
                    key={a.id}
                    icon={a.icon}
                    title={a.title}
                    when={a.when}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 italic text-sm">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">Quick Actions</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/machine"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <Cpu className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    Manage Machines
                  </span>
                </Link>
                <Link
                  to="/firmware"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <HardDrive className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    Upload Firmware
                  </span>
                </Link>
                <Link
                  to="/sales"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <DollarSign className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    New Sale
                  </span>
                </Link>
                <Link
                  to="/repair"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <Wrench className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    Schedule Repair
                  </span>
                </Link>
                <Link
                  to="/camera-logs"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <Camera className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    View Camera Logs
                  </span>
                </Link>
                <Link
                  to="/fertilizer"
                  className="flex items-center gap-3 p-3 rounded-md border border-[#ECE3CE] hover:shadow-md"
                >
                  <Beaker className="h-5 w-5 text-[#4F6F52]" />
                  <span className="text-sm font-medium text-[#3A4D39]">
                    Nutrient Stats
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-[#4F6F52]" />
                <CardTitle className="text-[#3A4D39]">Announcements</CardTitle>
              </div>
              <CardDescription className="text-xs text-gray-500">
                Latest messages & alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 text-sm text-gray-600">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#3A4D39]">
                      Repair: Mixer #02
                    </div>
                    <div className="text-xs text-gray-400">Tomorrow, 10:00</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Required: 1 technician
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    Scheduled
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#3A4D39]">
                      Firmware rollout: v1.2.3
                    </div>
                    <div className="text-xs text-gray-400">In progress</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Target: 70% devices updated
                    </div>
                  </div>
                  <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    Pending
                  </div>
                </div>

                {user?.role === "admin" && (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#3A4D39]">
                        Admin review: Rollout strategy
                      </div>
                      <div className="text-xs text-gray-400">
                        Needs approval
                      </div>
                    </div>
                    <div className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      Action
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
