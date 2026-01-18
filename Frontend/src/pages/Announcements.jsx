import { Link } from "react-router-dom";
import { useState } from "react";
import { Megaphone } from "lucide-react";
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
import { useUser } from "@/contexts/UserContext";

export default function Announcements() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Firmware v1.2.3 released",
      date: "2026-01-18",
      body: "New firmware available for staged rollout.",
    },
    {
      id: 2,
      title: "Maintenance: Mixer #02",
      date: "2026-01-19",
      body: "Scheduled maintenance at 10:00 — brief downtime expected.",
    },
    {
      id: 3,
      title: "Holiday hours",
      date: "2026-02-01",
      body: "Office closed for public holiday.",
    },
  ]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notifyWebsite, setNotifyWebsite] = useState(false);
  const [notifyApp, setNotifyApp] = useState(false);

  const handleCreate = () => {
    if (!title || !body) return toast.error("Title and body are required");
    const newAnnouncement = {
      id: Date.now(),
      title,
      date: new Date().toISOString().split("T")[0],
      body,
    };
    setAnnouncements((s) => [newAnnouncement, ...s]);
    toast.success("Announcement created");

    // Simulate notifications
    if (notifyWebsite && notifyApp) {
      toast.success("Notified: website + application (Notify All)");
    } else if (notifyWebsite) {
      toast.success("Notified website");
    } else if (notifyApp) {
      toast.success("Notified application");
    }

    // Reset form
    setTitle("");
    setBody("");
    setNotifyWebsite(false);
    setNotifyApp(false);
  };

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-[#4F6F52] pl-6">
          <Megaphone className="h-6 w-6 text-[#4F6F52]" />
          <div>
            <h1 className="text-3xl font-bold text-[#3A4D39]">Announcements</h1>
            <p className="text-sm text-[#6B6F68] italic">
              Company & system updates
            </p>
          </div>
        </div>

        {user?.role === "admin" && (
          <Card className="rounded-xl p-4">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Create Announcement
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Publish messages and optionally notify users
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={notifyWebsite}
                    onCheckedChange={(v) => setNotifyWebsite(Boolean(v))}
                  />
                  <span className="text-sm">Notify website</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={notifyApp}
                    onCheckedChange={(v) => setNotifyApp(Boolean(v))}
                  />
                  <span className="text-sm">Notify application</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={notifyWebsite && notifyApp}
                    onCheckedChange={(v) => {
                      const checked = Boolean(v);
                      setNotifyWebsite(checked);
                      setNotifyApp(checked);
                    }}
                  />
                  <span className="text-sm">Notify all</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleCreate} className="bg-[#4F6F52]">
                  Create & Notify
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTitle("");
                    setBody("");
                    setNotifyWebsite(false);
                    setNotifyApp(false);
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {announcements.map((a) => (
            <Card key={a.id} className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-[#3A4D39]">{a.title}</CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  {a.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                <div className="mb-3">{a.body}</div>
                {user?.role === "admin" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success("Website notified (mock)");
                      }}
                    >
                      Notify website
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success("Application notified (mock)");
                      }}
                    >
                      Notify application
                    </Button>
                    <Button
                      className="bg-[#4F6F52]"
                      onClick={() => {
                        toast.success("Notified all (mock)");
                      }}
                    >
                      Notify all
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Link to="/dashboard" className="text-sm text-[#4F6F52] font-medium">
            Back to Dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}
