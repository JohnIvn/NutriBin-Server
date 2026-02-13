import { useState, useEffect } from "react";
import {
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  RefreshCw,
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
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({
    show: false,
    id: null,
    loading: false,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await Requests({ url: "/management/machine-notifications" });
      if (res?.data?.ok) {
        setNotifications(res.data.notifications);
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

  return (
    <div className="w-full bg-gradient-to-br from-[#ECE3CE]/10 via-white to-[#ECE3CE]/5 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] rounded-2xl shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#3A4D39] tracking-tight">
                Machine Notifications
              </h1>
              <p className="text-sm text-[#6B6F68] mt-1">
                System alerts and hardware logs • {notifications.length} total
              </p>
            </div>
          </div>

          <Button
            onClick={fetchNotifications}
            variant="outline"
            className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/10 transition-all"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-32 bg-gray-50 rounded-2xl" />
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Everything seems to be running smoothly
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.notification_id}
                className={`rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden group ${
                  n.resolved ? "opacity-60" : "hover:shadow-md"
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div
                    className={`w-1.5 ${
                      n.resolved ? "bg-gray-300" : "bg-[#4F6F52]"
                    }`}
                  />
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-xl font-bold ${n.resolved ? "text-gray-500 line-through" : "text-[#3A4D39]"}`}
                          >
                            {n.header}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`${getTypeStyle(n.type)} capitalize`}
                          >
                            {n.type}
                          </Badge>
                          {n.resolved && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              Resolved
                            </Badge>
                          )}
                        </div>
                        {n.subheader && (
                          <p className="text-sm font-medium text-[#4F6F52]">
                            {n.subheader}
                          </p>
                        )}
                        <p className="text-gray-600 line-clamp-2">
                          {n.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            Machine: {n.machine_id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(n.date).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-9 px-4 rounded-xl ${
                            n.resolved
                              ? "text-gray-500 hover:text-[#4F6F52] hover:bg-[#4F6F52]/5"
                              : "text-[#4F6F52] hover:bg-[#4F6F52]/10"
                          }`}
                          onClick={() =>
                            handleResolve(n.notification_id, n.resolved)
                          }
                        >
                          {n.resolved ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reopen
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(n.notification_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
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
