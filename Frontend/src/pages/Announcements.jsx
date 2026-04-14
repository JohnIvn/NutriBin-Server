//Anouncements Creation Page
import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Bell,
  Calendar,
  Edit,
  Trash2,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import Requests from "@/utils/Requests";
import ConfirmBox from "@/components/partials/confirmBox";

export default function Announcements() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    priority: "medium",
  });

  const [editId, setEditId] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await Requests({ url: "/announcements" });
      if (res?.data?.ok && Array.isArray(res.data.announcements)) {
        const mapped = res.data.announcements.map((a) => ({
          id: a.announcement_id,
          title: a.title,
          date: (a.date_published || a.date_created || "").split("T")[0],
          body: a.body,
          priority: a.priority || "medium",
          author: a.author || "System",
        }));
        setAnnouncements(mapped);
      }
    } catch (err) {
      console.error("Failed to load announcements", err);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          accent: "bg-red-500",
        };
      case "medium":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          accent: "bg-amber-500",
        };
      case "low":
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

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Message is required");
      return;
    }

    setCreating(true);
    try {
      const url = editId ? `/announcements/${editId}` : "/announcements";
      const method = editId ? "PATCH" : "POST";

      const res = await Requests({
        url,
        method,
        data: {
          title: formData.title,
          body: formData.body,
          priority: formData.priority,
        },
      });

      if (res?.data?.ok) {
        toast.success(editId ? "Announcement updated" : "Announcement created");
        setFormData({ title: "", body: "", priority: "medium" });
        setEditId(null);
        await fetchAnnouncements();
        setIsModalOpen(false);
      } else {
        toast.error("Failed to save announcement");
      }
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast.error("Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    const announcement = announcements.find((a) => a.id === id);
    setConfirm({ show: true, id, loading: false, title: announcement?.title });
  };

  const performDelete = async () => {
    if (!confirm.id) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      const res = await Requests({
        url: `/announcements/${confirm.id}`,
        method: "DELETE",
      });
      if (res?.data?.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== confirm.id));
        toast.success("Announcement deleted");
      }
      setConfirm({ show: false, id: null, loading: false, title: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete announcement");
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.body.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditClick = (announcement) => {
    setFormData({
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority,
    });
    setEditId(announcement.id);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setFormData({ title: "", body: "", priority: "medium" });
    setEditId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase tracking-widest">
              <Megaphone className="w-4 h-4" />
              System Broadcast
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Announcements
            </h1>
            <p className="text-gray-400 font-medium">
              Manage system-wide announcements and updates.
            </p>
          </div>

          {user?.role === "admin" && (
            <div className="flex items-center gap-4">
              <Button
                onClick={handleNewClick}
                className="h-12 px-6 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#4F6F52]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                New Announcement
              </Button>

              <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
                <div className="flex flex-col px-4 border-r border-gray-50 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Total
                  </span>
                  <span className="text-lg font-black text-[#4F6F52]">
                    {announcements.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-col md:flex-row h-full">
              {/* Sidebar Branding */}
              <div className="w-full md:w-72 bg-[#4F6F52] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                    <Megaphone className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white mb-2">
                    {editId ? "Edit Announcement" : "Create Announcement"}
                  </DialogTitle>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    {editId
                      ? "Update the announcement details."
                      : "Create a new system announcement to broadcast to users."}
                  </p>
                </div>

                <div className="relative z-10 space-y-4 pt-8 border-t border-white/10 mt-8 md:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Active System
                    </span>
                  </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>

              {/* Form Content */}
              <div className="flex-1 p-8 bg-white lg:p-10">
                <form onSubmit={handleCreateAnnouncement} className="space-y-8">
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                        Title
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Announcement title..."
                        className="h-12 bg-[#FAF9F6] border-none rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 transition-all px-5"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                        Message
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            body: e.target.value,
                          }))
                        }
                        placeholder="Write your announcement message..."
                        rows="5"
                        className="w-full p-5 bg-[#FAF9F6] border-none rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52]" />
                        Priority
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["low", "medium", "high"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, priority: p }))
                            }
                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                              formData.priority === p
                                ? "bg-[#4F6F52] text-white border-[#4F6F52] shadow-lg shadow-[#4F6F52]/20"
                                : "bg-[#FAF9F6] text-gray-400 border-transparent hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-10 h-14 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-[#4F6F52]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {creating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {editId ? "Update" : "Publish"}
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

        {/* Announcements List */}
        <div className="space-y-6">
          {/* Search & Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search announcements..."
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
              onClick={fetchAnnouncements}
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

          {/* Grid/List */}
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
                    Loading Announcements
                  </p>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Megaphone className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    No Announcements
                  </p>
                </motion.div>
              ) : (
                filteredAnnouncements.map((a, idx) => {
                  const styles = getPriorityStyles(a.priority);
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-[#4F6F52]/5 hover:border-[#4F6F52]/20 transition-all flex flex-col"
                    >
                      {/* Status Accent */}
                      <div
                        className={`absolute top-0 left-8 w-12 h-1 rounded-b-full ${styles.accent}`}
                      />

                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${styles.bg} ${styles.text}`}
                        >
                          {styles.icon}
                          {a.priority}
                        </div>

                        {user?.role === "admin" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(a)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-black tracking-tight text-gray-800">
                          {a.title}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">
                          {a.body}
                        </p>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          By {a.author}
                        </span>
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
            title="Delete Announcement"
            description={`Are you sure you want to delete: "${confirm.title}"? This action cannot be undone.`}
            confirm={performDelete}
            cancel={() =>
              setConfirm({ show: false, id: null, loading: false, title: "" })
            }
            loading={confirm.loading}
          />
        )}
      </section>
    </div>
  );
}
