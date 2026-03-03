import { useState, useEffect } from "react";
import {
  Bell,
  Trash2,
  CheckCircle,
  Clock,
  Cpu,
  RefreshCw,
  Plus,
  ArrowRight,
  Filter,
  Search,
  AlertTriangle,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Requests from "@/utils/Requests";
import ConfirmBox from "@/components/partials/confirmBox";

export default function MachineNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [confirm, setConfirm] = useState({
    show: false,
    id: null,
    loading: false,
  });

  // Create notification form state
  const [formData, setFormData] = useState({
    header: "",
    subheader: "",
    description: "",
    type: "info",
    selectedMachines: [],
    selectAll: false,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notifRes, machinesRes] = await Promise.all([
        Requests({ url: "/management/machine-notifications" }),
        Requests({ url: "/management/machines" }),
      ]);
      if (notifRes?.data?.ok) {
        setNotifications(notifRes.data.notifications);
      }
      if (machinesRes?.data?.ok) {
        setMachines(machinesRes.data.machines || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      toast.error("Failed to load machine notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResolve = async (id, currentStatus) => {
    try {
      const res = await Requests({
        url: `/management/machine-notifications/${id}/resolve`,
        method: "PATCH",
        data: { resolved: !currentStatus },
      });
      if (res?.data?.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === id ? { ...n, resolved: !currentStatus } : n,
          ),
        );
        toast.success(
          `Notification marked as ${!currentStatus ? "resolved" : "unresolved"}`,
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification");
    }
  };

  const handleDelete = (id) => {
    setConfirm({ show: true, id, loading: false });
  };

  const performDelete = async () => {
    if (!confirm.id) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      const res = await Requests({
        url: `/management/machine-notifications/${confirm.id}`,
        method: "DELETE",
      });
      if (res?.data?.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== confirm.id),
        );
        toast.success("Notification deleted");
      }
      setConfirm({ show: false, id: null, loading: false });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  const getTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case "error":
      case "critical":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          accent: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          accent: "bg-amber-500",
        };
      case "success":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-100",
          icon: <CheckCircle className="h-4 w-4" />,
          accent: "bg-emerald-500",
        };
      default:
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-100",
          icon: <Bell className="h-4 w-4" />,
          accent: "bg-blue-500",
        };
    }
  };

  const handleSelectAllChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      selectAll: checked,
      selectedMachines: checked ? machines.map((m) => m.machine_id) : [],
    }));
  };

  const handleMachineToggle = (machineId) => {
    setFormData((prev) => {
      const selected = prev.selectedMachines.includes(machineId)
        ? prev.selectedMachines.filter((id) => id !== machineId)
        : [...prev.selectedMachines, machineId];

      return {
        ...prev,
        selectedMachines: selected,
        selectAll: selected.length === machines.length,
      };
    });
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();

    if (!formData.header.trim()) {
      toast.error("Header is required");
      return;
    }

    if (formData.selectedMachines.length === 0) {
      toast.error("Please select at least one machine");
      return;
    }

    setCreating(true);
    try {
      const promises = formData.selectedMachines.map((machineId) =>
        Requests({
          url: "/management/machine-notifications",
          method: "POST",
          data: {
            machine_id: machineId,
            header: formData.header,
            subheader: formData.subheader,
            description: formData.description,
            type: formData.type,
          },
        }),
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res?.data?.ok);

      if (allSuccess) {
        toast.success(
          `Broadcast sent to ${formData.selectedMachines.length} machine(s)`,
        );
        setFormData({
          header: "",
          subheader: "",
          description: "",
          type: "info",
          selectedMachines: [],
          selectAll: false,
        });
        await fetchNotifications();
      } else {
        toast.error("Failed to deliver some notifications");
      }
    } catch (err) {
      console.error("Error creating notification:", err);
      toast.error("Failed to dispatch system alerts");
    } finally {
      setCreating(false);
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.machine_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase tracking-widest">
              <Bell className="w-4 h-4" />
              Machine Intel
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Alert <span className="text-[#4F6F52]">Broadcast</span>
            </h1>
            <p className="text-gray-400 font-medium">
              Synchronize system status and critical logs across the fleet.
            </p>
          </div>

          <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
            <div className="flex flex-col px-4 border-r border-gray-50 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Active
              </span>
              <span className="text-lg font-black text-[#4F6F52]">
                {notifications.filter((n) => !n.resolved).length}
              </span>
            </div>
            <div className="flex flex-col px-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Total
              </span>
              <span className="text-lg font-black text-gray-800">
                {notifications.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Broadcast Form */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-[#4F6F52]/5 bg-white overflow-hidden">
              <div className="bg-[#4F6F52] p-8 text-white">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">
                    New Alert
                  </h2>
                </div>
                <p className="text-white/60 text-sm font-medium">
                  Dispatch a system-wide or targeted notification.
                </p>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleCreateNotification} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Header Topic
                      </label>
                      <Input
                        value={formData.header}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            header: e.target.value,
                          }))
                        }
                        placeholder="e.g., Firmware Update Required"
                        className="h-12 bg-[#FAF9F6] border-none rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-[#4F6F52]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Subheader Context
                      </label>
                      <Input
                        value={formData.subheader}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subheader: e.target.value,
                          }))
                        }
                        placeholder="e.g., Critical Patch 2.4.1"
                        className="h-12 bg-[#FAF9F6] border-none rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-[#4F6F52]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Severity Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["info", "success", "warning", "error"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, type: t }))
                            }
                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                              formData.type === t
                                ? "bg-[#4F6F52] text-white border-[#4F6F52] shadow-lg shadow-[#4F6F52]/20 scale-[1.05]"
                                : "bg-[#FAF9F6] text-gray-400 border-transparent hover:border-gray-200"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Dispatch Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Detail the alert requirements..."
                        rows="4"
                        className="w-full p-4 bg-[#FAF9F6] border-none rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/50 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Target Fleet
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllChange(!formData.selectAll)
                        }
                        className="text-[10px] font-black text-[#4F6F52] hover:underline"
                      >
                        {formData.selectAll ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {machines.map((machine) => (
                        <button
                          key={machine.machine_id}
                          type="button"
                          onClick={() =>
                            handleMachineToggle(machine.machine_id)
                          }
                          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                            formData.selectedMachines.includes(
                              machine.machine_id,
                            )
                              ? "bg-[#4F6F52]/5 border-[#4F6F52]/30"
                              : "bg-[#FAF9F6] border-transparent hover:bg-gray-100"
                          }`}
                        >
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-bold text-[#1A1A1A] truncate">
                              {machine.machine_name || "Nexus Unit"}
                            </p>
                            <p className="text-[9px] font-mono text-gray-400">
                              {machine.machine_id.slice(0, 8)}...
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all ${
                              formData.selectedMachines.includes(
                                machine.machine_id,
                              )
                                ? "bg-[#4F6F52] border-[#4F6F52]"
                                : "bg-white border-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      creating || formData.selectedMachines.length === 0
                    }
                    className="w-full h-14 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-[#4F6F52]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {creating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Deploy Broadcast
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Activity Feed */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search alerts, status, or units..."
                  className="pl-12 h-14 bg-[#FAF9F6] border-none rounded-2xl text-base font-medium placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/50"
                />
              </div>

              <div className="flex gap-2 p-2 bg-[#FAF9F6] rounded-2xl shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#4F6F52] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === "list"
                      ? "bg-white text-[#4F6F52] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={fetchNotifications}
                className="h-14 px-6 border-none bg-[#FAF9F6] hover:bg-gray-100 rounded-2xl text-[#4F6F52] font-bold"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 xl:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#4F6F52]/20 border-t-[#4F6F52] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-[#4F6F52] uppercase tracking-[0.3em]">
                      Decoding Logs
                    </p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <Bell className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                      Zero Anomalies Detected
                    </p>
                  </motion.div>
                ) : (
                  filteredNotifications.map((n, idx) => {
                    const styles = getTypeStyles(n.type);
                    return (
                      <motion.div
                        key={n.notification_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group relative bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-[#4F6F52]/5 hover:border-[#4F6F52]/20 transition-all flex flex-col ${
                          n.resolved ? "opacity-60 grayscale-[0.5]" : ""
                        }`}
                      >
                        {/* Status Accent Plate */}
                        <div
                          className={`absolute top-0 left-8 w-12 h-1 rounded-b-full ${styles.accent}`}
                        />

                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${styles.bg} ${styles.text}`}
                          >
                            {styles.icon}
                            {n.type}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleResolve(n.notification_id, n.resolved)
                              }
                              className={`p-2 rounded-xl transition-all ${
                                n.resolved
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-emerald-50 text-emerald-600 hover:scale-110"
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(n.notification_id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <h3
                            className={`text-lg font-black tracking-tight ${
                              n.resolved
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {n.header}
                          </h3>
                          {n.subheader && (
                            <p className="text-[#4F6F52] text-xs font-bold uppercase tracking-wider">
                              {n.subheader}
                            </p>
                          )}
                          <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">
                            {n.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Cpu className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {n.machine_id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">
                              {new Date(n.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {confirm.show && (
          <ConfirmBox
            mode="reject"
            title="Purge Intel Record"
            description="Are you sure you want to permanently delete this system alert? This action cannot be rescinded."
            confirm={performDelete}
            cancel={() => setConfirm({ show: false, id: null, loading: false })}
            loading={confirm.loading}
          />
        )}
      </section>
    </div>
  );
}
