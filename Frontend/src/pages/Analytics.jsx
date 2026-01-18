import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
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

  // Placeholder stats — will wire to real APIs on request
  const stats = {
    machinesActive: 5,
    machinesTotal: 10,
    fertilizerYieldKg: 12.32,
    salesToday: 8,
    usersCount: 124,
    repairsPending: 2,
    firmwarePending: 3,
  };

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
            label="Machines"
            value={`${stats.machinesActive}/${stats.machinesTotal}`}
            delta="+2%"
            icon={Cpu}
            to="/machine"
          />
          <KPI
            label="Fertilizer"
            value={`${stats.fertilizerYieldKg} kg`}
            delta="+4%"
            icon={Beaker}
            to="/fertilizer"
          />
          <KPI
            label="Sales"
            value={`${stats.salesToday}`}
            delta="-1%"
            icon={DollarSign}
            to="/sales"
          />
          <KPI
            label="Users"
            value={`${stats.usersCount}`}
            delta="+1%"
            icon={UsersIcon}
            to="/users"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-2 p-4 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">Trends</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Simple trendlines for machines and sales
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    Machines (last 10)
                  </div>
                  <Sparkline
                    data={Array.from({ length: 10 }).map((_, i) => ({
                      t: i,
                      machines: Math.round(4 + Math.random() * 3),
                    }))}
                    dataKey="machines"
                    color="#4F6F52"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    Sales (last 10)
                  </div>
                  <Sparkline
                    data={Array.from({ length: 10 }).map((_, i) => ({
                      t: i,
                      sales: Math.round(3 + Math.random() * 6),
                    }))}
                    dataKey="sales"
                    color="#C26A4A"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0 rounded-xl overflow-hidden shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-[#3A4D39]">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Latest system events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {[
                {
                  id: 1,
                  icon: Activity,
                  title: "Firmware v1.2.3 released",
                  when: "2h ago",
                },
                {
                  id: 2,
                  icon: Wrench,
                  title: "Repair scheduled for #03 Mixer",
                  when: "6h ago",
                },
                {
                  id: 3,
                  icon: DollarSign,
                  title: "8 sales processed today",
                  when: "1d ago",
                },
              ].map((a) => (
                <ActivityItem
                  key={a.id}
                  icon={a.icon}
                  title={a.title}
                  when={a.when}
                />
              ))}
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
