import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import {
  RefreshCw,
  FlaskConical,
  Sprout,
  Calculator,
  Info,
  TrendingUp,
  Microscope,
  Leaf,
  Cpu,
  History,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

function DataScience() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMachines = async () => {
    try {
      const res = await Requests({ url: "/data-science/machines" });
      if (res?.data?.ok) {
        setMachines(res.data.machines);
      }
    } catch (err) {
      console.error("Failed to fetch machines", err);
    }
  };

  const fetchData = async (machineId) => {
    try {
      setIsRefreshing(true);
      const url = machineId
        ? `/data-science/analytics?machine_id=${machineId}`
        : "/data-science/analytics";
      const res = await Requests({ url });
      setData(res?.data || null);

      // Fetch history
      const historyUrl = machineId
        ? `/data-science/history?machine_id=${machineId}`
        : "/data-science/history";
      const historyRes = await Requests({ url: historyUrl });
      if (historyRes?.data?.ok) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch data science metrics", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    fetchData(selectedMachine);
  }, [selectedMachine]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 text-[#4F6F52]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20 overflow-x-hidden flex flex-col pt-0">
      {/* Machine Selection Top Bar - Improved containment */}
      <div className="bg-white border-b border-[#4F6F52]/10 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-4 w-full h-14 md:h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-gray-100 h-8">
            <Cpu className="w-4 h-4 text-[#4F6F52]" />
            <span className="text-[10px] font-black text-[#4F6F52] uppercase tracking-wider hidden sm:block">
              Unit Selector
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0 h-full">
            <button
              onClick={() => setSelectedMachine(null)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 border shrink-0 ${
                selectedMachine === null
                  ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-md shadow-[#4F6F52]/20"
                  : "bg-white border-gray-100 text-gray-500 hover:border-[#4F6F52]/30 hover:bg-[#4F6F52]/5"
              }`}
            >
              Overview
            </button>

            {machines.map((machine) => (
              <button
                key={machine.machine_id}
                onClick={() => setSelectedMachine(machine.machine_id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 border shrink-0 ${
                  selectedMachine === machine.machine_id
                    ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-md shadow-[#4F6F52]/20"
                    : "bg-white border-gray-100 text-gray-500 hover:border-[#4F6F52]/30 hover:bg-[#4F6F52]/5"
                }`}
              >
                UNIT {machine.name.substring(0, 8).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-8 pt-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto flex-1 min-w-0">
        {/* Network Overview Summary (Visible in System Overview) */}
        {!selectedMachine && data?.summary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-[#4F6F52] border-none text-white shadow-xl shadow-[#4F6F52]/10 rounded-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Cpu className="w-12 h-12" />
              </div>
              <CardContent className="p-6">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                  Monitored Units
                </p>
                <h3 className="text-4xl font-black">
                  {data.summary.total_machines}
                </h3>
                <p className="text-white/40 text-[10px] mt-2">
                  Active hardware units in network
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden relative group">
              <CardContent className="p-6">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Total Data Points
                </p>
                <h3 className="text-4xl font-black text-[#4F6F52]">
                  {data.summary.total_readings.toLocaleString()}
                </h3>
                <p className="text-gray-400 text-[10px] mt-2">
                  Aggregated chemical samples
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden relative group">
              <CardContent className="p-6">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                  System Health
                </p>
                <h3 className="text-4xl font-black text-[#4F6F52]">100%</h3>
                <p className="text-gray-400 text-[10px] mt-2">
                  All sensors reporting correctly
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="space-y-1">
            <p className="text-[#4F6F52] font-black text-xs uppercase tracking-[0.2em] mb-1">
              Dashboard /{" "}
              {selectedMachine
                ? `Unit ${selectedMachine.substring(0, 8).toUpperCase()}`
                : "Laboratory Analysis"}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Data Science <span className="text-gray-400">Insights</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed font-medium">
              Advanced computational analysis of fertilizer chemical profiles.
              Automated soil-to-crop suitability matching using the{" "}
              <span className="text-[#4F6F52] font-bold">CSI Algorithm</span>.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => fetchData(selectedMachine)}
            disabled={isRefreshing}
            className="bg-[#4F6F52] text-white hover:bg-[#3A4D39] transition-all duration-300 shadow-xl shadow-[#4F6F52]/20 px-8 h-12 rounded-2xl font-bold border-none"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {selectedMachine ? "Sync Unit Data" : "Update Analytics"}
          </Button>
        </header>

        {/* Analytics Dashboard Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Composition Summary */}
          <Card className="lg:col-span-4 border-none shadow-xl shadow-gray-100/50 bg-white rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-[#4F6F52] to-[#739072] text-white p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">
                    Soil Composition
                  </CardTitle>
                  <CardDescription className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Real-time chemical metrics
                  </CardDescription>
                </div>
                <FlaskConical className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    label: "Nitrogen (N)",
                    val: data?.current_readings?.n,
                    color: "bg-[#C26A4A]",
                    unit: "ppm",
                  },
                  {
                    label: "Phosphorus (P)",
                    val: data?.current_readings?.p,
                    color: "bg-[#D97706]",
                    unit: "ppm",
                  },
                  {
                    label: "Potassium (K)",
                    val: data?.current_readings?.k,
                    color: "bg-[#4F6F52]",
                    unit: "ppm",
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-lg font-black text-gray-800 tabular-nums">
                        {item.val?.toFixed(2)}{" "}
                        <span className="text-[10px] text-gray-400 font-normal ml-0.5">
                          {item.unit}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((item.val / 200) * 100, 100)}%`,
                        }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Soil Acidity (pH)
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#4F6F52]" />
                      <span className="text-2xl font-black text-[#4F6F52] leading-none">
                        {data?.current_readings?.ph?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Logic */}
          <Card className="lg:col-span-8 border-none shadow-xl shadow-gray-100/50 bg-white rounded-2xl overflow-hidden p-2">
            <div className="h-full border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#4F6F52]/10 rounded-xl">
                  <Calculator className="w-6 h-6 text-[#4F6F52]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                    Suitability Algorithm (CSI)
                  </CardTitle>
                  <p className="text-xs text-gray-400">
                    Euclidean Spatial Analysis in NPK Dimensions
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center bg-gray-50/50 rounded-2xl p-8 mb-8 border border-gray-100/50 overflow-hidden">
                <code className="text-[#4F6F52] text-xl sm:text-2xl md:text-3xl font-black tracking-tighter select-all text-center leading-loose break-all">
                  {data?.formula}
                </code>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-white text-[10px] uppercase font-bold text-gray-400 border-gray-200"
                  >
                    Δ = variance
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white text-[10px] uppercase font-bold text-gray-400 border-gray-200"
                  >
                    sqrt = Euclidean vector
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white text-[10px] uppercase font-bold text-gray-400 border-gray-200"
                  >
                    max(0,100) = index floor/ceiling
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-[#4F6F52]/5 p-4 rounded-xl border-l-4 border-[#4F6F52]">
                  <Info className="w-5 h-5 text-[#4F6F52] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-black text-[#4F6F52] uppercase tracking-widest">
                      Logic & Validation
                    </span>
                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                      {data?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Recommendations Section */}
        <section className="space-y-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-50">
                <Sprout className="w-7 h-7 text-[#4F6F52]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Targeted Crops
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Optimized matches for current chemical profile
                </p>
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent mx-8 hidden md:block"></div>
            <Badge className="bg-[#4F6F52] text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-[#4F6F52]/10 text-xs tracking-wide border-none">
              Optimal Detection: Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <AnimatePresence mode="wait">
              {data?.recommendations?.length > 0 ? (
                data?.recommendations?.map((crop, idx) => (
                  <motion.div
                    key={`${selectedMachine}-${crop.name}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      className={`h-full border-none shadow-xl shadow-gray-100/50 bg-white rounded-2xl relative group transition-all duration-300 ${idx === 0 ? "ring-2 ring-[#4F6F52]" : ""}`}
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 right-0 bg-[#4F6F52] text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-md z-10">
                          Best Match
                        </div>
                      )}

                      <CardHeader className="p-6 pb-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4F6F52]/10 transition-colors">
                          <Leaf
                            className={`w-6 h-6 ${idx === 0 ? "text-[#4F6F52]" : "text-gray-300"}`}
                          />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {crop.name}
                        </CardTitle>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-[#4F6F52]">
                            {crop.score}
                          </span>
                          <span className="text-[10px] font-bold text-[#4F6F52]/40 uppercase tracking-tighter">
                            CSI Points
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 pt-2 space-y-4">
                        <div className="space-y-3 pt-4 border-t border-gray-50">
                          <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100/30">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                              Ideal NPK
                            </span>
                            <span className="font-mono text-xs text-[#C26A4A] font-black">
                              {crop.ideal_npk}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100/30">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                              pH range
                            </span>
                            <span className="font-mono text-xs text-[#4F6F52] font-black">
                              {crop.ph_range}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${crop.score}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full ${crop.score > 80 ? "bg-[#4F6F52]" : "bg-[#D97706]"}`}
                          ></motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                  <FlaskConical className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium px-4">
                    No analytical data available for this unit. System awaiting
                    fertilizer readings.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Historical Logs Section */}
        <section className="space-y-6 pb-20">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-50">
              <History className="w-6 h-6 text-[#4F6F52]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Recommendation History
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Archived CSI processing results for this unit
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      NPK Profile
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Primary Match (Score)
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Other Recommendations
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.length > 0 ? (
                    history.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-600">
                            {new Date(log.date_created).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] border-orange-100 text-orange-600 bg-orange-50/30"
                            >
                              N: {parseFloat(log.n).toFixed(0)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-blue-100 text-blue-600 bg-blue-50/30"
                            >
                              P: {parseFloat(log.p).toFixed(0)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-green-100 text-green-600 bg-green-50/30"
                            >
                              K: {parseFloat(log.k).toFixed(0)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-800">
                              {log.recommended_plants_1}
                            </span>
                            <span className="text-[10px] font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-1.5 py-0.5 rounded-full">
                              {log.csi_score_1}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {[
                              log.recommended_plants_2,
                              log.recommended_plants_3,
                              log.recommended_plants_4,
                              log.recommended_plants_5,
                            ]
                              .filter(Boolean)
                              .map((plant, pIdx) => (
                                <div
                                  key={pIdx}
                                  title={plant}
                                  className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm"
                                >
                                  {plant.substring(0, 1)}
                                </div>
                              ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[#4F6F52]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                              Processed
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-400 text-sm font-medium"
                      >
                        No historical archives found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DataScience;
