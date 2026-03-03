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
  X,
  User,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Requests from "@/utils/Requests";
import ConfirmBox from "@/components/partials/confirmBox";

export default function MachineNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetType, setTargetType] = useState("machine"); // 'machine' or 'user'
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [itemsPerRow, setItemsPerRow] = useState(2); // 1, 2, 3, or 4
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
    selectedTargets: [],
    selectAll: false,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notifRes, machinesRes, usersRes] = await Promise.all([
        Requests({ url: "/management/machine-notifications" }),
        Requests({ url: "/management/machines" }),
        Requests({ url: "/management/users" }),
      ]);
      if (notifRes?.data?.ok) {
        setNotifications(notifRes.data.notifications);
      }
      if (machinesRes?.data?.ok) {
        setMachines(machinesRes.data.machines || []);
      }
      if (usersRes?.data?.ok) {
        setUsers(usersRes.data.users || []);
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

  const currentTargets =
    targetType === "machine"
      ? machines.reduce((acc, machine) => {
          // De-duplicate machines - only keep first occurrence of each machine_id
          if (!acc.find((m) => m.machine_id === machine.machine_id)) {
            acc.push(machine);
          }
          return acc;
        }, [])
      : users.flatMap((user) => {
          // Find all machines assigned to this user
          const userMachines = machines.filter(
            (m) => m.user_id === user.customer_id,
          );
          // If user has machines, create an entry for each
          // If no machines, create one entry with null machine_id
          return userMachines.length > 0
            ? userMachines.map((machine) => ({
                ...user,
                machine_id: machine.machine_id,
              }))
            : [{ ...user, machine_id: null }];
        });

  const handleSelectAllChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      selectAll: checked,
      selectedTargets: checked
        ? currentTargets.map((t) =>
            targetType === "machine"
              ? t.machine_id
              : `${t.customer_id}-${t.machine_id || "none"}`,
          )
        : [],
    }));
  };

  const handleTargetToggle = (targetId) => {
    setFormData((prev) => {
      const selected = prev.selectedTargets.includes(targetId)
        ? prev.selectedTargets.filter((id) => id !== targetId)
        : [...prev.selectedTargets, targetId];

      return {
        ...prev,
        selectedTargets: selected,
        selectAll: selected.length === currentTargets.length,
      };
    });
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();

    if (!formData.header.trim()) {
      toast.error("Header is required");
      return;
    }

    if (formData.selectedTargets.length === 0) {
      toast.error(`Please select at least one ${targetType}`);
      return;
    }

    setCreating(true);
    try {
      // Extract actual IDs and deduplicate
      const actualIds = formData.selectedTargets
        .map((targetId) => {
          if (targetType === "user") {
            const target = currentTargets.find(
              (t) => `${t.customer_id}-${t.machine_id || "none"}` === targetId,
            );
            return target?.customer_id || targetId.split("-")[0];
          }
          return targetId;
        })
        .filter((id, idx, arr) => arr.indexOf(id) === idx); // Deduplicate

      const promises = actualIds.map((actualId) =>
        Requests({
          url:
            targetType === "machine"
              ? "/management/machine-notifications"
              : "/management/user-notifications",
          method: "POST",
          data: {
            [targetType === "machine" ? "machine_id" : "customer_id"]: actualId,
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
        toast.success(`Broadcast sent to ${actualIds.length} ${targetType}(s)`);
        setFormData({
          header: "",
          subheader: "",
          description: "",
          type: "info",
          selectedTargets: [],
          selectAll: false,
        });
        await fetchNotifications();
        setIsModalOpen(false);
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

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-12 px-6 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#4F6F52]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              New Alert
            </Button>

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
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-7xl p-0 overflow-hidden border-none rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-col md:flex-row h-full md:min-h-[500px]">
              {/* Sidebar Branding */}
              <div className="w-full md:w-72 bg-[#4F6F52] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white mb-2">
                    Create Alert
                  </DialogTitle>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    Dispatch critical system logs or updates to specific units
                    across your fleet.
                  </p>
                </div>

                <div className="relative z-10 space-y-4 pt-8 border-t border-white/10 mt-8 md:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Live Dispatcher
                    </span>
                  </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>

              {/* Form Content */}
              <div className="flex-1 p-8 bg-white lg:p-10">
                <form onSubmit={handleCreateNotification} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Input Side */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                          Core Intel
                        </label>
                        <div className="space-y-4">
                          <Input
                            value={formData.header}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                header: e.target.value,
                              }))
                            }
                            placeholder="Primary Alert Header..."
                            className="h-12 bg-[#FAF9F6] border-none rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 transition-all px-5"
                          />
                          <Input
                            value={formData.subheader}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                subheader: e.target.value,
                              }))
                            }
                            placeholder="Context / Subheader..."
                            className="h-12 bg-[#FAF9F6] border-none rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 transition-all px-5"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                          Priority
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {["info", "success", "warning", "error"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, type: t }))
                              }
                              className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                formData.type === t
                                  ? "bg-[#4F6F52] text-white border-[#4F6F52] shadow-lg shadow-[#4F6F52]/20"
                                  : "bg-[#FAF9F6] text-gray-400 border-transparent hover:bg-gray-100"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                          Detailed Logs
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Compose the full system alert description here..."
                          rows="3"
                          className="w-full p-5 bg-[#FAF9F6] border-none rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 transition-all text-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* Machine Selector Side */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                            Target Fleet
                          </label>
                          <div className="flex bg-[#FAF9F6] p-1 rounded-xl border border-gray-100 shadow-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetType("machine");
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedTargets: [],
                                  selectAll: false,
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${
                                targetType === "machine"
                                  ? "bg-white text-[#4F6F52] shadow-sm"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              <Cpu className="w-3 h-3" />
                              Machines
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetType("user");
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedTargets: [],
                                  selectAll: false,
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${
                                targetType === "user"
                                  ? "bg-white text-[#4F6F52] shadow-sm"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              <Users className="w-3 h-3" />
                              Users
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectAllChange(!formData.selectAll)
                          }
                          className="text-[10px] font-black text-[#4F6F52] hover:bg-[#4F6F52]/5 px-3 py-1 rounded-lg transition-colors uppercase tracking-widest"
                        >
                          {formData.selectAll ? "Purge All" : "Deploy All"}
                        </button>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto pr-3 space-y-3 custom-scrollbar">
                        {currentTargets.length > 0 ? (
                          currentTargets.map((target) => {
                            const isUser = targetType === "user";
                            // For users, create unique ID combining customer_id and machine_id
                            // For machines, just use machine_id
                            const targetId = isUser
                              ? `${target.customer_id}-${target.machine_id || "none"}`
                              : target.machine_id;

                            let headerText, secondaryText;

                            if (isUser) {
                              headerText = `${target.first_name} ${target.last_name}`;
                              secondaryText =
                                target.machine_id || "No Machine Assigned";
                            } else {
                              headerText = target.machine_id;
                              secondaryText =
                                target.first_name && target.last_name
                                  ? `${target.first_name} ${target.last_name}`
                                  : "No Owner";
                            }

                            return (
                              <button
                                key={targetId}
                                type="button"
                                onClick={() => handleTargetToggle(targetId)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                                  formData.selectedTargets.includes(targetId)
                                    ? "bg-[#4F6F52]/5 border-[#4F6F52] shadow-inner"
                                    : "bg-[#FAF9F6] border-transparent hover:border-[#4F6F52]/10"
                                }`}
                              >
                                <div className="text-left overflow-hidden">
                                  <p className="text-sm font-black text-[#1A1A1A] truncate">
                                    {headerText}
                                  </p>
                                  <p className="text-[10px] font-mono font-bold text-[#4F6F52]/50 tracking-tighter">
                                    {secondaryText}
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    formData.selectedTargets.includes(targetId)
                                      ? "bg-[#4F6F52] border-[#4F6F52] rotate-0"
                                      : "bg-white border-gray-200 rotate-90"
                                  }`}
                                >
                                  {formData.selectedTargets.includes(
                                    targetId,
                                  ) && (
                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <p className="text-[10px] font-bold uppercase">
                              {targetType === "user"
                                ? "No Users Available"
                                : "No Machines Available"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Targets:{" "}
                      <span className="text-[#4F6F52]">
                        {formData.selectedTargets.length}
                      </span>{" "}
                      Units Managed
                    </p>
                    <Button
                      type="submit"
                      disabled={
                        creating || formData.selectedTargets.length === 0
                      }
                      className="w-full sm:w-auto px-10 h-14 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-[#4F6F52]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                    >
                      {creating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Dispatch Alert
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {/* Activity Feed */}
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

            {viewMode === "grid" && (
              <div className="flex items-center gap-2 bg-[#FAF9F6] p-2 rounded-2xl border border-gray-100 shadow-sm">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Per Row
                </label>
                <select
                  value={itemsPerRow}
                  onChange={(e) => setItemsPerRow(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 cursor-pointer"
                >
                  <option value={1}>1 Col</option>
                  <option value={2}>2 Col</option>
                  <option value={3}>3 Col</option>
                  <option value={4}>4 Col</option>
                </select>
              </div>
            )}
          </div>

          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? itemsPerRow === 1
                  ? "grid-cols-1"
                  : itemsPerRow === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : itemsPerRow === 3
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Cpu className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {n.machine_id}
                            </span>
                          </div>
                          {machines.find((m) => m.machine_id === n.machine_id)
                            ?.first_name && (
                            <span className="text-[10px] font-bold text-gray-500">
                              {
                                machines.find(
                                  (m) => m.machine_id === n.machine_id,
                                )?.first_name
                              }{" "}
                              {
                                machines.find(
                                  (m) => m.machine_id === n.machine_id,
                                )?.last_name
                              }
                            </span>
                          )}
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
