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
import { Checkbox } from "@/components/ui/checkbox";
import {
  UploadCloud,
  HardDrive,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  History,
  Bell,
  CloudUpload,
  Terminal,
  RefreshCcw,
  AlertCircle,
  Info,
  Megaphone,
  Trash2,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

export default function OtaManagement() {
  const [file, setFile] = useState(null);
  const [vMajor, setVMajor] = useState("");
  const [vMinor, setVMinor] = useState("");
  const [vPatch, setVPatch] = useState("");
  const [type, setType] = useState("esp32");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifyFleet, setNotifyFleet] = useState(true);
  const [createAnnouncement, setCreateAnnouncement] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState([]);

  const version = `${vMajor || "0"}.${vMinor || "0"}.${vPatch || "0"}`;

  const fetchHistory = async () => {
    try {
      const resp = await Requests({ url: "/ota/history" });
      if (resp.data) setHistory(resp.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this firmware record? This will also remove the file from storage.",
      )
    ) {
      return;
    }

    try {
      const resp = await Requests({
        url: `/ota/history/${id}`,
        method: "DELETE",
      });
      if (resp.status === 200) {
        toast.success("Firmware record deleted successfully");
        fetchHistory();
      }
    } catch (error) {
      toast.error("Failed to delete firmware record");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async () => {
    setErrorMessage("");
    console.log(
      "Initiate Sync button clicked! Starting firmware upload process...",
    );
    if (!file || !vMajor || !vMinor || !vPatch) {
      setErrorMessage("Please provide a file and a valid version");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("version", "v" + version);
    formData.append("type", type);
    formData.append("releaseNotes", notes);
    formData.append("notifyFleet", notifyFleet.toString());
    formData.append("createAnnouncement", createAnnouncement.toString());

    console.log("FormData being sent:", {
      version: "v" + version,
      type,
      file: file.name,
      notifyFleet,
      createAnnouncement,
    });

    try {
      console.log("Calling Requests('/ota/upload')...");
      const resp = await Requests({
        url: "/ota/upload",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Response received:", resp);
      if (resp.status === 201) {
        toast.success("Firmware deployed to edge nodes!");
        setFile(null);
        setVMajor("");
        setVMinor("");
        setVPatch("");
        setNotes("");
        setCreateAnnouncement(false);
        setIsModalOpen(false);
        fetchHistory();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Deployment failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-8 space-y-8 max-w-7xl mx-auto">
        {/* Modern Header - Mirrored from Firmware.jsx */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4F6F52] text-sm font-medium mb-1">
              <Cpu className="h-4 w-4" />
              <span>System Infrastructure</span>
              <ChevronRight className="h-3 w-3" />
              <span>Advanced OTA</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#3A4D39]">
              Fleet <span className="text-[#4F6F52]">Sync</span>
            </h1>
            <p className="text-[#6B6F68] max-w-2xl">
              Managed edge infrastructure deployment. Remotely provision node
              controllers and system motherboards via secure push-protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#3A4D39]/20">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Deploy Firmware
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#3A4D39] p-6 text-white relative">
                  <div className="relative z-10">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3 text-white">
                      <UploadCloud className="h-5 w-5" />
                      Fleet Provisioning
                    </DialogTitle>
                    <DialogDescription className="text-[#ECE3CE] text-xs mt-1 opacity-80">
                      Standardized edge deployment gateway.
                    </DialogDescription>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <CloudUpload className="h-16 w-16" />
                  </div>
                </div>

                <div className="p-6 space-y-6 bg-white">
                  {/* Modern File Dropzone - Mirrored from Firmware.jsx */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      file
                        ? "border-[#4F6F52] bg-[#4F6F52]/5"
                        : "border-gray-100 hover:border-[#4F6F52]/30 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      document.getElementById("file-input-ota").click()
                    }
                  >
                    <input
                      id="file-input-ota"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
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
                        <p className="text-[10px] text-[#6B6F68] mt-1 italic">
                          ESP32: .bin, .ino | Linux: .tar.gz, .sh
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
                          {(file.size / 1024).toFixed(1)} KB • Payload Staged
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
                          Semantic Version (Major . Minor . Patch)
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
                          Target Protocol
                        </label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger className="bg-gray-50/50 border-none shadow-inner h-10 w-full text-sm text-[#3A4D39] font-medium rounded-xl px-4">
                            <SelectValue placeholder="Select Target" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl z-[100]">
                            <SelectItem
                              value="esp32"
                              className="text-sm font-medium text-[#3A4D39] cursor-pointer px-4 py-2 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-blue-500" />
                                <span>ESP32 Node Controller</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="linux"
                              className="text-sm font-medium text-[#3A4D39] cursor-pointer px-4 py-2 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-orange-500" />
                                <span>Linux System Board</span>
                              </div>
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
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log technical changes for this build..."
                        className="w-full bg-gray-50/50 border-none rounded-xl p-3 text-xs font-medium shadow-inner"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Notification Toggles - Mirrored from Firmware.jsx */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 border-t border-b border-gray-50">
                    <div
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        notifyFleet
                          ? "bg-emerald-50 border-emerald-100 border"
                          : "bg-gray-50/50 border-transparent border hover:bg-gray-100"
                      }`}
                      onClick={() => setNotifyFleet(!notifyFleet)}
                    >
                      <div
                        className={`mt-0.5 p-2 rounded-lg ${
                          notifyFleet
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              notifyFleet
                                ? "text-emerald-700"
                                : "text-[#3A4D39]"
                            }`}
                          >
                            OTA Broadcast
                          </p>
                          <Checkbox
                            checked={notifyFleet}
                            onCheckedChange={setNotifyFleet}
                            className="border-[#4F6F52] data-[state=checked]:bg-[#4F6F52]"
                          />
                        </div>
                        <p className="text-[10px] text-[#6B6F68] leading-tight">
                          Flag version mismatch to nodes.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        createAnnouncement
                          ? "bg-blue-50 border-blue-100 border"
                          : "bg-gray-50/50 border-transparent border hover:bg-gray-100"
                      }`}
                      onClick={() => setCreateAnnouncement(!createAnnouncement)}
                    >
                      <div
                        className={`mt-0.5 p-2 rounded-lg ${
                          createAnnouncement
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              createAnnouncement
                                ? "text-blue-700"
                                : "text-[#3A4D39]"
                            }`}
                          >
                            Announcement
                          </p>
                          <Checkbox
                            checked={createAnnouncement}
                            onCheckedChange={setCreateAnnouncement}
                            className="border-[#3A4D39] data-[state=checked]:bg-[#3A4D39]"
                          />
                        </div>
                        <p className="text-[10px] text-[#6B6F68] leading-tight">
                          Post to system-wide activity log.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inline Error Messenger */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight">
                              Deployment Error
                            </p>
                            <p className="text-xs text-red-600 font-medium">
                              {errorMessage}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-100/50"
                            onClick={() => setErrorMessage("")}
                          >
                            <RefreshCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50">
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl font-bold text-[#6B6F68] hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#3A4D39]/20"
                    >
                      {uploading ? (
                        <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UploadCloud className="h-4 w-4 mr-2" />
                      )}
                      Initiate Sync
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Grid - Matches Firmware.jsx style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Block */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="pb-2 border-b border-gray-50">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-[#6B6F68]">
                    Service Heartbeat
                  </CardDescription>
                  <CardTitle className="text-xl font-bold text-[#3A4D39]">
                    OTA Protocol Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-4 rounded-2xl">
                      <RefreshCcw className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        Active
                      </h3>
                      <p className="text-xs text-[#6B6F68]">
                        Fleet synchronization gateway is listening
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="pb-2 border-b border-gray-50">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-[#6B6F68]">
                    Fleet Monitoring
                  </CardDescription>
                  <CardTitle className="text-xl font-bold text-[#3A4D39]">
                    Global Topology
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-2xl">
                      <Cpu className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        Standard
                      </h3>
                      <p className="text-xs text-[#6B6F68]">
                        Automatic version mismatch detection enabled
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="bg-[#3A4D39] text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="h-5 w-5 text-[#ECE3CE]" />
                    <CardTitle className="text-lg">
                      Deployment History
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchHistory}
                    className="text-white hover:bg-white/10 h-8 w-8 rounded-lg"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68] px-6 py-4">
                          Version
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68]">
                          Target Model
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68]">
                          Build ID
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68]">
                          Release Date
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68]">
                          Status
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-[#6B6F68] text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length > 0 ? (
                        history.map((h) => (
                          <TableRow
                            key={h.firmware_id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <TableCell className="px-6 py-4 font-bold text-[#3A4D39]">
                              {h.version}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {h.target_models.includes("esp32") && (
                                  <span className="p-1 px-2 bg-blue-50 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Cpu className="h-3 w-3" /> ESP32
                                  </span>
                                )}
                                {h.target_models.includes("linux") && (
                                  <span className="p-1 px-2 bg-orange-50 text-orange-600 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Terminal className="h-3 w-3" /> Linux
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-[10px] text-gray-500">
                              {h.build}
                            </TableCell>
                            <TableCell className="text-xs text-[#6B6F68]">
                              {new Date(h.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">
                                Deployed
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(h.firmware_id)}
                                className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-32 text-center text-gray-400 italic text-sm"
                          >
                            No OTA deployments recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Info & Safety */}
          <div className="space-y-8">
            <Card className="bg-[#1a1c1e] text-white border-none shadow-xl overflow-hidden rounded-2xl">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#4F6F52]" />
                  Protocol Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F52] mt-1.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    Devices poll the sync-point every 10 seconds to detect
                    version variance.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F52] mt-1.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    Motherboards verify SHA256 integrity before script
                    execution.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F52] mt-1.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    ESP32 modules perform a dual-partition swap for
                    zero-downtime updates.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between items-center bg-white/5 border-white/10 hover:bg-white/10 text-white text-[11px] h-9 px-4 rounded-xl"
                  >
                    Technical Documentation
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-amber-50/50 border-l-4 border-amber-400 rounded-2xl shadow-sm">
              <CardContent className="p-6 flex gap-4">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-[#3A4D39] text-[10px] uppercase tracking-widest">
                    Safety Lockdown
                  </h4>
                  <p className="text-[11px] text-[#4F6F52] mt-2 font-medium leading-relaxed italic border-l-2 border-[#4F6F52]/20 pl-3">
                    Implicit Downgrade Protection enabled. Only incremental
                    Semantic Versioning (vMajor.Minor.Patch) triggers the
                    deployment sequence.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-[#FFF5E4] rounded-2xl shadow-sm border border-[#ECE3CE]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#4F6F52]/10 rounded-lg">
                    <Info className="h-4 w-4 text-[#4F6F52]" />
                  </div>
                  <h4 className="font-bold text-[#3A4D39] text-xs">
                    Technical Support
                  </h4>
                </div>
                <p className="text-[10px] text-[#6B6F68] leading-relaxed">
                  For mass provisioning failures or fleet-wide connectivity
                  issues, contact the system architects. View real-time machine
                  logs in the{" "}
                  <span className="font-bold text-[#4F6F52] underline decoration-1">
                    Camera & System Logs
                  </span>{" "}
                  section.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
