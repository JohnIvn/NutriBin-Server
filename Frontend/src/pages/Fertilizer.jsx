import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  ReferenceLine,
  LabelList,
} from "recharts";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Fertilizer() {
  const [productionKg, setProductionKg] = useState(null);
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await Requests({ url: "/fertilizer/production" });
        const body = res?.data;
        if (!mounted) return;
        if (body && body.ok) {
          const val =
            body.production_kg ??
            body.production_result ??
            body.fertilizer_kg ??
            null;
          if (val !== null && val !== undefined) setProductionKg(Number(val));
        }
      } catch (e) {
        // ignore — leave productionKg as null
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  const barChartData = [
    { batch: "NB3123", nitrogen: 24, phosporus: 32, potassium: 35 },
    { batch: "NB2123", nitrogen: 27, phosporus: 37, potassium: 49 },
    { batch: "NB1123", nitrogen: 31, phosporus: 24, potassium: 42 },
    { batch: "NB4123", nitrogen: 43, phosporus: 21, potassium: 32 },
    { batch: "NB5123", nitrogen: 35, phosporus: 30, potassium: 27 },
  ];

  const pieChartData = [
    { name: "Nitrogen", value: 275, fill: "#C26A4A" },
    { name: "Phosporus", value: 200, fill: "#D97706" },
    { name: "Potassium", value: 187, fill: "#739072" },
  ];

  const chartConfig = {
    nitrogen: { label: "Nitrogen", color: "#C26A4A" },
    phosporus: { label: "Phosporus", color: "#D97706" },
    potassium: { label: "Potassium", color: "#739072" },
  };

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[black]">
            Fertilizer Analytics
          </h1>
          <p className="text-sm text-gray-500 italic">
            Real-time nutrient distribution and production efficiency.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="w-full lg:w-2/3 space-y-6">
            {/* bar chart card */}
            <Card className="shadow-md border-none bg-white rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#4F6F52]" />
                    <CardTitle className="text-[#3A4D39]">
                      NPK Ratio Overview
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Nutrient percentage per Nutribin batch ID
                  </CardDescription>
                </div>
                <div className="text-xs font-bold bg-[#ECE3CE] text-[#3A4D39] px-3 py-1 rounded-full">
                  Target: 30%
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    barSize={40}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="batch"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      className="text-xs font-medium fill-gray-500"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-xs font-medium fill-gray-500"
                      unit="%"
                    />

                    <ChartTooltip
                      cursor={{ fill: "#f8f9fa" }}
                      content={
                        <ChartTooltipContent className="bg-white border border-[#4F6F52]/20 shadow-lg text-[#3A4D39] rounded-lg" />
                      }
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: "20px" }}
                    />
                    <ReferenceLine
                      y={30}
                      stroke="#e2e8f0"
                      strokeDasharray="5 5"
                      label={{
                        position: "right",
                        value: "Goal",
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                    />
                    <Bar
                      dataKey="nitrogen"
                      fill="var(--color-nitrogen)"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="nitrogen"
                        position="top"
                        className="fill-gray-400 text-[10px]"
                      />
                    </Bar>
                    <Bar
                      dataKey="phosporus"
                      fill="var(--color-phosporus)"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="phosporus"
                        position="top"
                        className="fill-gray-400 text-[10px]"
                      />
                    </Bar>
                    <Bar
                      dataKey="potassium"
                      fill="var(--color-potassium)"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="potassium"
                        position="top"
                        className="fill-gray-400 text-[10px]"
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* pie chart card */}
            <Card className="shadow-md border-none bg-white rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-[#4F6F52]" />
                    <CardTitle className="text-[#3A4D39]">
                      Total Nutrient Composition
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3A4D39] bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    Nitrogen +5.3% vs last period
                  </div>
                </div>
                <CardDescription>
                  Cumulative distribution across all batches
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-6">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square h-72"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          className="bg-white border border-[#4F6F52]/20 shadow-lg text-[#3A4D39] rounded-lg"
                        />
                      }
                    />

                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      cornerRadius={6}
                      stroke="white"
                      strokeWidth={3}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* right column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 h-fit">
            <div className="px-2">
              <h2 className="text-xl font-bold text-[#3A4D39] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#D97706] fill-[#D97706]/20" />
                Operational Summary
              </h2>
              <p className="text-xs text-gray-500 mb-2 italic">
                Performance tracking and status updates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* active machines */}
              <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all group overflow-hidden relative rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Gauge className="h-20 w-20 text-[#3A4D39]" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Status Check
                  </p>

                  {/* Active machines fetched from backend */}
                  <ActiveMachinesDisplay />
                </CardContent>
              </Card>

              {/* processed waste */}
              <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all group overflow-hidden relative rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trash2 className="h-20 w-20 text-[#C26A4A]" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Resource Input
                  </p>

                  <div className="flex flex-col mt-1">
                    <h3 className="text-4xl font-black text-[#3A4D39]">
                      15.0
                      <span className="text-lg ml-1 text-gray-400 font-medium">
                        kg
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">
                      Processed Waste
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 font-medium italic border-l-2 border-[#C26A4A] pl-2">
                    Daily intake via bio-digesters.
                  </p>
                </CardContent>
              </Card>

              {/* fertilizer yield */}
              <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all group overflow-hidden relative rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package className="h-20 w-20 text-[#D97706]" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Production Result
                  </p>

                  <div className="flex flex-col mt-1">
                    <h3 className="text-4xl font-black text-[#3A4D39]">
                      {productionKg === null
                        ? "—"
                        : String(Number(productionKg).toFixed(2))}
                      <span className="text-lg ml-1 text-gray-400 font-medium">
                        kg
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">
                      Fertilizer Yield
                    </span>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < 7 ? "bg-[#D97706]" : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
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
    let mounted = true;

    (async () => {
      try {
        const res = await Requests({
          url: "/management/status/active-machines",
          method: "GET",
        });
        if (!mounted) return;
        const json = res?.data;
        if (json && json.ok && json.status) {
          setData({ ...json.status, loading: false });
        } else {
          setData((s) => ({ ...s, loading: false }));
        }
      } catch (e) {
        if (!mounted) return;
        setData((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const { active_machines, total_machines, percent_active, loading } = data;

  return (
    <>
      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-4xl font-black text-[#3A4D39]">
          {loading ? "—" : String(active_machines).padStart(2, "0")}
        </h3>
        <span className="text-sm font-medium text-gray-400">
          / {loading ? "—" : total_machines}
        </span>
      </div>
      <span className="text-xs font-bold text-gray-500 uppercase mt-1">
        Active Machines
      </span>

      <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#4F6F52] h-full"
          style={{ width: loading ? "0%" : `${percent_active}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2 font-medium">
        {loading ? "Loading status..." : "System healthy and operational."}
      </p>
    </>
  );
}

export default Fertilizer;
