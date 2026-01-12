import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend, ReferenceLine, LabelList } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp, Activity, Package, Trash2, Gauge, Zap, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Analytics() {
  const barChartData = [
    { batch: "NB3123", nitrogen: 24, phosporus: 32, potassium: 35 },
    { batch: "NB2123", nitrogen: 27, phosporus: 37, potassium: 49 },
    { batch: "NB1123", nitrogen: 31, phosporus: 24, potassium: 42 },
    { batch: "NB4123", nitrogen: 43, phosporus: 21, potassium: 32 },
    { batch: "NB5123", nitrogen: 35, phosporus: 30, potassium: 27 },
  ]
  
  const pieChartData = [
    { name: "Nitrogen", value: 275, fill: "#C26A4A" },
    { name: "Phosporus", value: 200, fill: "#D4A017" },
    { name: "Potassium", value: 187, fill: "#739072" },
  ]

  const chartConfig = {
    nitrogen: { label: "Nitrogen", color: "#C26A4A" },
    phosporus: { label: "Phosporus", color: "#D4A017" },
    potassium: { label: "Potassium", color: "#739072" },
  }

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* header */}
      <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Fertilizer Analytics
        </h1>
        <p className="text-sm text-muted-foreground italic">
          Real-time nutrient distribution and production efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-gray-100 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#4F6F52]" />
                  <CardTitle>NPK Ratio Overview</CardTitle>
                </div>
                <CardDescription>Nutrient percentage per Nutribin batch ID</CardDescription>
              </div>
              <div className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">
                Target: 30%
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="batch" tickLine={false} tickMargin={10} axisLine={false} className="text-xs font-medium" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} className="text-xs font-medium" unit="%" />
                  <ChartTooltip cursor={{fill: '#f8f9fa'}} content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                  <ReferenceLine y={30} stroke="#e2e8f0" strokeDasharray="5 5" label={{ position: 'right', value: 'Goal', fill: '#94a3b8', fontSize: 10 }} />
                  <Bar dataKey="nitrogen" fill="var(--color-nitrogen)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="nitrogen" position="top" className="fill-gray-400 text-[10px]" />
                  </Bar>
                  <Bar dataKey="phosporus" fill="var(--color-phosporus)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="phosporus" position="top" className="fill-gray-400 text-[10px]" />
                  </Bar>
                  <Bar dataKey="potassium" fill="var(--color-potassium)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="potassium" position="top" className="fill-gray-400 text-[10px]" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-gray-100 bg-white">
            <CardHeader className="items-center pb-2">
              <CardTitle>Total Nutrient Composition</CardTitle>
              <CardDescription>Cumulative distribution across all batches</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-80">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={5} cornerRadius={6} stroke="white" strokeWidth={2} label={({ name, value }) => `${name}: ${value}`}>
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4">
              <div className="flex items-center gap-2 leading-none font-bold text-gray-800">
                Nitrogen is 5.3% more common this period <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* summary */}
        <div className="flex flex-col gap-4">
          <div className="px-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#4F6F52] fill-[#4F6F52]/20" />
              Operational Summary
            </h2>
            <p className="text-xs text-gray-500 mb-2 italic">Performance tracking and status updates.</p>
          </div>
          
          <div className="flex-grow grid grid-cols-1 gap-4">
            {/* active machines */}
            <Card className="bg-white border-none shadow-lg hover:shadow-[#3A4D39]/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-80 transition-opacity">
                <Gauge className="h-16 w-16 text-[#3A4D39]" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Check</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-gray-900">05</h3>
                  <span className="text-xs font-bold text-gray-500 uppercase">Active Machines</span>
                </div>
                <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-[#739072] h-full w-[85%] rounded-full" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 font-medium">System healthy and operational.</p>
              </CardContent>
            </Card>

            {/* processed waste */}
            <Card className="bg-white border-none shadow-lg hover:shadow-[#624DE3]/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-80 transition-opacity">
                <Trash2 className="h-16 w-16 text-[#3A4D39]" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resource Input</p>
                <div className="flex flex-col">
                  <h3 className="text-4xl font-black text-gray-900">15.0<span className="text-lg ml-1 text-gray-400">kg</span></h3>
                  <span className="text-xs font-bold text-gray-500 uppercase mt-1">Processed Waste</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 font-medium italic border-l-2 border-[#739072] pl-2">
                  Daily intake processed via bio-digesters.
                </p>
              </CardContent>
            </Card>

            {/* fertilizer yield */}
            <Card className="bg-white border-none shadow-lg hover:shadow-[#4F6F52]/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-80 transition-opacity">
                <Package className="h-16 w-16 text-[#3A4D39]" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Production Result</p>
                <div className="flex flex-col">
                  <h3 className="text-4xl font-black text-[#4F6F52]">12.32<span className="text-lg ml-1 opacity-60">kg</span></h3>
                  <span className="text-xs font-bold text-gray-500 uppercase mt-1">Fertilizer Yield</span>
                </div>
                <div className="mt-4 flex gap-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < 7 ? 'bg-[#4F6F52]' : 'bg-gray-100'}`} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* system status */}
            <Card className="bg-[#1a1a1a] border-none shadow-2xl text-white bg-white">
               <CardHeader className="pb-2 pt-4 px-4">
                 <CardTitle className="text-[11px] uppercase tracking-tighter text-gray-400 font-bold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   Machine Status List
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-4 pb-4 space-y-3">
                 <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2 font-medium">
                    <span className="text-gray-400">#01 Digester</span>
                    <span className="text-green-400">Online</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2 font-medium">
                    <span className="text-gray-400">#02 Mixer</span>
                    <span className="text-green-400">Online</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-gray-400">#04 Calibrator</span>
                    <span className="text-amber-400">Maintenance</span>
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics;