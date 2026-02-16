import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Sprout,
  Cpu,
  FileText,
  Wifi,
  Cog,
  Eye,
  Zap,
  Fan,
  ChevronLeft,
  Share2,
  Calendar,
  History,
  HardDrive,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function MachineDetails() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [machineDetails, setMachineDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [machineHealth, setMachineHealth] = useState(null);
  const [selectedDiag, setSelectedDiag] = useState(null);
  const [showDiagModal, setShowDiagModal] = useState(false);

  const fetchMachineHealth = useCallback(async (id) => {
    try {
      const res = await Requests({
        url: `/management/machine-health/${id}`,
        method: "GET",
        credentials: true,
      });
      if (res.data?.ok && res.data.health) {
        setMachineHealth(res.data.health);
      }
    } catch {
      // silently ignore health errors
    }
  }, []);

  const fetchMachineDetails = useCallback(async () => {
    try {
      setDetailsLoading(true);
      const response = await Requests({
        url: `/management/machines/${machineId}`,
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setMachineDetails(response.data.machine);
        fetchMachineHealth(response.data.machine.machine_id);
      }
    } catch {
      toast.error("Failed to load machine parameters");
    } finally {
      setDetailsLoading(false);
    }
  }, [machineId, fetchMachineHealth]);

  useEffect(() => {
    fetchMachineDetails();
  }, [fetchMachineDetails]);

  const toNumber = (val) => {
    if (val === null || val === undefined) return NaN;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : NaN;
  };

  if (detailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FDFCFB]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#4F6F52]/20 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[#4F6F52] font-bold animate-pulse uppercase tracking-widest text-xs">
          Querying System...
        </p>
      </div>
    );
  }

  if (!machineDetails) return null;

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-8 animate-in fade-in duration-700">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[#4F6F52]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 text-[#4F6F52] font-bold text-xs uppercase tracking-[0.2em] mb-1">
                <HardDrive className="w-4 h-4" />
                Unit Diagnostics
              </div>
              <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                NutriBin
              </h1>
              <p className="text-gray-400 font-mono text-xs mt-1 flex items-center gap-2">
                SERIAL: {machineDetails.machine_id.toUpperCase()}
                <span className="text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                  {machineDetails.firmware_version || "v1.0.0"}
                </span>
                {machineDetails.update_status === "pending" && (
                  <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md text-[9px] font-black animate-pulse">
                    UPDATE PENDING
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                System Status
              </span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE & SYNCED
              </span>
            </div>
            <button className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 hover:text-[#4F6F52] transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Grid: Identity & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-[#3A4D39] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#3A4D39]/20"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-white/60 font-bold text-xs uppercase tracking-widest mb-6">
                  Aggregate Stability
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tracking-tighter">
                    {100 -
                      (machineHealth?.error_rate ?? machineDetails.error_rate)}
                  </span>
                  <span className="text-2xl font-bold text-white/40">%</span>
                </div>
                <p className="text-white/60 text-sm mt-2 font-medium">
                  System Integrity Score
                </p>
              </div>

              <div className="mt-10">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div
                    className={`p-2 rounded-xl ${Number(machineDetails.error_rate) > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                  >
                    {Number(machineDetails.error_rate) > 0 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">
                      Status Report
                    </p>
                    <p className="text-sm font-medium">
                      {Number(machineDetails.error_rate) > 0
                        ? "Requires Attention"
                        : "Operational Excellence"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Cpu className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 opacity-20" />
          </motion.div>

          {/* Assigned Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-extrabold text-[#1A1A1A] text-xl flex items-center gap-3">
                <Users className="h-6 w-6 text-[#4F6F52]" />
                Assigned Network
              </h3>
              <span className="bg-[#4F6F52]/10 text-[#4F6F52] px-4 py-1 rounded-full text-xs font-bold uppercase">
                {machineDetails.users?.length || 0} Members
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {machineDetails.users && machineDetails.users.length > 0 ? (
                machineDetails.users.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-transparent hover:border-[#4F6F52]/20 hover:bg-white transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#ECE3CE] flex items-center justify-center text-[#4F6F52] font-black group-hover:bg-[#4F6F52] group-hover:text-white transition-all">
                      {u.first_name[0]}
                      {u.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A1A1A] truncate">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 font-medium">
                        <Mail className="w-3 h-3" /> {u.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center p-10 text-gray-400 italic">
                  <User className="w-10 h-10 opacity-10 mb-2" />
                  No registered owners found for this unit.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Environmental & NPK */}
          <div className="lg:col-span-8 space-y-8">
            {/* Environmental Grid */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#FDFCFB] border border-gray-100 rounded-xl">
                  <History className="w-5 h-5 text-[#4F6F52]" />
                </div>
                <h3 className="font-extrabold text-[#1A1A1A] text-xl">
                  Real-time Telemetry
                </h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const latest = machineDetails.fertilizer_analytics?.[0] || {};
                  return (
                    <>
                      <EnvCard
                        icon={Thermometer}
                        label="Temp"
                        value={toNumber(latest.temperature)}
                        unit="°C"
                        color="text-rose-500"
                        bg="bg-rose-50"
                      />
                      <EnvCard
                        icon={Droplets}
                        label="Humid"
                        value={toNumber(latest.humidity)}
                        unit="%"
                        color="text-sky-500"
                        bg="bg-sky-50"
                      />
                      <EnvCard
                        icon={Sprout}
                        label="pH"
                        value={toNumber(latest.ph)}
                        unit=""
                        color="text-indigo-500"
                        bg="bg-indigo-50"
                      />
                      <EnvCard
                        icon={Sprout}
                        label="Moist"
                        value={toNumber(latest.moisture)}
                        unit="%"
                        color="text-emerald-500"
                        bg="bg-emerald-50"
                      />
                      <EnvCard
                        icon={Wind}
                        label="MQ4"
                        value={toNumber(latest.methane)}
                        unit="ppm"
                        color="text-amber-500"
                        bg="bg-amber-50"
                      />
                      <EnvCard
                        icon={Wind}
                        label="AQI"
                        value={toNumber(latest.air_quality)}
                        unit="ppm"
                        color="text-cyan-500"
                        bg="bg-cyan-50"
                      />
                      <EnvCard
                        icon={Wind}
                        label="CO"
                        value={toNumber(latest.carbon_monoxide)}
                        unit="ppm"
                        color="text-slate-500"
                        bg="bg-slate-50"
                      />
                      <EnvCard
                        icon={Zap}
                        label="Gases"
                        value={toNumber(latest.combustible_gases)}
                        unit="ppm"
                        color="text-violet-500"
                        bg="bg-violet-50"
                      />
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Output & Composition Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <h3 className="font-extrabold text-[#1A1A1A] text-xl mb-8">
                  NPK Distribution
                </h3>
                {(() => {
                  const latest = machineDetails.fertilizer_analytics?.[0] || {};
                  const n = toNumber(latest.nitrogen) || 0;
                  const p = toNumber(latest.phosphorus) || 0;
                  const k = toNumber(latest.potassium) || 0;
                  return (
                    <div className="space-y-6">
                      <NutrientBar
                        label="Nitrogen"
                        value={n}
                        color="bg-[#C26A4A]"
                      />
                      <NutrientBar
                        label="Phosphorus"
                        value={p}
                        color="bg-[#D97706]"
                      />
                      <NutrientBar
                        label="Potassium"
                        value={k}
                        color="bg-[#739072]"
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-white/40 font-bold text-xs uppercase tracking-widest mb-10">
                    Production Yield
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-black">
                      {machineDetails.fertilizer_analytics?.[0]?.weight_kg || 0}
                    </span>
                    <span className="text-xl font-bold text-white/40">kg</span>
                  </div>
                  <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <Sprout className="w-4 h-4" /> Ready for harvest
                  </p>
                </div>
                <div className="absolute top-10 right-10 opacity-10">
                  <Sprout className="w-32 h-32" />
                </div>
              </div>
            </div>

            {/* Hardware Inventory Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                    Component Registry
                  </h3>
                  <p className="text-gray-400 text-sm font-medium mt-1">
                    Live status of hardware nodes
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> OK
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> ERR
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controllers */}
                <div className="bg-[#FAF9F6] rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase mb-2">
                    <Cpu className="w-4 h-4" /> Controllers
                  </div>
                  <div className="space-y-2">
                    <MiniStatus
                      machine={machineDetails}
                      id="c1"
                      label="Arduino Q"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Arduino Q",
                          key: "C1",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="c2"
                      label="Filter Core"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Filter Core",
                          key: "C2",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="c3"
                      label="Servo & Sensors Node"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Servo & Sensors",
                          key: "C3",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="c4"
                      label="Sensors Node"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Sensors Logic",
                          key: "C4",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                  </div>
                </div>

                {/* Actuators */}
                <div className="bg-[#FAF9F6] rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase mb-2">
                    <Cog className="w-4 h-4" /> Actuators
                  </div>
                  <div className="space-y-2">
                    <MiniStatus
                      machine={machineDetails}
                      id="m1"
                      label="Lid Servo A"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Servo A",
                          key: "M1",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="m2"
                      label="Lid Servo B"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Servo B",
                          key: "M2",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="m3"
                      label="Mixer Servo"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Mixer Servo",
                          key: "M3",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="m4"
                      label="Grinder Motor"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Grinder",
                          key: "M4",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="m5"
                      label="Exhaust Fan"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Exhaust",
                          key: "M5",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                  </div>
                </div>

                {/* Sensors */}
                <div className="bg-[#FAF9F6] rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase mb-2">
                    <Eye className="w-4 h-4" /> Sensors
                  </div>
                  <div className="space-y-2">
                    <MiniStatus
                      machine={machineDetails}
                      id="s1"
                      label="Camera"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Camera",
                          key: "S1",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s2"
                      label="Humidity"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Humidity",
                          key: "S2",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s3"
                      label="Methane"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Methane",
                          key: "S3",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s4"
                      label="CO Gas"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "CO Gas",
                          key: "S4",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s5"
                      label="Air Quality"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Air Quality",
                          key: "S5",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s6"
                      label="Combustible"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Combustible",
                          key: "S6",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s7"
                      label="NPK Probe"
                      onDetails={(v) => {
                        setSelectedDiag({ label: "NPK", key: "S7", value: v });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s8"
                      label="Moisture"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Moisture",
                          key: "S8",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s9"
                      label="Reed Switch"
                      onDetails={(v) => {
                        setSelectedDiag({ label: "Reed", key: "S9", value: v });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s10"
                      label="Ultrasonic"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Ultrasonic",
                          key: "S10",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                    <MiniStatus
                      machine={machineDetails}
                      id="s11"
                      label="Weight"
                      onDetails={(v) => {
                        setSelectedDiag({
                          label: "Weight",
                          key: "S11",
                          value: v,
                        });
                        setShowDiagModal(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: History & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-extrabold text-[#1A1A1A] text-xl flex items-center gap-3">
                  <History className="h-6 w-6 text-[#4F6F52]" />
                  Event History
                </h3>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                {machineDetails.fertilizer_analytics?.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(log.date_created).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black text-[#4F6F52] uppercase bg-[#4F6F52]/10 px-2 py-0.5 rounded">
                        Log #{idx + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          N
                        </p>
                        <p className="text-sm font-black text-[#C26A4A]">
                          {log.nitrogen}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          P
                        </p>
                        <p className="text-sm font-black text-[#D97706]">
                          {log.phosphorus}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          K
                        </p>
                        <p className="text-sm font-black text-[#739072]">
                          {log.potassium}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {log.weight_kg}kg Produced
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${log.reed_switch === "1" ? "bg-rose-500" : "bg-emerald-500"}`}
                        title={
                          log.reed_switch === "1" ? "Lid Open" : "Lid Closed"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Modal */}
        <AnimatePresence>
          {showDiagModal && selectedDiag && (
            <DiagModal
              diag={selectedDiag}
              onClose={() => setShowDiagModal(false)}
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function EnvCard({ icon: Icon, label, value, unit, color, bg }) {
  return (
    <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-transparent hover:border-gray-100 transition-all group">
      <div
        className={`w-10 h-10 rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-[#1A1A1A]">
            {Number.isNaN(value) ? "--" : value}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function NutrientBar({ label, value, color }) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
          {label}
        </span>
        <span className="text-sm font-black text-[#1A1A1A]">{value}%</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-sm shadow-${color}/30`}
        />
      </div>
    </div>
  );
}

function MiniStatus({ machine, id, label, onDetails }) {
  const val = machine?.[id.toLowerCase()] || machine?.[id.toUpperCase()];
  const ok = !(val === true || val === "true" || val === 1);
  return (
    <div
      onClick={() => onDetails(val)}
      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-[#4F6F52]/30 transition-all cursor-pointer group"
    >
      <span className="text-xs font-bold text-gray-600 group-hover:text-[#4F6F52] transition-colors">
        {label}
      </span>
      <div
        className={`w-5 h-5 rounded-lg flex items-center justify-center ${ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
      >
        {ok ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <AlertTriangle className="w-3 h-3" />
        )}
      </div>
    </div>
  );
}

function DiagModal({ diag, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${!(diag.value === true || diag.value === "true" || diag.value === 1) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
          >
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              {diag.label}
            </h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Diagnostic Report
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              Technical Registry
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[#1A1A1A]">
                {diag.key}
              </span>
              <span
                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${!(diag.value === true || diag.value === "true" || diag.value === 1) ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
              >
                {!(
                  diag.value === true ||
                  diag.value === "true" ||
                  diag.value === 1
                )
                  ? "Healthy"
                  : "Fault"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-2 tracking-widest">
              Metadata
            </p>
            <div className="p-4 rounded-3xl bg-[#FAF9F6] border border-gray-50 font-mono text-xs text-gray-500">
              Raw Output: {String(diag.value)}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-10 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-[#3A4D39] transition-all"
        >
          Acknowledge
        </button>
      </motion.div>
    </motion.div>
  );
}

export default MachineDetails;
