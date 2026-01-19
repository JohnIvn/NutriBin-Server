import React, { useEffect, useState } from "react";
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
} from "lucide-react";
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

  useEffect(() => {
    fetchMachineDetails();
  }, [machineId]);

  const fetchMachineDetails = async () => {
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
    } catch (err) {
      toast.error("Failed to load machine details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMachineHealth = async (id) => {
    try {
      const res = await Requests({
        url: `/management/machine-health/${id}`,
        method: "GET",
        credentials: true,
      });
      if (res.data?.ok && res.data.health) {
        setMachineHealth(res.data.health);
      }
    } catch (err) {
      // silently ignore health errors (keep existing display)
    }
  };

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

              {/* NPK and module diagnostics */}
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
                            label="Nitrogen (N)"
                            value={nPct}
                            color="bg-[#C26A4A]"
                            textColor="text-[#C26A4A]"
                          />
                          <NutrientBar
                            label="Phosphorus (P)"
                            value={pPct}
                            color="bg-[#D97706]"
                            textColor="text-[#D97706]"
                          />
                          <NutrientBar
                            label="Potassium (K)"
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

                {/* module status grid */}
                {machineDetails.module_analytics?.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-[#3A4D39] mb-8 flex items-center gap-2 text-xl">
                      <Cpu className="h-6 w-6 text-[#4F6F52]" /> Module
                      Diagnostics
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
                            {value ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Machine component diagnostics */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-6">
                  <h3 className="font-bold text-[#3A4D39] mb-6 flex items-center gap-2 text-xl">
                    <Cpu className="h-6 w-6 text-[#4F6F52]" /> Machine
                    Diagnostics
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Quick status overview — click a card for details.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      ["c1", "Arduino Q"],
                      ["c2", "ESP32 Filter"],
                      ["c3", "ESP32 Chute"],
                      ["c4", "ESP32 Grinder"],
                      ["c5", "ESP32 Exhaust"],
                      ["s1", "Camera A"],
                      ["s2", "Camera B"],
                      ["s3", "Humidity"],
                      ["s4", "Temperature"],
                      ["s5", "Gas Methane"],
                      ["s6", "Gas Nitrogen"],
                      ["s7", "Water Level"],
                      ["s8", "NPK Sensor"],
                      ["s9", "Moisture"],
                      ["m1", "Servo Lid A"],
                      ["m2", "Servo Lid B"],
                      ["m3", "Servo Diverter"],
                      ["m4", "Motor Grinder"],
                      ["m5", "Motor Mixer"],
                      ["m6", "Exhaust Fan In"],
                      ["m7", "Exhaust Fan Out"],
                    ].map(([key, label]) => {
                      const val = machineDetails[key];
                      // reverse logic: truthy value indicates a problem on the machine
                      const ok = !(val === true || val === "true" || val === 1);
                      const statusColor = ok ? "green" : "red";

                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedDiag({ key, label, value: val });
                            setShowDiagModal(true);
                          }}
                          className={`text-left p-4 rounded-xl border shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none flex flex-col justify-between items-start gap-3 ${
                            ok
                              ? "bg-green-50/60 border-green-100 text-green-800"
                              : "bg-red-50/60 border-red-100 text-red-800"
                          }`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[75%]">
                              {label}
                            </span>
                            <div
                              className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {ok ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="uppercase tracking-wider">
                                {ok ? "OK" : "Issue"}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-600">
                            {typeof val === "boolean" ||
                            val === null ||
                            val === undefined
                              ? ok
                                ? "Operational"
                                : "Fault detected"
                              : String(val)}
                          </div>
                        </button>
                      );
                    })}
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
