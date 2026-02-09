import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Requests from "@/utils/Requests";

const StatCard = ({ label, value, delta, icon: Icon, description }) => {
  const isPositive = delta >= 0;
  return (
    <Card className="bg-white rounded-xl shadow-sm border-none overflow-hidden group hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#FAF9F6] text-[#4F6F52] group-hover:bg-[#4F6F52] group-hover:text-white transition-colors duration-300">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B6F68]">{label}</p>
              <h3 className="text-2xl font-bold text-[#3A4D39] mt-1">
                {value}
              </h3>
            </div>
          </div>
          {delta !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
            >
              {isPositive ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowUpRight size={12} className="rotate-90" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#6B6F68] mt-4 italic">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

function Sales() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchSales() {
      try {
        const res = await Requests({ url: "/sales" });
        const d = res?.data;
        if (d?.ok && Array.isArray(d.sales)) {
          const mapped = d.sales.map((s) => ({
            date: s.sale_date || s.date_created || null,
            amount: Number(s.amount) || 0,
            region: s.region || "Unknown",
            product: s.product || "Unknown",
            quantity: s.quantity || 1,
            customer_id: s.customer_id || "",
            id: s.sale_id,
          }));

          if (mounted) setSalesData(mapped);
        }
      } catch (err) {
        console.error("Failed to load sales", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSales();
    return () => {
      mounted = false;
    };
  }, []);

  const barData = salesData.map((d) => ({
    date: d.date ? new Date(d.date).toLocaleDateString() : "—",
    amount: d.amount,
  }));

  const totalSales = salesData.reduce((s, r) => s + (r.amount || 0), 0);

  const formatPeso = (v) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(v) || 0);

  const chartConfig = {
    amount: { label: "Sales", color: "#4F6F52" },
  };

  // KPI period comparisons (last 30 days vs previous 30 days)
  const DAYS = 30;
  const daysAgo = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  const currentSales = salesData.filter((s) => {
    const da = daysAgo(s.date);
    return da !== null && da <= DAYS;
  });

  const prevSales = salesData.filter((s) => {
    const da = daysAgo(s.date);
    return da !== null && da > DAYS && da <= DAYS * 2;
  });

  const sumAmount = (arr) =>
    arr.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const countOrders = (arr) => arr.length;

  const currentTotalAmount = sumAmount(currentSales);
  const prevTotalAmount = sumAmount(prevSales);

  const currentOrders = countOrders(currentSales);
  const prevOrders = countOrders(prevSales);

  const currentAvg = currentOrders ? currentTotalAmount / currentOrders : 0;
  const prevAvg = prevOrders ? prevTotalAmount / prevOrders : 0;

  const percentChange = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const ordersChange = percentChange(currentOrders, prevOrders);
  const avgChange = percentChange(currentAvg, prevAvg);
  const growthChange = percentChange(currentTotalAmount, prevTotalAmount);

  const handleExport = () => {
    if (!salesData || salesData.length === 0) {
      toast.info("No sales to export");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Amount",
      "Region",
      "Product",
      "Quantity",
      "Customer ID",
    ];
    const rows = salesData.map((s) => {
      // Preserve original values as strings to avoid JS numeric precision loss
      const id = s.id || "";
      const date = s.date ? String(s.date) : "";
      const amount =
        s.amount !== undefined && s.amount !== null ? String(s.amount) : "";
      const region = s.region || "";
      const product = s.product || "";
      const quantity =
        s.quantity !== undefined && s.quantity !== null
          ? String(s.quantity)
          : "";
      const customer = s.customer_id || "";

      // If any field is complex (arrays/objects), JSON-stringify it to preserve structure
      const fields = [
        id,
        date,
        amount,
        region,
        product,
        quantity,
        customer,
      ].map((f) => {
        if (typeof f === "object") return JSON.stringify(f);
        return String(f);
      });

      return fields.map((f) => `"${f.replace(/"/g, '""')}"`).join(",");
    });

    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Sales exported successfully");
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6 transition-all duration-300 hover:pl-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#3A4D39]">
              Sales Intelligence
            </h1>
            <p className="text-sm text-[#4F6F52]/70 font-medium">
              Real-time performance analytics and transaction monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#4F6F52] hover:bg-[#3A4D39] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-[#ECE3CE] shadow-sm">
            <div className="bg-[#FAF9F6] p-2 rounded-lg ml-1">
              <Calendar size={18} className="text-[#4F6F52]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-[#6B6F68] tracking-widest">
                Timeframe
              </p>
              <select className="text-sm font-bold text-[#3A4D39] bg-transparent outline-none w-full cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-[#ECE3CE] shadow-sm">
            <div className="bg-[#FAF9F6] p-2 rounded-lg ml-1">
              <Filter size={18} className="text-[#4F6F52]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-[#6B6F68] tracking-widest">
                Category
              </p>
              <select className="text-sm font-bold text-[#3A4D39] bg-transparent outline-none w-full cursor-pointer">
                <option>All Services</option>
                <option>Installation</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-[#ECE3CE] shadow-sm">
            <div className="bg-[#FAF9F6] p-2 rounded-lg ml-1">
              <ShoppingBag size={18} className="text-[#4F6F52]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-[#6B6F68] tracking-widest">
                Region
              </p>
              <select className="text-sm font-bold text-[#3A4D39] bg-transparent outline-none w-full cursor-pointer">
                <option>All Regions</option>
                <option>Metro Manila</option>
                <option>Luzon Central</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 h-32 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 bg-[#FAF9F6] rounded-lg" />
                  <div className="w-12 h-6 bg-[#FAF9F6] rounded-full" />
                </div>
                <div className="w-2/3 h-8 bg-[#FAF9F6] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Revenue"
              value={formatPeso(totalSales)}
              delta={growthChange}
              icon={DollarSign}
              description="Gross revenue across all channels"
            />
            <StatCard
              label="Transaction Count"
              value={salesData.length.toLocaleString()}
              delta={ordersChange}
              icon={Package}
              description="Total completed sales orders"
            />
            <StatCard
              label="Avg. Ticket Size"
              value={formatPeso(Math.round(currentAvg))}
              delta={avgChange}
              icon={TrendingUp}
              description="Mean revenue per transaction"
            />
            <StatCard
              label="Active Growth"
              value={`${growthChange.toFixed(1)}%`}
              delta={growthChange}
              icon={ArrowUpRight}
              description="Comparison vs previous period"
            />
          </div>
        )}

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 shadow-sm border-none bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#ECE3CE] pb-6 pt-7 px-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FAF9F6] rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#4F6F52]" />
                </div>
                <div>
                  <CardTitle className="text-[#3A4D39]">
                    Performance Trend
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Revenue movement over time
                  </CardDescription>
                </div>
              </div>
              <div className="text-[10px] font-black bg-[#4F6F52] text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Live Data
              </div>
            </CardHeader>
            <CardContent className="pt-8 px-4 sm:px-8">
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#F1F1F1"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6F68", fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6F68", fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(val) =>
                        `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                      }
                    />
                    <ChartTooltip
                      cursor={{ fill: "#F8F9FA" }}
                      content={
                        <ChartTooltipContent className="bg-white border-2 border-[#4F6F52]/10 shadow-xl rounded-xl p-3" />
                      }
                    />
                    <Bar
                      dataKey="amount"
                      fill="#4F6F52"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    >
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fillOpacity={0.8 - index * 0.02}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-[#ECE3CE] pb-6 pt-7 px-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FAF9F6] rounded-lg">
                  <Package className="h-5 w-5 text-[#4F6F52]" />
                </div>
                <div>
                  <CardTitle className="text-[#3A4D39]">Recent Sales</CardTitle>
                  <CardDescription className="text-xs">
                    Latest transactions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-[#FAF9F6] sticky top-0 z-10">
                    <TableRow className="border-b border-[#ECE3CE]">
                      <TableHead className="text-[10px] font-black text-[#6B6F68] uppercase py-4 pl-8">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-black text-[#6B6F68] uppercase text-right pr-8">
                        Summary
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.length > 0 ? (
                      salesData.map((s, idx) => (
                        <TableRow
                          key={s.id || idx}
                          className="border-b border-gray-50 hover:bg-[#FAF9F6]/50 transition-colors"
                        >
                          <TableCell className="py-4 pl-8">
                            <p className="text-xs font-bold text-[#3A4D39]">
                              {s.date
                                ? new Date(s.date).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" },
                                  )
                                : "—"}
                            </p>
                            <p className="text-[10px] text-[#6B6F68] italic mt-1">
                              {s.region}
                            </p>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <p className="text-sm font-black text-[#4F6F52]">
                              {formatPeso(s.amount)}
                            </p>
                            <p className="text-[10px] text-[#6B6F68] uppercase tracking-tighter mt-1">
                              {s.product}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-10 text-gray-400 italic text-sm"
                        >
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-[#ECE3CE] text-center">
                <button className="text-[10px] font-black text-[#4F6F52] uppercase tracking-widest hover:underline">
                  View Comprehensive Ledger →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Sales;
