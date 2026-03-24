import { useState } from "react";
import {
  UploadCloud,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Terminal,
  History,
  AlertCircle,
  RefreshCcw,
  FileCode,
  Info,
} from "lucide-react";
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

  const version = `${vMajor || "0"}.${vMinor || "0"}.${vPatch || "0"}`;

  const handleUpload = async () => {
    if (!file || !vMajor || !vMinor || !vPatch) {
      toast.error("Please provide a file and a valid version");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("version", "v" + version);
    formData.append("type", type);
    formData.append("releaseNotes", notes);

    try {
      const resp = await Requests.post("/ota/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.status === 201) {
        toast.success("Firmware deployed to edge nodes!");
        setFile(null);
        setVMajor("");
        setVMinor("");
        setVPatch("");
        setNotes("");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Deployment failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-8 space-y-8 max-w-7xl mx-auto font-sans">
        {/* Header - Matches Firmware.jsx */}
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
            <p className="text-[#6B6F68] max-w-2xl text-sm mt-2">
              Managed edge infrastructure deployment. Remotely provision node
              controllers and system motherboards via secure push-protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#3A4D39]/20 transition-all border-none">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Deploy Firmware
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl"
                onPointerDownOutside={(e) => e.preventDefault()}
              >
                <div className="bg-[#3A4D39] p-7 text-white relative">
                  <div className="relative z-10">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3 text-white">
                      <UploadCloud className="h-6 w-6" />
                      Fleet Provisioning
                    </DialogTitle>
                    <DialogDescription className="text-[#ECE3CE] text-xs font-semibold mt-1 opacity-80 uppercase tracking-widest">
                      Standardized edge deployment gateway
                    </DialogDescription>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Terminal className="h-20 w-20" />
                  </div>
                </div>

                <div className="p-7 space-y-8 bg-white">
                  {/* File Dropzone */}
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      file
                        ? "border-[#4F6F52] bg-[#4F6F52]/5 translate-y-0"
                        : "border-gray-100 hover:border-[#4F6F52]/30 hover:bg-gray-50/50"
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
                        <div className="bg-[#4F6F52]/10 p-4 rounded-2xl mb-4">
                          <FileCode className="h-7 w-7 text-[#4F6F52]" />
                        </div>
                        <p className="font-black text-base text-[#3A4D39]">
                          Click to select binary or package
                        </p>
                        <p className="text-[11px] text-[#6B6F68] mt-2 text-center font-medium opacity-60 italic">
                          ESP32: .bin, .ino | Linux: .tar.gz, .sh
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-emerald-500 p-4 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
                          <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-black text-lg text-[#4F6F52]">
                          {file.name}
                        </p>
                        <p className="text-[11px] font-bold text-[#6B6F68] mt-1 uppercase tracking-tighter">
                          {(file.size / 1024).toFixed(1)} KB • Payload Staged
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-4 h-9 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Change Payload
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] font-black text-[#6B6F68] uppercase mb-2 block tracking-widest opacity-80">
                          Semantic Version Control
                        </label>
                        <div className="flex gap-2.5 items-center">
                          <span className="text-2xl font-black text-[#3A4D39]">
                            v
                          </span>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={vMajor}
                              onChange={(e) =>
                                setVMajor(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/80 border-none shadow-inner h-12 text-center text-lg font-black text-[#3A4D39] rounded-xl"
                            />
                            <span className="text-[#3A4D39] font-black text-xl">
                              .
                            </span>
                            <Input
                              value={vMinor}
                              onChange={(e) =>
                                setVMinor(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/80 border-none shadow-inner h-12 text-center text-lg font-black text-[#3A4D39] rounded-xl"
                            />
                            <span className="text-[#3A4D39] font-black text-xl">
                              .
                            </span>
                            <Input
                              value={vPatch}
                              onChange={(e) =>
                                setVPatch(
                                  e.target.value.replace(/\D/g, "").slice(0, 3),
                                )
                              }
                              placeholder="0"
                              className="bg-gray-50/80 border-none shadow-inner h-12 text-center text-lg font-black text-[#3A4D39] rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-[#6B6F68] uppercase mb-2 block tracking-widest opacity-80">
                          Target Protocol
                        </label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger className="bg-gray-50/80 border-none shadow-inner h-12 w-full text-sm text-[#3A4D39] font-bold rounded-xl px-4 outline-none ring-0 focus:ring-0">
                            <SelectValue placeholder="Select Target" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-none rounded-2xl shadow-2xl z-[100] p-1">
                            <SelectItem
                              value="esp32"
                              className="text-sm font-bold text-[#3A4D39] cursor-pointer px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-blue-500" />
                                <span>ESP32 Node Controller</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="linux"
                              className="text-sm font-bold text-[#3A4D39] cursor-pointer px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-orange-500" />
                                <span>Linux System Board</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#6B6F68] uppercase block tracking-widest opacity-80">
                        Release Intelligence
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log technical changes for this build..."
                        className="w-full bg-gray-50/80 border-none rounded-2xl p-4 text-xs font-bold shadow-inner resize-none focus:outline-none focus:ring-1 focus:ring-[#4F6F52]/20"
                        rows={5}
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-50">
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl font-bold text-[#6B6F68] hover:bg-gray-100 px-6 h-12"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-black h-12 px-10 rounded-xl shadow-xl shadow-[#3A4D39]/30 transition-all border-none"
                    >
                      {uploading ? (
                        <RefreshCcw className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <UploadCloud className="h-5 w-5 mr-3" />
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
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6F68] opacity-60">
                    Service Heartbeat
                  </CardDescription>
                  <CardTitle className="text-xl font-extrabold text-[#3A4D39]">
                    Protocol Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-emerald-50 p-5 rounded-2xl">
                      <RefreshCcw className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        Standby
                      </h3>
                      <p className="text-xs font-bold text-[#6B6F68] opacity-70">
                        Fleet synchronization gateway active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6F68] opacity-60">
                    Edge Tracking
                  </CardDescription>
                  <CardTitle className="text-xl font-extrabold text-[#3A4D39]">
                    Network Topology
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-blue-50 p-5 rounded-2xl">
                      <Cpu className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3A4D39]">
                        Universal
                      </h3>
                      <p className="text-xs font-bold text-[#6B6F68] opacity-70">
                        Automatic node detection enabled
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
              <CardHeader className="bg-[#3A4D39] text-white p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <History className="h-6 w-6 text-[#ECE3CE]" />
                    <CardTitle className="text-xl font-bold">
                      Update Sequence Logic
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#6B6F68] px-8 py-5">
                        Seq
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#6B6F68] py-5">
                        Operation Vector
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#6B6F68] py-5">
                        Fleet Target
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        step: "01",
                        op: "HTTP Heartbeat Poll",
                        target: "All Active Nodes",
                      },
                      {
                        step: "02",
                        op: "Binary Handshake & Pull",
                        target: "Edge Infrastructure",
                      },
                      {
                        step: "03",
                        op: "Checksum Validation",
                        target: "Local Integrity Check",
                      },
                      {
                        step: "04",
                        op: "Partition Swap / Reboot",
                        target: "System Re-Provisioning",
                      },
                    ].map((item, idx) => (
                      <TableRow
                        key={item.step}
                        className={
                          idx === 3 ? "border-none" : "border-b border-gray-50"
                        }
                      >
                        <TableCell className="px-8 py-5 font-mono font-black text-[#4F6F52] text-sm">
                          {item.step}
                        </TableCell>
                        <TableCell className="font-bold text-[#3A4D39] text-sm">
                          {item.op}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-[#6B6F68] opacity-70">
                          {item.target}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-[#1a1c1e] text-white border-none shadow-2xl overflow-hidden rounded-3xl p-1">
              <CardHeader className="pb-4 border-b border-white/5 mx-5">
                <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                  <ShieldCheck className="h-5 w-5 text-[#4F6F52]" />
                  Protocol Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-7 space-y-5">
                <div className="flex gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-[#4F6F52] mt-1.5 shrink-0 shadow-lg shadow-[#4F6F52]/50" />
                  <p className="text-[11px] font-bold leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors">
                    Nodes poll the sync-point every 60 seconds to detect version
                    variance within the fleet.
                  </p>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-[#4F6F52] mt-1.5 shrink-0 shadow-lg shadow-[#4F6F52]/50" />
                  <p className="text-[11px] font-bold leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors">
                    Firmware checksums verify SHA256 integrity before local
                    extraction or execution.
                  </p>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-[#4F6F52] mt-1.5 shrink-0 shadow-lg shadow-[#4F6F52]/50" />
                  <p className="text-[11px] font-bold leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors">
                    ESP32 modules perform a dual-partition OTA swap for
                    zero-downtime infrastructure updates.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-amber-50/70 border-l-[6px] border-amber-400 rounded-3xl shadow-sm">
              <CardContent className="p-7 flex gap-5">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-[#3A4D39] text-[10px] uppercase tracking-[0.2em]">
                    Safety Lockdown
                  </h4>
                  <p className="text-[11px] text-[#4F6F52] mt-3 font-bold leading-relaxed italic border-l-2 border-[#4F6F52]/20 pl-4">
                    Downgrade Protection enabled. Only incremental semantic
                    builds (v+) trigger node re-provisioning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-[#FFF5E4]/80 rounded-3xl shadow-sm border border-[#ECE3CE]">
              <CardContent className="p-7">
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-3 bg-[#4F6F52]/10 rounded-2xl">
                    <Info className="h-5 w-5 text-[#4F6F52]" />
                  </div>
                  <h4 className="font-black text-[#3A4D39] text-sm tracking-tight">
                    Technical Support
                  </h4>
                </div>
                <p className="text-[11px] font-bold text-[#6B6F68] leading-relaxed opacity-80">
                  For mass provisioning failures or fleet-wide connectivity
                  issues, contact the system architects. View real-time machine
                  logs in the{" "}
                  <span className="text-[#4F6F52] underline underline-offset-4 decoration-2">
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
