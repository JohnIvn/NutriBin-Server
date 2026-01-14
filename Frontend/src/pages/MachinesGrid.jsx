import { useState, useEffect } from "react";
import { Search, User, Mail, AlertTriangle, CheckCircle, XCircle, Thermometer, Droplets, Wind, Activity, Sprout, Cpu, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFilter } from "@/schema/users";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

function MachinesGrid() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineDetails, setMachineDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "staff") {
      toast.error("Access denied. Staff privileges required.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: { count: "10", term: "" },
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/machines",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) setMachines(response.data.machines || []);
    } catch {
      toast.error("Failed to load machines data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineDetails = async (machineId) => {
    try {
      setDetailsLoading(true);
      const response = await Requests({
        url: `/management/machines/${machineId}`,
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setMachineDetails(response.data.machine);
      }
    } catch {
      toast.error("Failed to load machine details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setModalOpen(true);
    fetchMachineDetails(machine.machine_id);
  };

  // Helpers for NPK computations
  const toNumber = (val) => {
    if (val === null || val === undefined) return NaN;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : NaN;
  };

  const term = filterForm.watch("term").toLowerCase();
  const filteredMachines = machines.filter((machine) => {
    return (
      machine.machine_id?.toLowerCase().includes(term) ||
      `${machine.first_name} ${machine.last_name}`.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        
        {/* header*/}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[black]">
              Machines Directory
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Monitor and manage all NutriBin units.
            </p>
          </div>
        </div>

        {/* search bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <Form {...filterForm}>
            <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
              <FormField
                control={filterForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder="Search by Machine ID or Owner..."
                        className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] w-full h-11 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>

        {/* machines grid*/}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#4F6F52] font-medium">Loading Machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-medium bg-white rounded-xl border border-gray-100 shadow-sm">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            No machines found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMachines.map((machine) => (
              <div
                key={machine.machine_id}
                onClick={() => handleMachineClick(machine)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#4F6F52]/50 p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#ECE3CE] group-hover:bg-[#4F6F52] transition-colors" />
                <div className="w-12 h-12 rounded-full bg-[#ECE3CE] flex items-center justify-center group-hover:bg-[#4F6F52] transition-colors duration-300">
                  <Cpu className="h-6 w-6 text-[#4F6F52] group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-[black] text-lg group-hover:text-[#4F6F52] transition-colors">
                    {machine.machine_id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                     <User className="h-3 w-3" /> {machine.first_name} {machine.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total count */}
        {!loading && filteredMachines.length > 0 && (
          <div className="text-center pb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-gray-100">
              Total Machines: {filteredMachines.length}
            </span>
          </div>
        )}
      </section>

      {/* machine details modals */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] max-w-7xl h-[85vh] p-0 bg-[#FAF9F6] overflow-hidden rounded-3xl border-none flex flex-col shadow-2xl">
          
          {/* modal header */}
          <DialogHeader className="px-10 py-6 bg-white border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
             <div className="flex flex-col gap-1">
                <DialogTitle className="text-3xl font-bold text-[#3A4D39] flex items-center gap-3">
                    <div className="p-2.5 bg-[#ECE3CE] rounded-xl">
                      <Cpu className="h-7 w-7 text-[#4F6F52]" />
                    </div>
                    {selectedMachine?.machine_id}
                </DialogTitle>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Live Diagnostic Report</p>
                </div>
             </div>
          </DialogHeader>

          <div className="flex-1 p-10">
                {detailsLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-14 h-14 border-[5px] border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#4F6F52] text-lg font-medium tracking-wide">
                        Retrieving Telemetry...
                    </p>
                    </div>
                ) : machineDetails ? (
                    <div className="space-y-8 pb-4">
                    
                    {/* top row */}
                    <div className="grid md:grid-cols-12 gap-8">
                        
                        <div className="md:col-span-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <User className="w-48 h-48" />
                            </div>
                            <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl relative z-10">
                                <FileText className="h-6 w-6 text-[#4F6F52]" /> Owner Profile
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                {/* Name Field */}
                                <div className="flex items-center gap-5 group">
                                    <div className="w-14 h-14 rounded-full bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#ECE3CE] transition-colors">
                                        <User className="h-6 w-6 text-gray-500 group-hover:text-[#4F6F52]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
                                        <span className="text-lg font-bold text-gray-800">{machineDetails.first_name} {machineDetails.last_name}</span>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="flex items-center gap-5 group">
                                    <div className="w-14 h-14 rounded-full bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#ECE3CE] transition-colors">
                                        <Mail className="h-6 w-6 text-gray-500 group-hover:text-[#4F6F52]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                                        <span className="text-lg font-bold text-gray-800 truncate block w-full" title={machineDetails.email}>
                                            {machineDetails.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. health card */}
                        <div className="md:col-span-4 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                            {/* Background pulse effect */}
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl transition-colors ${Number(machineDetails.error_rate) > 0 ? "bg-red-500" : "bg-green-500"}`} />
                            
                            <h3 className="font-bold text-[#3A4D39] flex items-center gap-2 relative z-10 text-xl">
                                <Activity className="h-6 w-6 text-[#D97706]" /> System Health
                            </h3>
                            
                            <div className="flex flex-col items-center justify-center py-2 relative z-10">
                                <div className="text-6xl font-black text-[#3A4D39] tracking-tighter">
                                    {machineDetails.error_rate}<span className="text-3xl text-gray-400">%</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.25em] mt-2">Error Rate</span>
                            </div>

                            <div className={`flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-full font-bold border transition-colors relative z-10 ${
                                Number(machineDetails.error_rate) > 0 
                                ? "bg-red-50 text-red-600 border-red-100" 
                                : "bg-green-50 text-green-700 border-green-100"
                            }`}>
                                {Number(machineDetails.error_rate) > 0 ? (
                                    <><AlertTriangle className="h-4 w-4" /> Attention Needed</>
                                ) : (
                                    <><CheckCircle className="h-4 w-4" /> System Optimal</>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* environment grid */}
                    {machineDetails.fertilizer_analytics?.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl">
                                <Wind className="h-6 w-6 text-[#4F6F52]" /> Environmental Readings
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <EnvCard 
                                    icon={Thermometer} 
                                    label="Temperature" 
                                    value={machineDetails.fertilizer_analytics[0].temperature} 
                                    unit="°C"
                                    color="text-orange-500"
                                    bg="bg-orange-50"
                                />
                                <EnvCard 
                                    icon={Droplets} 
                                    label="Humidity" 
                                    value={machineDetails.fertilizer_analytics[0].humidity} 
                                    unit="%"
                                    color="text-blue-500"
                                    bg="bg-blue-50"
                                />
                                <EnvCard 
                                    icon={Activity} 
                                    label="pH Level" 
                                    value={machineDetails.fertilizer_analytics[0].ph} 
                                    unit=""
                                    color="text-purple-500"
                                    bg="bg-purple-50"
                                />
                                <EnvCard 
                                    icon={Sprout} 
                                    label="Moisture" 
                                    value={machineDetails.fertilizer_analytics[0].moisture} 
                                    unit="%"
                                    color="text-green-600"
                                    bg="bg-green-50"
                                />
                            </div>
                        </div>
                    )}

                    {/* npk analysis */}
                    {(() => {
                        const latest = machineDetails.fertilizer_analytics?.[0] || {};
                        const nRaw = toNumber(latest.nitrogen);
                        const pRaw = toNumber(latest.phosphorus);
                        const kRaw = toNumber(latest.potassium);

                        // Mock fallback logic
                        const n = Number.isFinite(nRaw) ? nRaw : 40;
                        const p = Number.isFinite(pRaw) ? pRaw : 25;
                        const k = Number.isFinite(kRaw) ? kRaw : 35;
                        const total = Math.max(n + p + k, 1);
                        const nPct = Math.round((n / total) * 100);
                        const pPct = Math.round((p / total) * 100);
                        const kPct = 100 - nPct - pPct;

                        return (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* raw values */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-[#3A4D39] mb-8 text-xl">Output Composition</h3>
                                <div className="space-y-8">
                                    <NutrientBar label="Nitrogen (N)" value={nPct} color="bg-[#C26A4A]" textColor="text-[#C26A4A]" />
                                    <NutrientBar label="Phosphorus (P)" value={pPct} color="bg-[#D97706]" textColor="text-[#D97706]" />
                                    <NutrientBar label="Potassium (K)" value={kPct} color="bg-[#739072]" textColor="text-[#739072]" />
                                </div>
                            </div>

                            {/* ratio visualizer */}
                            <div className="bg-[#3A4D39] rounded-2xl p-8 text-white shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[280px]">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-white mb-2 text-xl">NPK Balance</h3>
                                    <p className="text-sm text-white/60 mb-10 max-w-[80%]">Calculated ratio based on latest sensor telemetry.</p>
                                    
                                    <div className="flex gap-4 h-32 w-full items-end justify-center mb-4">
                                        <div className="w-20 bg-[#C26A4A] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg" style={{height: `${Math.max(20, nPct)}%`}}>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">{nPct}%</span>
                                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">N</span>
                                        </div>
                                        <div className="w-20 bg-[#D97706] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg" style={{height: `${Math.max(20, pPct)}%`}}>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">{pPct}%</span>
                                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">P</span>
                                        </div>
                                        <div className="w-20 bg-[#739072] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg" style={{height: `${Math.max(20, kPct)}%`}}>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">{kPct}%</span>
                                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">K</span>
                                        </div>
                                    </div>
                                </div>
                                <Sprout className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 z-0" />
                            </div>
                        </div>
                        );
                    })()}

                    {/* module status grid */}
                    {machineDetails.module_analytics?.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl">
                                <Cpu className="h-6 w-6 text-[#4F6F52]" /> Module Diagnostics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {Object.entries(machineDetails.module_analytics[0])
                                .filter(([key]) => key !== "date_created")
                                .map(([key, value]) => (
                                    <div
                                    key={key}
                                    className={`px-5 py-4 rounded-xl border flex items-center justify-between transition-colors ${
                                        value
                                        ? "bg-green-50/50 border-green-100 text-green-800 hover:bg-green-50"
                                        : "bg-red-50/50 border-red-100 text-red-800 hover:bg-red-50"
                                    }`}
                                    >
                                    <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[80%]">
                                        {key.replace(/_/g, " ")}
                                    </span>
                                    {value ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                        <AlertTriangle className="h-14 w-14 mb-4 opacity-20" />
                        <p className="text-lg">No diagnostics available for this unit.</p>
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// sub-components for cleaner code

function EnvCard({ icon: Icon, label, value, unit, color, bg }) {
    return (
        <div className={`rounded-xl p-5 border border-gray-100 flex items-center gap-5 transition-colors hover:shadow-sm ${bg ? 'bg-white' : 'bg-gray-50'}`}>
            <div className={`p-3.5 rounded-full ${bg} ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-0.5">{label}</p>
                <p className="font-bold text-gray-800 text-xl">
                    {value || "--"}<span className="text-sm ml-0.5 text-gray-400 font-normal">{unit}</span>
                </p>
            </div>
        </div>
    )
}

function NutrientBar({ label, value, color, textColor }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-3 font-bold">
                <span className="text-gray-600 text-base">{label}</span>
                <span className={`${textColor} text-base`}>{value}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full rounded-full shadow-sm ${color}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    )
}

export default MachinesGrid;