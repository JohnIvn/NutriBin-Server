import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Bell,
  Globe,
  Smartphone,
  Calendar,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import Requests from "@/utils/Requests";
import ConfirmBox from "@/components/partials/confirmBox";

export default function Announcements() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAnnouncements() {
      try {
        const res = await Requests({ url: "/announcements" });
        const data = res?.data;
        if (data?.ok && Array.isArray(data.announcements)) {
          const mapped = data.announcements.map((a) => ({
            id: a.announcement_id,
            title: a.title,
            date: (a.date_published || a.date_created || "").split("T")[0],
            body: a.body,
            priority: a.priority || "medium",
            notified: a.notified || [],
            author: a.author || "System",
          }));

          if (mounted) setAnnouncements(mapped);
        }
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAnnouncements();

    return () => {
      mounted = false;
    };
  }, []);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notifyWebsite, setNotifyWebsite] = useState(false);
  const [notifyApp, setNotifyApp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({
    show: false,
    id: null,
    title: "",
    loading: false,
  });

  const handleCreate = () => {
    if (!title || !body) return toast.error("Title and body are required");

    const notified = [];
    if (notifyWebsite) notified.push("website");
    if (notifyApp) notified.push("app");

    const payload = {
      title: title.trim(),
      body: body.trim(),
      priority,
      notified,
      date_published: new Date().toISOString().split("T")[0],
      author: `${user.first_name} ${user.last_name}`,
    };

    (async () => {
      try {
        let res;
        if (editId) {
          res = await Requests({
            url: `/announcements/${editId}`,
            method: "PATCH",
            data: payload,
          });
        } else {
          res = await Requests({
            url: "/announcements",
            method: "POST",
            data: payload,
          });
        }

        const d = res?.data;
        if (d?.ok) {
          const a = editId ? d.announcement : d.announcement;
          const mapped = {
            id: a.announcement_id,
            title: a.title,
            date: (a.date_published || a.date_created || "").split("T")[0],
            body: a.body,
            priority: a.priority || "medium",
            notified: a.notified || [],
            author: a.author || `${user.first_name} ${user.last_name}`,
          };

          if (editId) {
            setAnnouncements((s) =>
              s.map((it) => (it.id === editId ? mapped : it)),
            );
            toast.success("Announcement updated");
          } else {
            setAnnouncements((s) => [mapped, ...s]);
            toast.success("Announcement created successfully");
          }

          if (notifyWebsite && notifyApp) {
            toast.success("Notified: website + application");
          } else if (notifyWebsite) {
            toast.success("Notified website users");
          } else if (notifyApp) {
            toast.success("Notified app users");
          }

          // Reset form
          setTitle("");
          setBody("");
          setPriority("medium");
          setNotifyWebsite(false);
          setNotifyApp(false);
          setShowCreateForm(false);
          setEditId(null);
        } else {
          toast.error(
            editId
              ? "Failed to update announcement"
              : "Failed to create announcement",
          );
        }
      } catch (err) {
        console.error(err);
        toast.error(
          editId
            ? "Failed to update announcement"
            : "Failed to create announcement",
        );
      }
    })();
  };

  const handleDelete = (id, title) => {
    setConfirm({ show: true, id, title, loading: false });
  };

  const performDelete = async () => {
    if (!confirm.id) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      await Requests({ url: `/announcements/${confirm.id}`, method: "DELETE" });
      setAnnouncements((s) => s.filter((a) => a.id !== confirm.id));
      toast.success("Announcement deleted");
      setConfirm({ show: false, id: null, title: "", loading: false });
    } catch (err) {
      console.error("Failed to delete announcement", err);
      toast.error("Failed to delete announcement");
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#ECE3CE]/10 via-white to-[#ECE3CE]/5 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] rounded-2xl shadow-lg">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#3A4D39] tracking-tight">
                Announcements
              </h1>
              <p className="text-sm text-[#6B6F68] mt-1">
                Company & system updates • {announcements.length} total
              </p>
            </div>
          </div>

          {user?.role === "admin" && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditId(null)}
                  className="bg-gradient-to-r from-[#4F6F52] to-[#3A4D39] hover:from-[#3A4D39] hover:to-[#2D3A2E] text-white shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="bg-[#4F6F52] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Megaphone className="w-32 h-32" />
                  </div>
                  <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <Bell className="h-6 w-6" />
                      {editId ? "Edit Announcement" : "New Announcement"}
                    </DialogTitle>
                    <div className="text-orange-100/90">
                      Publish messages and notify users across platforms
                    </div>
                  </DialogHeader>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-4">
                    {/* Announcement Details */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Megaphone className="w-3 h-3" /> Announcement Details
                      </h3>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#4F6F52]">
                          Title
                        </label>
                        <div className="relative group">
                          <Input
                            placeholder="Enter announcement title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#4F6F52]">
                          Message
                        </label>
                        <div className="relative group">
                          <Textarea
                            placeholder="Enter announcement message"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={4}
                            className="focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#4F6F52]">
                          Priority Level
                        </label>
                        <div className="flex gap-3">
                          {["high", "medium", "low"].map((p) => (
                            <label
                              key={p}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                priority === p
                                  ? "border-[#4F6F52] bg-[#4F6F52]/10"
                                  : "border-gray-200 hover:border-[#4F6F52]/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="priority"
                                value={p}
                                checked={priority === p}
                                onChange={(e) => setPriority(e.target.value)}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium capitalize">
                                {p}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-3 h-3" /> Notification Targets
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[#4F6F52]/50 cursor-pointer transition-all">
                          <Checkbox
                            checked={notifyWebsite}
                            onCheckedChange={(v) =>
                              setNotifyWebsite(Boolean(v))
                            }
                          />
                          <Globe className="h-4 w-4 text-[#4F6F52]" />
                          <span className="text-sm font-medium">
                            Notify Website Users
                          </span>
                        </label>

                        <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[#4F6F52]/50 cursor-pointer transition-all">
                          <Checkbox
                            checked={notifyApp}
                            onCheckedChange={(v) => setNotifyApp(Boolean(v))}
                          />
                          <Smartphone className="h-4 w-4 text-[#4F6F52]" />
                          <span className="text-sm font-medium">
                            Notify Mobile App Users
                          </span>
                        </label>

                        <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[#4F6F52]/50 cursor-pointer transition-all">
                          <Checkbox
                            checked={notifyWebsite && notifyApp}
                            onCheckedChange={(v) => {
                              const checked = Boolean(v);
                              setNotifyWebsite(checked);
                              setNotifyApp(checked);
                            }}
                          />
                          <Bell className="h-4 w-4 text-[#4F6F52]" />
                          <span className="text-sm font-medium">
                            Notify All Platforms
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 flex flex-col gap-3">
                      <Button
                        onClick={handleCreate}
                        className="w-full h-12 bg-[#4F6F52] hover:bg-[#3A4D39] text-white font-bold text-lg cursor-pointer transition-all active:scale-95 shadow-md"
                      >
                        <Bell className="h-5 w-5 mr-2" />
                        {editId ? "Save Changes" : "Publish Announcement"}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setTitle("");
                          setBody("");
                          setPriority("medium");
                          setNotifyWebsite(false);
                          setNotifyApp(false);
                          setShowCreateForm(false);
                          setEditId(null);
                        }}
                        variant="outline"
                        className="w-full h-12 text-white bg-[#FF3838] hover:bg-[#DC0000] hover:text-[white] transition-all duration-200 cursor-pointer font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#3A4D39]">
            Recent Announcements
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              // loading skeletons
              [1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="rounded-2xl border shadow-sm overflow-hidden"
                >
                  <CardContent className="py-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : announcements.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Megaphone className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Announcements Yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Create your first announcement to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              announcements.map((a) => (
                <Card
                  key={a.id}
                  className="rounded-2xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <CardHeader className="bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/20 border-b pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-[#3A4D39] group-hover:text-[#4F6F52] transition-colors">
                            {a.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`${getPriorityColor(a.priority)} border capitalize`}
                          >
                            {a.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(a.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span>By {a.author}</span>
                        </div>
                      </div>
                      {user?.role === "admin" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#4F6F52]/10 hover:text-[#4F6F52]"
                            onClick={() => {
                              // populate form for editing
                              setTitle(a.title || "");
                              setBody(a.body || "");
                              setPriority(a.priority || "medium");
                              setNotifyWebsite(a.notified?.includes("website"));
                              setNotifyApp(a.notified?.includes("app"));
                              setEditId(a.id);
                              setShowCreateForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(a.id, a.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {a.body}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          Notified:
                        </span>
                        {a.notified.map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs bg-[#4F6F52]/10 text-[#4F6F52] border-[#4F6F52]/20"
                          >
                            {platform === "website" && (
                              <Globe className="h-3 w-3 mr-1" />
                            )}
                            {platform === "app" && (
                              <Smartphone className="h-3 w-3 mr-1" />
                            )}
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      {user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#4F6F52] hover:text-[#3A4D39] hover:bg-[#4F6F52]/10"
                          onClick={() => {
                            toast.success(
                              "Re-notification sent to all platforms",
                            );
                          }}
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Re-notify
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        {confirm.show && (
          <ConfirmBox
            mode="reject"
            title={`Delete announcement`}
            description={`Are you sure you want to delete: "${confirm.title}"? This action can be undone by recreating the announcement.`}
            confirm={performDelete}
            cancel={() =>
              setConfirm({ show: false, id: null, title: "", loading: false })
            }
            loading={confirm.loading}
          />
        )}
      </section>
    </div>
  );
}
