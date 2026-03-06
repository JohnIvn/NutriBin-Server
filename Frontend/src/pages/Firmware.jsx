import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  CloudUpload,
  HardDrive,
  RotateCw,
  Tag,
  Calendar,
  Server,
  FileText,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  UploadCloud,
  ArrowUpRight,
  History,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function bytesToHex(buffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (b) => ("00" + b.toString(16)).slice(-2))
    .join("");
}

async function computeSHA256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return bytesToHex(digest);
}

export default function Firmware() {
  const [currentFirmware, setCurrentFirmware] = useState({
    version: "v1.0.0",
    build: "---",
    releaseDate: "---",
    models: [],
    status: "---",
  });

  const [file, setFile] = useState(null);
  const [, setChecksum] = useState("");
  const [version, setVersion] = useState("");
  const [vMajor, setVMajor] = useState("");
  const [vMinor, setVMinor] = useState("");
  const [vPatch, setVPatch] = useState("");
  const [changelog, setChangelog] = useState("");
  const [targetModels, setTargetModels] = useState([]);
  const [, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function updateChecksum() {
      if (file) {
        setValidating(true);
        const hash = await computeSHA256(file);
        setChecksum(hash);
        setValidating(false);
      } else {
        setChecksum("");
      }
    }
    updateChecksum();
  }, [file]);

  useEffect(() => {
    setVersion(`${vMajor || "0"}.${vMinor || "0"}.${vPatch || "0"}`);
  }, [vMajor, vMinor, vPatch]);

  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await Requests({ url: "/management/firmware/history" });
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchLatest = async () => {
    try {
      const response = await Requests({ url: "/management/firmware/latest" });
      if (response.data) {
        setCurrentFirmware({
          version: response.data.version,
          build: response.data.build,
          releaseDate: new Date(
            response.data.release_date || response.data.created_at,
          ).toLocaleDateString(),
          models: response.data.target_models || [],
          status: response.data.status,
        });
      }
    } catch (err) {
      console.error("Failed to fetch latest", err);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await Requests({
        url: "/management/firmware/machines",
      });
      if (response.data) {
        setDevices(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch machines", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchLatest();
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleFileChange(e) {
    setChecksum("");
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = [".bin", ".hex", ".uf2"];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes("." + ext)) {
      setFile(null);
      toast.error("Unsupported file type");
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setFile(null);
      toast.error("File too large (>20MB)");
      return;
    }

    setFile(f);
  }

  async function handleCreateVersion() {
    if (!version) return toast.error("Version is required (e.g. 1.0.1)");
    setCreating(true);
    try {
      const response = await Requests({
        method: "POST",
        url: "/management/firmware/create",
        data: {
          version,
          releaseNotes: changelog,
          targetModels: targetModels,
          uploadedBy: "Admin", // Fallback if no user context
        },
      });

      if (response.status === 201) {
        toast.success("Firmware version created!");
        setVersion("");
        setChangelog("");
        setTargetModels([]);
        setIsModalOpen(false);
        fetchHistory();
        fetchLatest();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create version");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload() {
    if (!file) return toast.error("No file selected");
    if (!version) return toast.error("Version is required");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);
      formData.append("releaseNotes", changelog);
      formData.append("targetModels", JSON.stringify(targetModels));
      formData.append("uploadedBy", "Admin");

      const response = await Requests({
        method: "POST",
        url: "/management/firmware/upload",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Firmware uploaded successfully!");
        setFile(null);
        setVersion("");
        setChangelog("");
        setTargetModels([]);
        setIsModalOpen(false);
        fetchHistory();
        fetchLatest();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-8 space-y-8 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4F6F52] text-sm font-medium mb-1">
              <Cpu className="h-4 w-4" />
              <span>System Infrastructure</span>
              <ChevronRight className="h-3 w-3" />
              <span>Firmware</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#3A4D39]">
              Provisioning & <span className="text-[#4F6F52]">Control</span>
            </h1>
            <p className="text-[#6B6F68] max-w-2xl">
              Centralized firmware distribution hub. Oversee version control,
              integrity validation, and multi-device deployment cycles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#3A4D39]/20">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  New Version
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#3A4D39] p-6 text-white relative">
                  <div className="relative z-10">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3 text-white">
                      <UploadCloud className="h-5 w-5" />
                      Provisioning & Versioning
                    </DialogTitle>
                    <DialogDescription className="text-[#ECE3CE] text-xs mt-1 opacity-80">
                      Standardized firmware deployment gateway.
                    </DialogDescription>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <CloudUpload className="h-16 w-16" />
                  </div>
                </div>

                <div className="p-6 space-y-6 bg-white">
                  {/* Modern File Dropzone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      file
                        ? "border-[#4F6F52] bg-[#4F6F52]/5"
                        : "border-gray-100 hover:border-[#4F6F52]/30 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".bin,.hex,.uf2"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {!file ? (
                      <>
                        <div className="bg-[#4F6F52]/10 p-3 rounded-full mb-3">
                          <HardDrive className="h-6 w-6 text-[#4F6F52]" />
                        </div>
                        <p className="font-bold text-sm text-[#3A4D39]">
                          Click or drag to select binary
                        </p>
                        <p className="text-[10px] text-[#6B6F68] mt-1">
                          Supported: .bin, .hex, .uf2 (Max 20MB)
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-emerald-500 p-3 rounded-full mb-3">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-bold text-sm text-[#4F6F52]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[#6B6F68] mt-1">
                          {(file.size / 1024).toFixed(1)} KB • Binary Staged
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Change File
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#6B6F68] uppercase mb-1.5 block tracking-tight">
                          Software Version (Major . Minor . Patch)
                        </label>
                        <div className="flex gap-2 items-center">
                          <span className="text-xl font-black text-[#3A4D39]">
                            v
                          </span>
                          <div className="flex items-center gap-1.5 flex-1">
                            <Input
                              value={vMajor}
                              onChange={(e) =>
                                setVMajor(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/50 border-none shadow-inner h-10 text-center text-base font-bold text-[#3A4D39] p-0"
                            />
                            <span className="text-[#3A4D39] font-black">.</span>
                            <Input
                              value={vMinor}
                              onChange={(e) =>
                                setVMinor(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/50 border-none shadow-inner h-10 text-center text-base font-bold text-[#3A4D39] p-0"
                            />
                            <span className="text-[#3A4D39] font-black">.</span>
                            <Input
                              value={vPatch}
                              onChange={(e) =>
                                setVPatch(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/50 border-none shadow-inner h-10 text-center text-base font-bold text-[#3A4D39] p-0"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#6B6F68] uppercase mb-1.5 block tracking-tight">
                          Target Models
                        </label>
                        <Select
                          value={
                            targetModels.length === 2
                              ? "ALL"
                              : targetModels[0] || ""
                          }
                          onValueChange={(val) =>
                            setTargetModels(
                              val === "ALL" ? ["NB-100", "NB-200"] : [val],
                            )
                          }
                        >
                          <SelectTrigger className="bg-gray-50/50 border-none shadow-inner h-10 w-full text-sm text-[#3A4D39] font-medium rounded-xl px-4">
                            <SelectValue placeholder="Select Model" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl z-[100]">
                            <SelectItem
                              value="NB-100"
                              className="text-sm font-medium text-[#3A4D39] cursor-pointer px-4 py-2 hover:bg-gray-50"
                            >
                              NB-100 Series
                            </SelectItem>
                            <SelectItem
                              value="NB-200"
                              className="text-sm font-medium text-[#3A4D39] cursor-pointer px-4 py-2 hover:bg-gray-50"
                            >
                              NB-200 Series
                            </SelectItem>
                            <SelectItem
                              value="ALL"
                              className="text-sm font-black text-[#4F6F52] cursor-pointer px-4 py-2 border-t border-gray-50 mt-1 hover:bg-emerald-50"
                            >
                              Universal (Both)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#6B6F68] uppercase block tracking-tight">
                        Release Intelligence
                      </label>
                      <textarea
                        value={changelog}
                        onChange={(e) => setChangelog(e.target.value)}
                        placeholder="Specify patch details..."
                        className="w-full bg-gray-50/50 border-none rounded-xl p-3 text-xs font-medium shadow-inner"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-end gap-3">
                    <Button
                      onClick={handleCreateVersion}
                      disabled={!version || creating || uploading}
                      variant="outline"
                      className="border-2 border-[#3A4D39] text-[#3A4D39] hover:bg-[#3A4D39]/5 font-bold px-6 h-10 rounded-xl text-xs"
                    >
                      {creating ? (
                        <RotateCw className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Tag className="h-3 w-3 mr-2" />
                      )}
                      Pre-Register
                    </Button>

                    <Button
                      onClick={handleUpload}
                      disabled={!version || !file || uploading || creating}
                      className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-black px-8 h-10 rounded-xl text-sm shadow-lg shadow-[#3A4D39]/20 group"
                    >
                      {uploading ? (
                        <RotateCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CloudUpload className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      )}
                      Deploy Binary
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/5 h-11 px-6 rounded-xl"
              onClick={() => {
                fetchHistory();
                fetchLatest();
              }}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Force Sync
            </Button>
          </div>
        </div>

        {/* Dynamic KPI Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {[
            {
              label: "Primary Version",
              value: currentFirmware.version,
              sub: `Build ID: ${currentFirmware.build}`,
              icon: ShieldCheck,
              status: currentFirmware.status,
              color: "emerald",
            },
            {
              label: "Release Cycle",
              value: currentFirmware.releaseDate,
              sub: `Models: ${currentFirmware.models.join(", ") || "All"}`,
              icon: Calendar,
              color: "blue",
            },
            {
              label: "Network Nodes",
              value: devices.length,
              sub: "Active Machines",
              icon: Server,
              color: "amber",
            },
            {
              label: "Recent Activity",
              value: history[0]?.version || "N/A",
              sub: history[0] ? `Admin Release` : "No history",
              icon: ArrowUpRight,
              color: "purple",
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex"
            >
              <Card className="bg-white border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative group transition-all hover:shadow-lg flex-1 flex flex-col justify-between items-stretch">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-auto">
                    <div>
                      <p className="text-xs font-bold text-[#6B6F68] uppercase tracking-wider mb-2">
                        {kpi.label}
                      </p>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        {kpi.value}
                      </h3>
                      <p className="text-[10px] text-[#6B6F68] mt-1 flex items-center gap-1 font-mono line-clamp-2">
                        {kpi.sub}
                      </p>
                    </div>
                    <div className="p-3 bg-[#FAF9F6] rounded-xl group-hover:bg-[#4F6F52]/10 transition-colors shrink-0">
                      <kpi.icon className="h-5 w-5 text-[#4F6F52]" />
                    </div>
                  </div>
                  {kpi.status ? (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#6B6F68]">
                        Build Status
                      </span>
                      <span
                        className={`text-[10px] leading-none px-2 py-1 rounded-full font-bold ${
                          kpi.status === "Stable"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {kpi.status}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-transparent" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Control Interface */}
        <div className="flex flex-col gap-8">
          <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div>
                <h3 className="text-lg font-black text-[#3A4D39]">
                  Network Propagation
                </h3>
                <p className="text-xs text-[#6B6F68]">Active update cycles</p>
              </div>
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Server className="h-5 w-5 text-[#4F6F52]" />
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {devices.map((d, idx) => (
                    <motion.div
                      key={d.machine_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-[#4F6F52]/10 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-black text-[#3A4D39] flex items-start gap-2 leading-tight break-all">
                            <span>{d.machine_id}</span>
                            {d.update_status === "failed" && (
                              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            )}
                          </p>
                          <div className="text-[10px] text-[#6B6F68] font-mono font-bold uppercase tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                            <span>SN: {d.serial_number}</span>
                            <span className="opacity-30">•</span>
                            <span className="text-[#4F6F52]">
                              {d.model_no || "---"}
                            </span>
                            <span className="opacity-30">•</span>
                            <span>{d.firmware_version}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase shrink-0 ml-2 ${
                            d.update_status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : d.update_status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {d.update_status?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="flex -space-x-2 overflow-hidden items-center">
                            {(d.user_names || []).length > 0 ? (
                              d.user_names.map((name, i) => (
                                <div
                                  key={i}
                                  title={name}
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white border-2 border-[#4F6F52]/20 text-[8px] font-black text-[#4F6F52] uppercase ring-1 ring-[#4F6F52]/10"
                                >
                                  {name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                              ))
                            ) : (
                              <span className="text-[10px] font-black text-[#6B6F68] uppercase">
                                Unassigned
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-[#3A4D39]">
                            {d.update_status === "success"
                              ? "100%"
                              : d.update_status === "failed" ||
                                  d.update_status === "in_progress"
                                ? `${d["update progress"] || 0}%`
                                : "Syncing..."}
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                d.update_status === "success"
                                  ? "100%"
                                  : d.update_status === "failed" ||
                                      d.update_status === "in_progress"
                                    ? `${d["update progress"] || 0}%`
                                    : "0%",
                            }}
                            className={`h-full rounded-full transition-colors duration-500 ${
                              d.update_status === "success"
                                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                : d.update_status === "failed"
                                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                  : "bg-amber-500"
                            }`}
                          />
                          {d.update_status === "in_progress" && (
                            <motion.div
                              initial={{ left: "-100%" }}
                              animate={{ left: "100%" }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear",
                              }}
                              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#6B6F68] font-bold">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Calendar className="h-3 w-3" />
                              <span className="uppercase tracking-tight">
                                Last Sync:
                              </span>
                            </div>
                            <span className="text-[#3A4D39]">
                              {d.last_update_attempt
                                ? new Date(
                                    d.last_update_attempt,
                                  ).toLocaleString()
                                : "NONE"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {devices.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <Server className="h-16 w-16 mb-4 text-[#3A4D39]" />
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#3A4D39]">
                    No Active Infrastructure
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historical Ledger */}
        <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#3A4D39] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#3A4D39]/20">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#3A4D39]">
                  Audit Log & History
                </h3>
                <p className="text-sm text-[#6B6F68]">
                  Immutable record of all firmware promotion events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter versions..."
                  className="pl-9 bg-white border-gray-200 w-64 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="font-black text-[#3A4D39] h-14 pl-8 uppercase text-[10px] tracking-widest">
                    ID
                  </TableHead>
                  <TableHead className="font-black text-[#3A4D39] h-14 uppercase text-[10px] tracking-widest">
                    Release Info
                  </TableHead>
                  <TableHead className="font-black text-[#3A4D39] h-14 uppercase text-[10px] tracking-widest">
                    Authorized By
                  </TableHead>
                  <TableHead className="font-black text-[#3A4D39] h-14 uppercase text-[10px] tracking-widest text-right pr-8">
                    Status / Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((h) => (
                    <TableRow
                      key={h.id}
                      className="border-gray-50 hover:bg-[#FAF9F6] transition-colors group"
                    >
                      <TableCell className="pl-8 py-5">
                        <span className="font-mono text-xs text-[#6B6F68] bg-gray-100 px-2 py-1 rounded">
                          #{h.firmware_id?.slice(0, 8) || h.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-[#4F6F52]/10 rounded-lg flex items-center justify-center text-[#4F6F52] font-black group-hover:bg-[#4F6F52] group-hover:text-white transition-colors">
                            {h.version.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-black text-[#3A4D39]">
                              {h.version}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#6B6F68] font-medium mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(h.release_date).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                              <span>•</span>
                              <span className="italic">
                                {h.notes || "No release notes"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-700 uppercase">
                            {h.uploaded_by?.charAt(0) || "A"}
                          </div>
                          <span className="text-sm font-bold text-[#6B6F68]">
                            {h.uploaded_by || "System Admin"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">
                            Archived
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#6B6F68] hover:text-[#3A4D39]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-[#6B6F68] italic border-none"
                    >
                      No historical records detected in the ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}
