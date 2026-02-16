import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
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
  const { user } = useUser();
  const [currentFirmware, setCurrentFirmware] = useState({
    version: "v1.2.3",
    build: "abcdef1234",
    releaseDate: "2025-12-10",
    models: ["NB-100", "NB-200"],
    status: "Stable",
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [checksum, setChecksum] = useState("");
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [targetModel, setTargetModel] = useState("NB-100");
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [devices, setDevices] = useState([
    {
      id: "NB-001",
      name: "Device A",
      current: "v1.2.0",
      target: "v1.2.3",
      status: "notified",
      last: "2026-01-15 09:12",
      retry: 0,
    },
    {
      id: "NB-002",
      name: "Device B",
      current: "v1.1.9",
      target: "v1.2.3",
      status: "pending",
      last: "2026-01-15 09:15",
      retry: 1,
    },
    {
      id: "NB-003",
      name: "Device C",
      current: "v1.2.0",
      target: "v1.2.3",
      status: "failed",
      last: "2026-01-15 08:58",
      retry: 3,
    },
  ]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchLatest();
  }, []);

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
            response.data.release_date,
          ).toLocaleDateString(),
          models: response.data.target_models || [],
          status: response.data.status,
        });
      }
    } catch (err) {
      console.error("Failed to fetch latest", err);
    }
  };

  function handleFileChange(e) {
    setFileError("");
    setChecksum("");
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = [".bin", ".hex", ".uf2"];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes("." + ext)) {
      setFileError("Unsupported file type. Allowed: .bin, .hex, .uf2");
      setFile(null);
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setFileError("File too large. Max 10MB.");
      setFile(null);
      return;
    }

    setFile(f);
    setVersion("");
    setChangelog("");
    setTargetModel("NB-100");
  }

  async function handleValidate() {
    if (!file) return toast.error("No file selected");
    setValidating(true);
    try {
      const sha = await computeSHA256(file);
      setChecksum(sha);
      toast.success("Checksum computed");
    } catch {
      setFileError("Failed to compute checksum");
    } finally {
      setValidating(false);
    }
  }

  async function handleUpload() {
    if (!file) return toast.error("No file selected");
    if (!version) return toast.error("Please provide a firmware version");
    if (!checksum) {
      toast.info("Computing checksum...");
      const sha = await computeSHA256(file);
      setChecksum(sha);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);
      formData.append("checksum", checksum || (await computeSHA256(file)));
      formData.append("notes", changelog);
      formData.append("target_models", targetModel);

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
        setChecksum("");
        fetchHistory();
        fetchLatest();
      }
    } catch (err) {
      console.error(err);
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
            <Button
              variant="outline"
              className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/5"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Primary Version",
              value: currentFirmware.version,
              sub: `Build: ${currentFirmware.build}`,
              icon: ShieldCheck,
              status: currentFirmware.status,
              color: "emerald",
            },
            {
              label: "Release Cycle",
              value: currentFirmware.releaseDate,
              sub: `Target: ${currentFirmware.models.join(", ")}`,
              icon: Calendar,
              color: "blue",
            },
            {
              label: "Network Nodes",
              value: devices.length,
              sub: "Connected Devices",
              icon: Server,
              color: "amber",
            },
            {
              label: "Recent Deploy",
              value: history[0]?.version || "N/A",
              sub: history[0] ? `By ${history[0].uploaded_by}` : "No history",
              icon: ArrowUpRight,
              color: "purple",
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative group transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-[#6B6F68] uppercase tracking-wider mb-2">
                        {kpi.label}
                      </p>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        {kpi.value}
                      </h3>
                      <p className="text-xs text-[#6B6F68] mt-1 flex items-center gap-1 font-mono">
                        {kpi.sub}
                      </p>
                    </div>
                    <div className="p-3 bg-[#FAF9F6] rounded-xl group-hover:bg-[#4F6F52]/10 transition-colors">
                      <kpi.icon className="h-5 w-5 text-[#4F6F52]" />
                    </div>
                  </div>
                  {kpi.status && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#6B6F68]">
                        System Maturity
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Control Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden flex-1 flex flex-col">
              <div className="bg-[#3A4D39] p-8 text-white relative">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <UploadCloud className="h-6 w-6" />
                    Binary Provisioning
                  </h2>
                  <p className="text-[#ECE3CE] text-sm mt-1 opacity-80">
                    Upload firmare binaries to the global edge network.
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CloudUpload className="h-24 w-24" />
                </div>
              </div>

              <CardContent className="p-8 space-y-8 flex-1">
                {/* Modern File Dropzone */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    file
                      ? "border-[#4F6F52] bg-[#4F6F52]/5"
                      : "border-gray-100 hover:border-[#4F6F52]/30 hover:bg-gray-50"
                  }`}
                  onClick={() => document.getElementById("file-input").click()}
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
                      <div className="bg-[#4F6F52]/10 p-4 rounded-full mb-4">
                        <HardDrive className="h-8 w-8 text-[#4F6F52]" />
                      </div>
                      <p className="font-bold text-[#3A4D39]">
                        Click or drag to select binary
                      </p>
                      <p className="text-xs text-[#6B6F68] mt-1">
                        Supported: .bin, .hex, .uf2 (Max 10MB)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-emerald-500 p-4 rounded-full mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                      </div>
                      <p className="font-bold text-[#4F6F52]">{file.name}</p>
                      <p className="text-xs text-[#6B6F68] mt-1">
                        {(file.size / 1024).toFixed(1)} KB • Ready for staging
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#6B6F68] uppercase mb-2 block tracking-tight">
                        Software Version
                      </label>
                      <Input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="v1.x.x"
                        className="bg-gray-50/50 border-none shadow-inner h-12 text-lg font-bold text-[#3A4D39]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#6B6F68] uppercase mb-2 block tracking-tight">
                        Target Hardware
                      </label>
                      <select
                        value={targetModel}
                        onChange={(e) => setTargetModel(e.target.value)}
                        className="w-full h-12 bg-gray-50/50 border-none rounded-md px-4 text-[#3A4D39] font-medium shadow-inner"
                      >
                        <option>NB-100 (Single Bin)</option>
                        <option>NB-200 (Dual Stack)</option>
                        <option>Global (All)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[#6B6F68] uppercase block tracking-tight">
                      Deployment Logistics
                    </label>
                    <textarea
                      value={changelog}
                      onChange={(e) => setChangelog(e.target.value)}
                      placeholder="Enter commit log or change notes..."
                      className="w-full bg-gray-50/50 border-none rounded-xl p-4 text-sm font-medium shadow-inner"
                      rows={5}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleValidate}
                      variant="outline"
                      disabled={!file || validating}
                      className="border-2 font-bold px-8 h-12 rounded-xl"
                    >
                      {validating ? (
                        <RotateCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 mr-2" />
                      )}
                      Run Integrity Check
                    </Button>
                    {checksum && (
                      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {checksum.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!version || !file || uploading}
                    className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-black px-12 h-12 rounded-xl text-lg shadow-lg shadow-[#3A4D39]/20 group"
                  >
                    {uploading ? (
                      <RotateCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <CloudUpload className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    )}
                    Promote to Prod
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden flex-1 flex flex-col">
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

              <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
                <AnimatePresence>
                  {devices.map((d, idx) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors border border-transparent hover:border-[#4F6F52]/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#3A4D39] flex items-center gap-2 truncate">
                            {d.name}
                            {d.status === "failed" && (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                          </p>
                          <p className="text-[10px] text-[#6B6F68] font-mono uppercase">
                            UID: {d.id}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                            d.status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : d.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-[#6B6F68]">
                          <span>Propagation</span>
                          <span>
                            {d.status === "success"
                              ? "100%"
                              : d.status === "failed"
                                ? "Critical"
                                : "45%"}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                d.status === "success"
                                  ? "100%"
                                  : d.status === "failed"
                                    ? "10%"
                                    : "45%",
                            }}
                            className={`h-full rounded-full ${
                              d.status === "success"
                                ? "bg-emerald-500"
                                : d.status === "failed"
                                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                  : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-[#6B6F68] pt-1">
                          <span className="font-mono">
                            Current: {d.current}
                          </span>
                          <span className="font-mono text-[#3A4D39] font-bold">
                            Target: {d.target}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
              <div className="p-4 bg-[#3A4D39]/5 text-center">
                <Button
                  variant="ghost"
                  className="text-xs font-bold text-[#4F6F52] h-auto p-0 hover:bg-transparent"
                >
                  View Comprehensive Network Map
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
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
                  history.map((h, i) => (
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
