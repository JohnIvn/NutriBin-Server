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
} from "lucide-react";
import Requests from "@/utils/Requests";
import ModuleCard from "@/components/ui/ModuleCard";
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
      // silently ignore health errors (keep existing display)
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
      toast.error("Failed to load machine details");
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
      <div className="flex items-center justify-center h-64">
        <div className="w-14 h-14 border-[5px] border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[black]">
              Machine Details
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Detailed diagnostics and owner info.
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate(-1)}
              className="bg-white px-4 py-2 rounded-lg border"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-48 h-48" />
          </div>
          <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl relative z-10">
            <FileText className="h-6 w-6 text-[#4F6F52]" /> Owner Profile
          </h3>

          {machineDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#ECE3CE] transition-colors">
                  <User className="h-6 w-6 text-gray-500 group-hover:text-[#4F6F52]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Full Name
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    {machineDetails.first_name} {machineDetails.last_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#ECE3CE] transition-colors">
                  <Mail className="h-6 w-6 text-gray-500 group-hover:text-[#4F6F52]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Email Address
                  </span>
                  <span
                    className="text-lg font-bold text-gray-800 truncate block w-full"
                    title={machineDetails.email}
                  >
                    {machineDetails.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
              <p>No owner information available.</p>
            </div>
          )}
        </div>

        {/* health & analytics */}
        {machineDetails && (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              {/* Fertilizer / Env readings */}
              {machineDetails.fertilizer_analytics?.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl">
                    <Wind className="h-6 w-6 text-[#4F6F52]" /> Environmental
                    Readings
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <EnvCard
                      icon={Thermometer}
                      label="Temperature"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.temperature,
                      )}
                      unit="°C"
                      color="text-orange-500"
                      bg="bg-orange-50"
                    />
                    <EnvCard
                      icon={Droplets}
                      label="Humidity"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.humidity,
                      )}
                      unit="%"
                      color="text-blue-500"
                      bg="bg-blue-50"
                    />
                    <EnvCard
                      icon={Activity}
                      label="pH Level"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.ph,
                      )}
                      unit=""
                      color="text-purple-500"
                      bg="bg-purple-50"
                    />
                    <EnvCard
                      icon={Sprout}
                      label="Moisture"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.moisture,
                      )}
                      unit="%"
                      color="text-green-600"
                      bg="bg-green-50"
                    />
                    <EnvCard
                      icon={Wind}
                      label="Methane"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.methane,
                      )}
                      unit="ppm"
                      color="text-red-500"
                      bg="bg-red-50"
                    />
                    <EnvCard
                      icon={Wind}
                      label="Air Quality"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]?.air_quality,
                      )}
                      unit="ppm"
                      color="text-cyan-500"
                      bg="bg-cyan-50"
                    />
                    <EnvCard
                      icon={Wind}
                      label="Carbon Monoxide"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]
                          ?.carbon_monoxide,
                      )}
                      unit="ppm"
                      color="text-slate-500"
                      bg="bg-slate-50"
                    />
                    <EnvCard
                      icon={Wind}
                      label="Combustible Gases"
                      value={toNumber(
                        machineDetails.fertilizer_analytics?.[0]
                          ?.combustible_gases,
                      )}
                      unit="ppm"
                      color="text-indigo-500"
                      bg="bg-indigo-50"
                    />
                  </div>
                </div>
              )}

              {/* NPK and machine diagnostics */}
              <div className="space-y-8 mt-6">
                {/* NPK */}
                {(() => {
                  const latest = machineDetails.fertilizer_analytics?.[0] || {};
                  const nRaw = toNumber(latest.nitrogen);
                  const pRaw = toNumber(latest.phosphorus);
                  const kRaw = toNumber(latest.potassium);

                  const n = Number.isFinite(nRaw) ? nRaw : 40;
                  const p = Number.isFinite(pRaw) ? pRaw : 25;
                  const k = Number.isFinite(kRaw) ? kRaw : 35;
                  const total = Math.max(n + p + k, 1);
                  const nPct = Math.round((n / total) * 100);
                  const pPct = Math.round((p / total) * 100);
                  const kPct = 100 - nPct - pPct;

                  return (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-[#3A4D39] mb-8 text-xl">
                          Output Composition
                        </h3>
                        <div className="space-y-8">
                          <NutrientBar
                            label={`Nitrogen (N) — ${latest.nitrogen || "0%"}`}
                            value={nPct}
                            color="bg-[#C26A4A]"
                            textColor="text-[#C26A4A]"
                          />
                          <NutrientBar
                            label={`Phosphorus (P) — ${latest.phosphorus || "0%"}`}
                            value={pPct}
                            color="bg-[#D97706]"
                            textColor="text-[#D97706]"
                          />
                          <NutrientBar
                            label={`Potassium (K) — ${latest.potassium || "0%"}`}
                            value={kPct}
                            color="bg-[#739072]"
                            textColor="text-[#739072]"
                          />
                        </div>
                      </div>

                      <div className="bg-[#3A4D39] rounded-2xl p-8 text-white shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[280px]">
                        <div className="relative z-10">
                          <h3 className="font-bold text-white mb-2 text-xl">
                            NPK Balance
                          </h3>
                          <p className="text-sm text-white/60 mb-10 max-w-[80%]">
                            Calculated ratio based on latest sensor telemetry.
                          </p>

                          <div className="flex gap-4 h-32 w-full items-end justify-center mb-4">
                            <div
                              className="w-20 bg-[#C26A4A] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg"
                              style={{ height: `${Math.max(20, nPct)}%` }}
                            >
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">
                                {nPct}%
                              </span>
                              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">
                                N
                              </span>
                            </div>
                            <div
                              className="w-20 bg-[#D97706] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg"
                              style={{ height: `${Math.max(20, pPct)}%` }}
                            >
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">
                                {pPct}%
                              </span>
                              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">
                                P
                              </span>
                            </div>
                            <div
                              className="w-20 bg-[#739072] rounded-t-xl relative group transition-all hover:opacity-90 shadow-lg"
                              style={{ height: `${Math.max(20, kPct)}%` }}
                            >
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold">
                                {kPct}%
                              </span>
                              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-white/40 text-base">
                                K
                              </span>
                            </div>
                          </div>
                        </div>
                        <Sprout className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 z-0" />
                      </div>
                    </div>
                  );
                })()}

                {/* Machine Diagnostics - New Design */}
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
                      <h2 className="text-4xl font-black text-[#3A4D39] tracking-tight">
                        Machine Diagnostics
                      </h2>
                      <p className="text-[#4F6F52] font-medium mt-1 text-lg">
                        Quick status overview — click a card for details.
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#4F6F52] animate-pulse" />
                        <span className="font-bold text-[#3A4D39] text-sm">
                          Diagnostic Running
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {/* Controllers */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#3A4D39]">
                          Controllers
                        </h3>
                        <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                          5 Units
                        </span>
                      </div>

                      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="c1"
                          title="Arduino Q"
                          icon={Cpu}
                          subtext="Main Logic Unit"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "c1",
                              label: "Arduino Q",
                              value: machineDetails.c1,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="c2"
                          title="ESP32 Filter"
                          icon={Wifi}
                          subtext="Air Filtration"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "c2",
                              label: "ESP32 Filter",
                              value: machineDetails.c2,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="c3"
                          title="ESP32 Chute"
                          icon={Wifi}
                          subtext="Waste Intake"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "c3",
                              label: "ESP32 Chute",
                              value: machineDetails.c3,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="c4"
                          title="ESP32 Grinder"
                          icon={Wifi}
                          subtext="Processing Unit"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "c4",
                              label: "ESP32 Grinder",
                              value: machineDetails.c4,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="c5"
                          title="ESP32 Exhaust"
                          icon={Wifi}
                          subtext="Ventilation Control"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "c5",
                              label: "ESP32 Exhaust",
                              value: machineDetails.c5,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Actuators/Motors */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-700">
                          <Cog className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#3A4D39]">
                          Actuators
                        </h3>
                        <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                          7 Units
                        </span>
                      </div>

                      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m4"
                          title="Grinder Motor"
                          icon={Cog}
                          subtext="High Torque"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m4",
                              label: "Grinder Motor",
                              value: machineDetails.m4,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m5"
                          title="Mixer Motor"
                          icon={Cog}
                          subtext="Mixing Unit"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m5",
                              label: "Mixer Motor",
                              value: machineDetails.m5,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m6"
                          title="Exhaust Fan In"
                          icon={Fan}
                          subtext="Intake Fan"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m6",
                              label: "Exhaust Fan In",
                              value: machineDetails.m6,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m7"
                          title="Exhaust Fan Out"
                          icon={Fan}
                          subtext="Output Fan"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m7",
                              label: "Exhaust Fan Out",
                              value: machineDetails.m7,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m1"
                          title="Servo Lid A"
                          icon={Cog}
                          subtext="Lid Control"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m1",
                              label: "Servo Lid A",
                              value: machineDetails.m1,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m2"
                          title="Servo Lid B"
                          icon={Cog}
                          subtext="Secondary Lid"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m2",
                              label: "Servo Lid B",
                              value: machineDetails.m2,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="m3"
                          title="Servo Diverter"
                          icon={Cog}
                          subtext="Material Routing"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "m3",
                              label: "Servo Diverter",
                              value: machineDetails.m3,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Sensors */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Eye className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#3A4D39]">
                          Sensors
                        </h3>
                        <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                          9 Units
                        </span>
                      </div>

                      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s1"
                          title="Camera A"
                          icon={Eye}
                          subtext="Feed Input"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s1",
                              label: "Camera A",
                              value: machineDetails.s1,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s2"
                          title="Camera B"
                          icon={Eye}
                          subtext="Processing Bay"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s2",
                              label: "Camera B",
                              value: machineDetails.s2,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s3"
                          title="Humidity"
                          icon={Droplets}
                          subtext="DHT22 Sensor"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s3",
                              label: "Humidity",
                              value: machineDetails.s3,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s4"
                          title="Temperature"
                          icon={Thermometer}
                          subtext="Internal Probe"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s4",
                              label: "Temperature",
                              value: machineDetails.s4,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s5"
                          title="Gas (Methane)"
                          icon={Wind}
                          subtext="MQ-4 Sensor"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s5",
                              label: "Gas (Methane)",
                              value: machineDetails.s5,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s6"
                          title="NPK Sensor"
                          icon={Activity}
                          subtext="Soil Probe"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s6",
                              label: "NPK Sensor",
                              value: machineDetails.s6,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s7"
                          title="Water Level"
                          icon={Droplets}
                          subtext="Float Sensor"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s7",
                              label: "Water Level",
                              value: machineDetails.s7,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s8"
                          title="Moisture"
                          icon={Droplets}
                          subtext="Capacitive Sensor"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s8",
                              label: "Moisture",
                              value: machineDetails.s8,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                        <DiagnosticCard
                          machine={machineDetails}
                          keyId="s9"
                          title="Gas (Nitrogen)"
                          icon={Wind}
                          subtext="N2 Detection"
                          onDetails={() => {
                            setSelectedDiag({
                              key: "s9",
                              label: "Gas (Nitrogen)",
                              value: machineDetails.s9,
                            });
                            setShowDiagModal(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {showDiagModal && selectedDiag && (
                    <DiagModal
                      diag={selectedDiag}
                      onClose={() => {
                        setShowDiagModal(false);
                        setSelectedDiag(null);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
              <div
                className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl transition-colors ${Number(machineDetails.error_rate) > 0 ? "bg-red-500" : "bg-green-500"}`}
              />
              <h3 className="font-bold text-[#3A4D39] flex items-center gap-2 relative z-10 text-xl">
                <Activity className="h-6 w-6 text-[#D97706]" /> System Health
              </h3>

              <div className="flex flex-col items-center justify-center py-2 relative z-10">
                <div className="text-6xl font-black text-[#3A4D39] tracking-tighter">
                  {machineHealth?.error_rate ?? machineDetails.error_rate}
                  <span className="text-3xl text-gray-400">%</span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.25em] mt-2">
                  Error Rate
                </span>
              </div>

              <div
                className={`flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-full font-bold border transition-colors relative z-10 ${
                  Number(
                    machineHealth?.error_rate ?? machineDetails.error_rate,
                  ) > 0
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-green-50 text-green-700 border-green-100"
                }`}
              >
                {Number(
                  machineHealth?.error_rate ?? machineDetails.error_rate,
                ) > 0 ? (
                  <>
                    <AlertTriangle className="h-4 w-4" /> Attention Needed
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> System Optimal
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        {machineDetails?.fertilizer_analytics?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-0 overflow-hidden">
            <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6 text-[#4F6F52]" /> History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      N (%)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      P (%)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      K (%)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      pH
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Temp
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Humid
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Moist
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Methane
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Carbon Monoxide
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Lid (Reed)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {machineDetails.fertilizer_analytics.map((log, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                        {new Date(log.date_created).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[#C26A4A]">
                        {log.nitrogen}%
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[#D97706]">
                        {log.phosphorus}%
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[#739072]">
                        {log.potassium}%
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                          {log.ph}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {log.temperature}°C
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {log.humidity}%
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {log.moisture}%
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {log.methane} ppm
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {log.carbon_monoxide} ppm
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-blue-600">
                        {log.weight_kg || 0} kg
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            log.reed_switch === "1" ||
                            log.reed_switch === "true" ||
                            log.reed_switch === true
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {log.reed_switch === "1" ||
                          log.reed_switch === "true" ||
                          log.reed_switch === true
                            ? "OPEN"
                            : "CLOSED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function EnvCard({ icon: Icon, label, value, unit, color, bg }) {
  return (
    <div
      className={`rounded-xl p-5 border border-gray-100 flex items-center gap-5 transition-colors hover:shadow-sm ${bg ? "bg-white" : "bg-gray-50"}`}
    >
      <div className={`p-3.5 rounded-full ${bg} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-0.5">
          {label}
        </p>
        <p className="font-bold text-gray-800 text-xl">
          {value || "--"}
          <span className="text-sm ml-0.5 text-gray-400 font-normal">
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
}

function NutrientBar({ label, value, color, textColor }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-3 font-bold">
        <span className="text-gray-600 text-base">{label}</span>
        <span className={`${textColor} text-base`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full shadow-sm ${color}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function DiagnosticCard({
  machine,
  keyId,
  title,
  icon: Icon,
  subtext,
  onDetails,
}) {
  const val = machine?.[keyId];
  const ok = !(val === true || val === "true" || val === 1);

  return (
    <button
      onClick={onDetails}
      className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md ${
        ok
          ? "bg-green-50/50 border-green-100 text-green-700"
          : "bg-red-50/50 border-red-100 text-red-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`p-2.5 rounded-lg ${ok ? "bg-green-100" : "bg-red-100"}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{title}</p>
            <p className="text-xs opacity-75">{subtext}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {ok ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>
      <p className="text-xs font-semibold">
        {ok ? "Operational" : "Fault detected"}
      </p>
    </button>
  );
}

function DiagModal({ diag, onClose }) {
  if (!diag) return null;
  const { key, label, value } = diag;
  const ok = !(value === true || value === "true" || value === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-[min(600px,95%)] shadow-2xl z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold">{label}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Key: <span className="font-mono">{key}</span>
            </p>
          </div>
          <div
            className={`text-sm font-bold px-3 py-1 rounded-full ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {ok ? "OK" : "Issue"}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-700">Raw value:</p>
          <pre className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-800 overflow-x-auto">
            {String(value)}
          </pre>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MachineDetails;
