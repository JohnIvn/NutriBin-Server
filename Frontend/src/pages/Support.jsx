import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Send,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  History,
  Tag,
  Flag,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import Requests from "@/utils/Requests";

export default function Support() {
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [createLoading, setCreateLoading] = useState(false);

  const scrollRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "all"
          ? "/support/tickets"
          : `/support/tickets?status=${statusFilter}`;
      const res = await Requests({ url });
      if (res?.data) {
        setTickets(res.data);
        // Auto-select first ticket if none selected
        if (res.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedTicket]);

  const fetchMessages = useCallback(async (ticketId) => {
    setMessagesLoading(true);
    try {
      const res = await Requests({
        url: `/support/tickets/${ticketId}/messages`,
      });
      if (res?.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.ticket_id);
    }
  }, [selectedTicket, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      return toast.error("Please fill in all required fields");
    }

    setCreateLoading(true);
    try {
      const res = await Requests({
        url: "/support/tickets",
        method: "POST",
        data: {
          ...newTicket,
          customerId: user?.id || user?.admin_id || user?.staff_id,
        },
      });

      if (res?.data) {
        toast.success("Ticket created successfully");
        setShowCreateDialog(false);
        setNewTicket({ subject: "", description: "", priority: "medium" });
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
      toast.error("Failed to create ticket");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const res = await Requests({
        url: `/support/tickets/${selectedTicket.ticket_id}/messages`,
        method: "POST",
        data: {
          senderId: user?.id || user?.admin_id || user?.staff_id,
          senderType: user?.role || "staff",
          message: replyText,
        },
      });

      if (res?.data) {
        setMessages([...messages, res.data]);
        setReplyText("");
        // Update last updated in ticket list
        setTickets(
          tickets.map((t) =>
            t.ticket_id === selectedTicket.ticket_id
              ? { ...t, last_updated: new Date().toISOString() }
              : t,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;

    try {
      const res = await Requests({
        url: `/support/tickets/${selectedTicket.ticket_id}/status`,
        method: "PATCH",
        data: { status: newStatus },
      });

      if (res?.data) {
        toast.success(`Status updated to ${newStatus}`);
        const updated = { ...selectedTicket, status: newStatus };
        setSelectedTicket(updated);
        setTickets(
          tickets.map((t) =>
            t.ticket_id === selectedTicket.ticket_id ? updated : t,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            Processing
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Resolved
          </Badge>
        );
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500 text-white">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-slate-500 text-white">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* LEFT SIDEBAR - TICKET LIST */}
      <div className="w-[400px] border-r border-gray-100 flex flex-col bg-slate-50/30">
        <div className="p-4 border-b border-gray-100 space-y-4 bg-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Support Desk</h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#4F6F52] hover:bg-[#3E5941] text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Support Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a new ticket for support.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Summarize the issue"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(val) =>
                        setNewTicket({ ...newTicket, priority: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Details about the problem..."
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#4F6F52] hover:bg-[#3E5941]"
                    onClick={handleCreateTicket}
                    disabled={createLoading}
                  >
                    Create Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                className="pl-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">Processing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">
                No tickets found
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-white relative ${
                  selectedTicket?.ticket_id === ticket.ticket_id
                    ? "bg-white border-l-4 border-l-[#4F6F52] shadow-sm"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`text-sm font-semibold truncate pr-2 ${
                      selectedTicket?.ticket_id === ticket.ticket_id
                        ? "text-[#4F6F52]"
                        : "text-gray-800"
                    }`}
                  >
                    {ticket.subject}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(ticket.date_created).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <p className="text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {ticket.customer_name}
                  </p>
                  <div className="flex gap-1">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CONTENT - TICKET DETAILS & CHAT */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <>
            {/* TICKET HEADER */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-50 text-slate-600`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedTicket.subject}
                    </h2>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <User className="w-3 h-3" />{" "}
                      {selectedTicket.customer_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created{" "}
                      {new Date(selectedTicket.date_created).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedTicket.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <div
              className="flex-1 bg-slate-50/50 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
              ref={scrollRef}
            >
              {/* ORIGINAL DESCRIPTION */}
              <div className="flex gap-3 justify-start max-w-[80%]">
                <Avatar className="w-8 h-8 rounded-full bg-slate-200 text-xs font-bold ring-2 ring-white shadow-sm flex-shrink-0">
                  <AvatarFallback className="bg-slate-200">
                    {selectedTicket.customer_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-2">
                    Initial Description
                  </span>
                </div>
              </div>

              {messagesLoading && messages.length === 0 ? (
                <div className="text-center p-4 text-xs text-gray-400 italic">
                  Syncing message history...
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isStaff =
                    msg.sender_type === "staff" || msg.sender_type === "admin";
                  return (
                    <div
                      key={msg.message_id || idx}
                      className={`flex gap-3 ${isStaff ? "flex-row-reverse" : "justify-start"} max-w-[80%] ${isStaff ? "ml-auto" : ""}`}
                    >
                      <Avatar
                        className={`w-8 h-8 rounded-full text-xs font-bold ring-2 ring-white shadow-sm flex-shrink-0 ${
                          isStaff
                            ? "bg-[#4F6F52] text-white"
                            : "bg-slate-200 text-gray-600"
                        }`}
                      >
                        <AvatarFallback>
                          {isStaff ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            msg.sender_name?.charAt(0) || (
                              <User className="w-4 h-4" />
                            )
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`space-y-1 ${isStaff ? "items-end flex flex-col" : ""}`}
                      >
                        <div
                          className={`p-4 rounded-2xl border shadow-sm ${
                            isStaff
                              ? "bg-[#4F6F52] text-white border-[#4F6F52] rounded-tr-none"
                              : "bg-white text-gray-800 border-slate-100 rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 px-2">
                          {new Date(msg.date_sent).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* REPLY AREA */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="relative bg-slate-50 rounded-2xl border border-slate-100 p-2 transition-all focus-within:border-[#4F6F52]/50 focus-within:ring-4 focus-within:ring-[#4F6F52]/5">
                <Textarea
                  placeholder="Type your response here..."
                  className="bg-transparent border-none focus-visible:ring-0 min-h-[100px] resize-none pr-12"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex justify-between items-center p-2 pt-0">
                  <p className="text-[10px] text-gray-400">
                    Press Ctrl + Enter to send
                  </p>
                  <Button
                    size="sm"
                    className="bg-[#4F6F52] hover:bg-[#3E5941] text-white rounded-xl shadow-lg shadow-[#4F6F52]/20"
                    onClick={handleSendMessage}
                    disabled={!replyText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Response
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 bg-slate-50/20">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Select a Ticket
            </h3>
            <p className="text-center max-w-xs text-sm">
              Choose a ticket from the list on the left to view the details and
              start assisting the customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
