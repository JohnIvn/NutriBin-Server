import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Requests from "@/utils/Requests";

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
    amount: { label: "Sales", color: "var(--color-nitrogen)" },
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
      "Date",
      "Amount",
      "Region",
      "Product",
      "Quantity",
      "Customer ID",
    ];
    const rows = salesData.map((s) => {
      // Preserve original values as strings to avoid JS numeric precision loss
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
      const fields = [date, amount, region, product, quantity, customer].map(
        (f) => {
          if (typeof f === "object") return JSON.stringify(f);
          return String(f);
        },
      );

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
    toast.success("Sales exported");
  };

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3A4D39]">
            Sales
          </h1>
          <p className="text-sm text-[#4F6F52]/80 italic">
            Overview of recent NutriBin sales activity — sample data and visual
            design preview.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="text-sm font-medium text-[#6B6F68]">
              Auto date range
            </div>
            <div className="ml-auto text-sm font-bold text-[#3A4D39]">
              This Month
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="text-sm font-medium text-[#6B6F68]">Services</div>
            <select
              className="ml-auto text-sm text-[#3A4D39] bg-transparent outline-none"
              defaultValue="All"
            >
              <option>All</option>
              <option>Installation</option>
              <option>Support</option>
            </select>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="text-sm font-medium text-[#6B6F68]">Posts</div>
            <select
              className="ml-auto text-sm text-[#3A4D39] bg-transparent outline-none"
              defaultValue="All"
            >
              <option>All</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="text-sm font-medium text-[#6B6F68]">Export</div>
            <button
              onClick={handleExport}
              className="ml-auto bg-[#4F6F52] text-white px-3 py-1 rounded-md text-sm"
            >
              Export
            </button>
          </div>
        </div>

        {/* KPI cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white rounded-xl shadow-sm p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Card className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm font-bold text-[#6B6F68] uppercase">
                Total Devices
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-extrabold text-[#3A4D39]">
                  {salesData.length.toLocaleString()}
                </div>
                <div
                  className={`text-sm font-bold flex items-center gap-1 ${ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {ordersChange >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(ordersChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-[#6B6F68] mt-2">
                vs previous 30 days
              </div>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm font-bold text-[#6B6F68] uppercase">
                Orders per Month
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-extrabold text-[#3A4D39]">
                  {currentOrders}
                </div>
                <div
                  className={`text-sm font-bold flex items-center gap-1 ${ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {ordersChange >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(ordersChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-[#6B6F68] mt-2">
                vs previous 30 days
              </div>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm font-bold text-[#6B6F68] uppercase">
                Average Order
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-extrabold text-[#3A4D39]">
                  {formatPeso(Math.round(currentAvg))}
                </div>
                <div
                  className={`text-sm font-bold flex items-center gap-1 ${avgChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {avgChange >= 0 ? "▲" : "▼"} {Math.abs(avgChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-[#6B6F68] mt-2">
                vs previous 30 days
              </div>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm font-bold text-[#6B6F68] uppercase">
                Growth Rate
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-extrabold text-[#3A4D39]">
                  {growthChange.toFixed(2)}%
                </div>
                <div
                  className={`text-sm font-bold flex items-center gap-1 ${growthChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {growthChange >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(growthChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-[#6B6F68] mt-2">
                vs previous 30 days
              </div>
            </Card>
          </div>
        )}

        {/* main content */}
        <div className="flex flex-col lg:flex-row gap-6 w-full mt-2">
          <div className="w-full lg:w-2/3 space-y-6">
            <Card className="shadow-md border-none bg-white rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#4F6F52]" />
                    <CardTitle className="text-[#3A4D39]">
                      Sales Over Time
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-[#4F6F52]/80">
                    Revenue trend for the selected period
                  </CardDescription>
                </div>
                <div className="text-xs font-bold bg-[#ECE3CE] text-[#3A4D39] px-3 py-1 rounded-full">
                  Total: {formatPeso(totalSales)}
                </div>
              </CardHeader>

              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      barSize={40}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="date"
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
                        unit="₱"
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
                      <Bar
                        dataKey="amount"
                        fill="var(--color-nitrogen)"
                        radius={[4, 4, 0, 0]}
                      ></Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-4 h-fit">
            <Card className="shadow-md border-none bg-white rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#4F6F52]" />
                  <CardTitle className="text-[#3A4D39]">Recent Sales</CardTitle>
                </div>
                <CardDescription className="text-sm text-[#4F6F52]/80">
                  Latest sample transactions for the NutriBin device
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-[#FAF9F6]">
                      <TableRow>
                        <TableHead className="font-bold text-[#3A4D39] py-4 pl-6">
                          DATE
                        </TableHead>
                        <TableHead className="font-bold text-[#3A4D39]">
                          AMOUNT
                        </TableHead>
                        <TableHead className="font-bold text-[#3A4D39]">
                          REGION
                        </TableHead>
                        <TableHead className="text-right font-bold text-[#3A4D39] pr-6">
                          ITEM
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.map((s) => (
                        <TableRow
                          key={`${s.date}-${s.product}`}
                          className="hover:bg-[#ECE3CE]/30 transition-all"
                        >
                          <TableCell className="text-[#6B6F68] font-medium italic">
                            {s.date
                              ? new Date(s.date).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="font-mono text-[#4F6F52] font-bold">
                            {formatPeso(s.amount)}
                          </TableCell>
                          <TableCell className="text-[#4F6F52]/90">
                            {s.region}
                          </TableCell>
                          <TableCell className="text-right pr-6 text-[#3A4D39]">
                            {s.product}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sales;
