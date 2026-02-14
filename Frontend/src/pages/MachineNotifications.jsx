import { useState, useEffect } from "react";
import {
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Requests from "@/utils/Requests";
import ConfirmBox from "@/components/partials/confirmBox";

export default function MachineNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "error":
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
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
      // Create notification for each selected machine
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
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res?.data?.ok);

      if (allSuccess) {
        toast.success(
          `Notification created for ${formData.selectedMachines.length} machine(s)`
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
        toast.error("Failed to create some notifications");
      }
    } catch (err) {
      console.error("Error creating notification:", err);
      toast.error("Failed to create notification");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#ECE3CE]/10 via-white to-[#ECE3CE]/5 h-screen flex flex-col overflow-hidden">
      <section className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 h-full flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] rounded-2xl shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#3A4D39] tracking-tight leading-tight">
                Machine Notifications
              </h1>
              <p className="text-xs text-[#6B6F68] font-medium">
                System alerts and hardware logs • {notifications.length} total
              </p>
            </div>
          </div>

          <Button
            onClick={fetchNotifications}
            variant="outline"
            size="sm"
            className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/10 transition-all rounded-xl h-10 px-4"
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Side: Create Notification Form */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <Card className="border-2 border-[#4F6F52]/20 bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="bg-gradient-to-r from-[#4F6F52]/10 to-transparent border-b border-[#4F6F52]/10 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4F6F52]/10 rounded-lg">
                    <Plus className="h-5 w-5 text-[#4F6F52]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#3A4D39]">Create Notification</CardTitle>
                    <CardDescription className="text-xs">Send alerts to target machines</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                <form onSubmit={handleCreateNotification} className="flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0 overflow-hidden">
                    {/* Form Fields - Left Column */}
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                      <h3 className="text-base font-bold text-[#3A4D39] border-b border-gray-100 pb-2 mb-4 shrink-0">
                        Details
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-5 pr-3 custom-scrollbar">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                            Header <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.header}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, header: e.target.value }))
                            }
                            placeholder="e.g., Temperature Alert"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                            Subheader
                          </label>
                          <input
                            type="text"
                            value={formData.subheader}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, subheader: e.target.value }))
                            }
                            placeholder="e.g., Unit 01 Overheating"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                            Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Detailed message..."
                            rows="4"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all resize-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                            Type
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, type: e.target.value }))
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all bg-white text-sm"
                          >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Target Machines Section - Right Column */}
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4 shrink-0">
                        <h3 className="text-base font-bold text-[#3A4D39]">
                          Targets
                        </h3>
                        <Badge className="bg-[#4F6F52]/10 text-[#4F6F52] border-0 text-[10px] py-0 px-2 h-5">
                          {formData.selectedMachines.length} selected
                        </Badge>
                      </div>

                      <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl mb-3 shrink-0">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectAll}
                            onChange={(e) => handleSelectAllChange(e.target.checked)}
                            className="w-4 h-4 accent-[#4F6F52] cursor-pointer"
                          />
                          <span className="font-bold text-[#3A4D39] text-sm">
                            Select All Machines
                          </span>
                        </label>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-3 custom-scrollbar min-h-0">
                        {machines.length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                            <p className="text-xs text-gray-400">No machines found</p>
                          </div>
                        ) : (
                          machines.map((machine) => (
                            <label
                              key={machine.machine_id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                formData.selectedMachines.includes(machine.machine_id)
                                  ? "bg-[#4F6F52]/5 border-[#4F6F52]/20 text-[#3A4D39]"
                                  : "bg-white border-gray-100 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedMachines.includes(machine.machine_id)}
                                onChange={() => handleMachineToggle(machine.machine_id)}
                                className="w-4 h-4 accent-[#4F6F52]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-[13px]">
                                  {machine.machine_name || "Untitled Machine"}
                                </p>
                                <p className="text-[10px] font-mono text-gray-400 truncate uppercase">
                                  {machine.machine_id}
                                </p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-6 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl px-6 h-10 text-xs font-bold"
                      onClick={() =>
                        setFormData({
                          header: "",
                          subheader: "",
                          description: "",
                          type: "info",
                          selectedMachines: [],
                          selectAll: false,
                        })
                      }
                      disabled={creating}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#4F6F52] text-white hover:bg-[#3A4D39] rounded-xl font-bold px-8 h-12 shadow-lg shadow-[#4F6F52]/20 text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      disabled={creating || formData.selectedMachines.length === 0}
                    >
                      {creating ? "Sending..." : "Send Notification"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Notifications List */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0 px-1">
              <h3 className="font-bold text-[#3A4D39] text-base">Activity Feed</h3>
              <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 uppercase border-gray-300">
                {notifications.length} RECORDS
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4 custom-scrollbar min-h-0">
              {loading && notifications.length === 0 ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
                ))
              ) : notifications.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-2 py-16">
                  <CardContent className="flex flex-col items-center justify-center text-center opacity-40">
                    <Bell className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">No alerts found</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((n) => (
                  <Card
                    key={n.notification_id}
                    className={`rounded-2xl border shadow-sm transition-all group relative overflow-hidden shrink-0 ${
                      n.resolved ? "opacity-60 bg-gray-50/50" : "bg-white hover:border-[#4F6F52]/30"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 h-4 border-0 font-bold ${getTypeStyle(n.type)}`}
                        >
                          {n.type}
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleResolve(n.notification_id, n.resolved)}
                            className={`p-1.5 rounded-md transition-colors ${
                              n.resolved ? "text-blue-500 hover:bg-blue-50" : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(n.notification_id)}
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className={`font-bold text-sm leading-tight ${n.resolved ? "text-gray-500 line-through" : "text-[#3A4D39]"}`}>
                        {n.header}
                      </h4>
                      {n.subheader && (
                        <p className="text-[11px] font-bold text-[#4F6F52] mt-1">
                          {n.subheader}
                        </p>
                      )}
                      
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                        {n.description}
                      </p>

                      <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                          <Cpu className="h-3 w-3 text-[#4F6F52]/40" />
                          <span className="truncate uppercase">{n.machine_id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                          <Clock className="h-3 w-3 text-[#4F6F52]/40" />
                          {new Date(n.date).toLocaleDateString()} • {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {confirm.show && (
          <ConfirmBox
            mode="reject"
            title="Delete Notification"
            description="Are you sure you want to delete this notification record? This action cannot be undone."
            confirm={performDelete}
            cancel={() => setConfirm({ show: false, id: null, loading: false })}
            loading={confirm.loading}
          />
        )}
      </section>
    </div>
  );
}
