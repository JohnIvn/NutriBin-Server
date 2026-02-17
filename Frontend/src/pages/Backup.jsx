import { useState, useEffect } from "react";
import PageWrapper from "@/components/ui/pagewrapper";
import PageHeader from "@/components/ui/pageheader";
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
  Clock,
  HardDrive,
  FileCode,
  ShieldCheck,
  Calendar,
  Zap,
  History,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await Requests({ url: "/backup/list", method: "GET" });
      if (response.data?.success) {
        setBackups(response.data.backups || []);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
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
    if (!confirm("Retention Policy: Keep only the 10 most recent snapshots?"))
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

    // Determine backend URL (matches the logic in Requests.jsx)
    const rawUrl =
      import.meta.env.VITE_API_URL ||
      "https://nutribin-server-backend-production.up.railway.app";
    const baseUrl =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

    const downloadUrl = `${baseUrl}/backup/download/${backup.filename}`;
    window.open(downloadUrl, "_blank");
    toast.success(`Starting secure download for ${backup.filename}`);
  };

  const handleExportSnapshot = () => {
    // Determine backend URL (matches the logic in Requests.jsx)
    const rawUrl =
      import.meta.env.VITE_API_URL ||
      "https://nutribin-server-backend-production.up.railway.app";
    const baseUrl =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

    const exportUrl = `${baseUrl}/management/export/snapshot`;
    window.open(exportUrl, "_blank");
    toast.info("Generating live snapshot for local save...");
  };

  const formatDate = (dateString, relative = false) => {
    const date = new Date(dateString);
    if (relative) {
      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return "Just now";
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

  return (
    <PageWrapper>
      <PageHeader
        title="Backup & Recovery"
        icon={<Database className="size-10 text-[#4F6F52]" />}
      />

      <div className="space-y-8 pb-12">
        {/* Quick Actions & Header Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 bg-green-50 px-3 py-1"
              >
                <ShieldCheck size={14} className="mr-1.5" />
                Data Integrity: High
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700 bg-blue-50 px-3 py-1"
              >
                <Calendar size={14} className="mr-1.5" />
                Retention: 10 Days
              </Badge>
            </div>
            <p className="text-gray-500 text-sm">
              Manage failover recovery points and historical snapshots for the
              NutriBin core database.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button
              onClick={fetchBackups}
              variant="outline"
              className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button
              onClick={handleExportSnapshot}
              variant="outline"
              className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/10"
            >
              <Download size={18} className="mr-2" />
              Download Local SQL
            </Button>
            <Button
              onClick={handleCreateBackup}
              disabled={creating}
              className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white flex-1 lg:flex-none shadow-sm shadow-[#4F6F52]/20"
            >
              <Plus size={18} className="mr-2" />
              {creating ? "Processing..." : "Create Snapshot"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none bg-white shadow-sm ring-1 ring-black/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Database size={20} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-[#3A4D39]">
                  Connected
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase text-gray-400 mt-1">
                  Provider: Supabase
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-black/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#4F6F52]/10 text-[#4F6F52] rounded-lg">
                  <History size={20} />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-[#3A4D39]">
                  {backups.length > 0
                    ? formatDate(backups[0].created, true)
                    : "N/A"}
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase text-gray-400 mt-1">
                  Last Successful Backup
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-black/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Zap size={20} />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-[#3A4D39]">
                  Enabled
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase text-gray-400 mt-1">
                  Auto-Scheduler: On
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-black/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <HardDrive size={20} />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-[#3A4D39]">
                  {backups.length} Records
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase text-gray-400 mt-1">
                  Server Snapshots
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-none bg-white shadow-md ring-1 ring-black/[0.03] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-[#FDFDFD] border-b border-gray-100 px-8 py-6">
            <div>
              <CardTitle className="text-[#3A4D39] text-xl font-bold">
                Snapshot Records
              </CardTitle>
              <CardDescription className="mt-1">
                Downloadable SQL dumps of your entire application database.
              </CardDescription>
            </div>
            <Button
              onClick={handleCleanBackups}
              disabled={cleaning || backups.length <= 10}
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-4"
            >
              <Trash2 size={16} className="mr-2" />
              Retain Latest 10
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FAF9F6]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-8 py-4 font-bold text-[#3A4D39] uppercase text-[10px] tracking-widest">
                      Snapshot Manifest
                    </TableHead>
                    <TableHead className="text-center font-bold text-[#3A4D39] uppercase text-[10px] tracking-widest">
                      Payload Size
                    </TableHead>
                    <TableHead className="text-center font-bold text-[#3A4D39] uppercase text-[10px] tracking-widest">
                      System Timestamp
                    </TableHead>
                    <TableHead className="px-8 text-right font-bold text-[#3A4D39] uppercase text-[10px] tracking-widest">
                      Management
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell
                          colSpan={4}
                          className="h-16 animate-pulse bg-gray-50/50"
                        ></TableCell>
                      </TableRow>
                    ))
                  ) : backups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-20 text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <FileCode size={40} className="text-gray-200" />
                          <p className="font-medium">
                            No system snapshots found in registry.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    backups.map((backup) => (
                      <TableRow
                        key={backup.filename}
                        className="hover:bg-gray-50/80 transition-colors group"
                      >
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 text-gray-400 rounded-md group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52] transition-colors">
                              <FileCode size={18} />
                            </div>
                            <span className="font-semibold text-gray-700">
                              {backup.filename}
                            </span>
                            {backup.source === "supabase" && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] h-4 px-1"
                              >
                                Cloud
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] bg-gray-50 border-gray-200"
                          >
                            {backup.sizeFormatted}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-gray-500">
                          {formatDate(backup.created)}
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadBackup(backup)}
                            className="bg-transparent text-gray-500 hover:text-[#4F6F52] hover:bg-[#4F6F52]/10 border-none shadow-none font-bold text-xs"
                          >
                            <Download size={16} className="mr-2" />
                            Secure Get
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Restore Disclaimer */}
        <div className="bg-[#FAF9F6] border border-[#ECE3CE] rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-[#ECE3CE]/30 rounded-full text-[#4F6F52]">
            <ShieldCheck size={32} />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-lg font-extrabold text-[#3A4D39]">
              Recovery Protocol Notice
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              For security and data consistency, direct restoration through this
              UI is disabled. Restoring a system requires authorized terminal
              access and script execution. Please contact the{" "}
              <strong>IT Infrastructure Team</strong> or use the{" "}
              <code>npm run backup:restore</code> script manually from the
              server cluster.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-500 pointer-events-none opacity-50 font-bold uppercase text-[10px] tracking-widest px-6 h-12"
          >
            Restore Disabled
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Backup;
