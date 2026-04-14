//Backups Page
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/pagewrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Database,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  HardDrive,
  FileCode,
  ShieldCheck,
  Zap,
  History,
  Cloud,
  Server,
  AlertTriangle,
  ArrowDownToLine,
  Activity,
  CheckCircle2,
  Search,
  Lock,
  ArrowRight,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await Requests({ url: "/backup/list", method: "GET" });
      if (response.data?.success) {
        setBackups(response.data.backups || []);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
      toast.error("Failed to sync with backup registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    const id = toast.loading("Initializing secure database snapshot...");
    try {
      const response = await Requests({
        url: "/backup/create",
        method: "POST",
      });
      if (response.data?.success) {
        toast.success("Snapshot created and encrypted successfully", { id });
        fetchBackups();
      } else {
        toast.error(response.data?.message || "Failed to create backup", {
          id,
        });
      }
    } catch {
      toast.error("An error occurred during backup creation", { id });
    } finally {
      setCreating(false);
    }
  };

  const handleCleanBackups = async () => {
    if (!confirm("Retention Policy: Keep only the 50 most recent snapshots?"))
      return;

    setCleaning(true);
    try {
      const response = await Requests({ url: "/backup/clean", method: "POST" });
      if (response.data?.success) {
        toast.success(
          `Retention applied. Removed ${response.data.deleted} old records.`,
        );
        fetchBackups();
      }
    } catch {
      toast.error("Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  const handleDownloadBackup = (backup) => {
    if (backup.source === "supabase" && backup.url) {
      window.open(backup.url, "_blank");
      toast.success(
        `Starting secure download from Cloud for ${backup.filename}`,
      );
      return;
    }

    const rawUrl =
      import.meta.env.VITE_API_URL ||
      "https://nutribin-server-backend-production.up.railway.app";
    const baseUrl = (
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`
    ).replace(/\/$/, "");

    const downloadUrl = `${baseUrl}/backup/download/${backup.filename}`;
    window.open(downloadUrl, "_blank");
    toast.success(`Starting secure download for ${backup.filename}`);
  };

  const handleExportSnapshot = () => {
    const rawUrl =
      import.meta.env.VITE_API_URL ||
      "https://nutribin-server-backend-production.up.railway.app";
    const baseUrl = (
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`
    ).replace(/\/$/, "");

    const exportUrl = `${baseUrl}/management/export/snapshot`;
    window.open(exportUrl, "_blank");
    toast.info("Generating live snapshot for local save...");
  };

  const formatDate = (dateString, relative = false) => {
    const date = new Date(dateString);
    if (relative) {
      const diff = Date.now() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
    return date.toLocaleString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBackups = backups.filter((b) =>
    b.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full bg-[#ECE3CE]/20 min-h-screen pb-20 font-sans">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#3A4D39] text-white py-20 px-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#4F6F52] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#4F6F52] rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-center gap-10"
          >
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F6F52]/30 text-[#ECE3CE] border border-[#4F6F52] mb-6 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">
                  NutriBin Infrastructure Registry
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                Backup & <span className="text-[#A9B388]">Recovery</span>
              </h1>
              <p className="text-xl text-[#ECE3CE]/80 max-w-2xl leading-relaxed font-medium">
                Centralized command for database snapshots. Monitor registry
                health, initialize secure exports, and manage system restoration
                points.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Button
                onClick={handleExportSnapshot}
                variant="outline"
                className="bg-white/5 border-2 border-white/20 hover:bg-white/10 text-white px-8 py-7 rounded-2xl font-black text-lg backdrop-blur-md transition-all"
              >
                <ArrowDownToLine className="mr-2 h-6 w-6" />
                Raw SQL Export
              </Button>
              <Button
                onClick={handleCreateBackup}
                disabled={creating}
                className="bg-[#A9B388] hover:bg-[#8F9B74] text-[#3A4D39] px-8 py-7 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                {creating ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-6 w-6" />
                )}
                Initialize Snapshot
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 -mt-10 max-w-7xl mx-auto relative z-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              label: "Registry Status",
              value: "Operational",
              sub: "Provider: Supabase",
              icon: Database,
              bg: "bg-white",
              text: "text-[#3A4D39]",
              iconColor: "text-blue-500",
            },
            {
              label: "Snapshot Health",
              value: "Optimal",
              sub: `${backups.length} Encrypted Files`,
              icon: ShieldCheck,
              bg: "bg-white",
              text: "text-[#3A4D39]",
              iconColor: "text-green-500",
            },
            {
              label: "Last Recovery Point",
              value:
                backups.length > 0
                  ? formatDate(backups[0].created, true)
                  : "None",
              sub: "Live Mirror Active",
              icon: History,
              bg: "bg-white",
              text: "text-[#3A4D39]",
              iconColor: "text-[#4F6F52]",
            },
            {
              label: "Storage Load",
              value: `${Math.round((backups.length / 50) * 100)}%`,
              sub: "Retention: 50/50",
              icon: Activity,
              bg: "bg-[#3A4D39]",
              text: "text-white",
              iconColor: "text-[#A9B388]",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${stat.bg} ${stat.text} p-6 rounded-3xl shadow-xl border border-gray-100/50 flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.bg === "bg-white" ? "bg-[#ECE3CE]/30" : "bg-white/10"}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                {idx === 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-green-500/10 text-green-600 rounded-lg">
                    Live
                  </span>
                )}
              </div>
              <p
                className={`text-xs font-black uppercase tracking-widest mb-1 ${stat.bg === "bg-white" ? "text-gray-400" : "text-[#ECE3CE]/60"}`}
              >
                {stat.label}
              </p>
              <h3 className="text-3xl font-black mb-1 leading-none">
                {stat.value}
              </h3>
              <p
                className={`text-xs font-bold ${stat.bg === "bg-white" ? "text-gray-500" : "text-[#ECE3CE]/40"}`}
              >
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 mb-20">
          {/* Main Registry Table */}
          <div className="lg:w-3/4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#4F6F52] text-white rounded-2xl shadow-lg">
                  <Server className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black text-[#3A4D39]">
                  Snapshot Registry
                </h2>
              </div>

              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-md border border-gray-100">
                <div className="relative group flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
                  <input
                    placeholder="Search snapshots..."
                    className="w-full bg-transparent border-none pl-11 pr-4 py-2 text-sm font-bold focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="h-8 w-px bg-gray-100"></div>
                <Button
                  onClick={handleCleanBackups}
                  disabled={cleaning || backups.length <= 50}
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  <Trash2 size={16} className="mr-2" />
                  Cleanup
                </Button>
              </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-none">
                        <TableHead className="px-8 py-5 font-black text-[#3A4D39] uppercase text-[10px] tracking-widest">
                          Manifest ID
                        </TableHead>
                        <TableHead className="font-black text-[#3A4D39] uppercase text-[10px] tracking-widest">
                          Origin
                        </TableHead>
                        <TableHead className="text-center font-black text-[#3A4D39] uppercase text-[10px] tracking-widest">
                          Payload
                        </TableHead>
                        <TableHead className="text-right px-8 font-black text-[#3A4D39] uppercase text-[10px] tracking-widest">
                          Operations
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow
                              key={i}
                              className="animate-pulse h-20 border-gray-50"
                            >
                              <TableCell
                                colSpan={4}
                                className="bg-gray-50/30"
                              />
                            </TableRow>
                          ))
                        ) : filteredBackups.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-64 text-center">
                              <div className="flex flex-col items-center justify-center gap-4 py-10">
                                <FileCode className="h-16 w-16 text-[#ECE3CE]" />
                                <p className="text-[#A9B388] text-xl font-black">
                                  No snapshots found.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBackups.map((backup, idx) => (
                            <motion.tr
                              key={backup.filename}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group hover:bg-[#ECE3CE]/10 transition-colors border-gray-50"
                            >
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#4F6F52] group-hover:text-white transition-all duration-300">
                                    <FileCode size={24} />
                                  </div>
                                  <div>
                                    <p className="font-black text-[#3A4D39] text-[15px] mb-0.5">
                                      {backup.filename}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      <Zap className="h-3 w-3 text-[#A9B388]" />
                                      {formatDate(backup.created)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {backup.source === "supabase" ? (
                                  <div className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-wider bg-blue-50 w-fit px-3 py-1 rounded-full">
                                    <Cloud className="h-3.5 w-3.5" /> Supabase
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-[#4F6F52] font-black text-[11px] uppercase tracking-wider bg-[#ECE3CE]/40 w-fit px-3 py-1 rounded-full">
                                    <Server className="h-3.5 w-3.5" /> Local
                                    Node
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs font-black text-[#4F6F52]">
                                {backup.sizeFormatted || "---"}
                              </TableCell>
                              <TableCell className="px-8 text-right">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDownloadBackup(backup)}
                                  className="h-10 w-10 p-0 rounded-xl hover:bg-[#4F6F52] hover:text-white transition-all"
                                >
                                  <Download className="h-5 w-5" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Protocols */}
          <div className="lg:w-1/4">
            <div className="sticky top-10 space-y-8">
              {/* Retention Policy Card */}
              <div className="bg-[#3A4D39] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[#4F6F52] rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
                  <Activity className="h-6 w-6 text-[#A9B388]" />
                  Retention
                </h3>
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase mb-2">
                      <span className="text-[#ECE3CE]/60">
                        Registry Storage
                      </span>
                      <span>{backups.length}/50</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(backups.length / 50) * 100}%` }}
                        className="h-full bg-[#A9B388] rounded-full"
                      />
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Daily recursive mirror",
                      "Cloud redundancy enabled",
                      "Automated storage cleanup",
                      "Snapshots encrypted (AES-256)",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm font-bold items-center"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#A9B388]" />
                        <span className="text-[#ECE3CE]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Protocol Warning */}
              <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6" />
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Recovery Protocol
                  </h3>
                </div>
                <p className="font-bold text-sm text-white/90 leading-relaxed mb-6">
                  One-click restoration is disabled by design. For
                  system-critical rollback, initiate the binary injection
                  protocol via the secure shell.
                </p>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                  <p className="text-[10px] font-black uppercase text-white/60 mb-1">
                    Authorization ID
                  </p>
                  <p className="font-mono font-black text-xs">
                    NB-RECOV-50-SAFE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer link back */}
      <div className="mt-20 text-center">
        <p className="text-[#739072] font-black flex items-center justify-center gap-2">
          NutriBin Recovery Infrastructure <ArrowRight className="h-4 w-4" />
          <span className="text-[#3A4D39]">Registry v4.2.0</span>
        </p>
      </div>
    </div>
  );
}
