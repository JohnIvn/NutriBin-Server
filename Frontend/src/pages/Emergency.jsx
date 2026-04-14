import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontalIcon,
  Search,
  AlertTriangle,
  RefreshCw,
  User,
  Monitor,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Emergency() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const filterForm = useForm({
    defaultValues: { count: "10", term: "" },
  });

  const count = parseInt(filterForm.watch("count") || "10");
  const searchTerm = filterForm.watch("term").toLowerCase();

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/emergency",
        method: "GET",
      });
      setEmergencies(response.data || []);
    } catch {
      toast.error("Failed to load emergency data");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmergencies = emergencies.filter((e) => {
    if (!searchTerm) return true;
    const fullName = `${e.first_name || ""} ${e.last_name || ""}`.toLowerCase();
    const email = (e.email || "").toLowerCase();
    const machineId = (e.machine_id || "").toLowerCase();
    const emergencyId = (e.emergency_id || "").toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      machineId.includes(searchTerm) ||
      emergencyId.includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredEmergencies.length / count);
  const paginatedEmergencies = filteredEmergencies.slice(
    (currentPage - 1) * count,
    currentPage * count
  );

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await Requests({
        url: `/management/emergency/${deleteId}`,
        method: "DELETE",
      });
      setEmergencies(emergencies.filter((e) => e.emergency_id !== deleteId));
      toast.success("Emergency record removed");
      setShowDeleteDialog(false);
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" />
              Safety Protocols
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              Emergency <span className="text-red-500">Logs</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Monitor and review critical system alerts, hardware malfunctions, and manual emergency triggers across the NutriBin machine network.
            </p>
          </div>
          <Button
            onClick={fetchEmergencies}
            disabled={loading}
            variant="outline"
            className="bg-white border-none shadow-md hover:bg-gray-50 text-[#3A4D39] font-black h-14 px-8 rounded-2xl transition-all duration-300 active:scale-95 gap-3"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Sync Database
          </Button>
        </div>

        <div className="bg-white rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden w-full">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 backdrop-blur-sm">
            <Form {...filterForm}>
              <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Search by ID, name, or customer email..."
                            className="pl-12 bg-gray-50/50 border-transparent focus:bg-white focus-visible:ring-2 focus-visible:ring-red-500/20 text-[#3A4D39] focus-visible:border-red-500 w-full h-14 rounded-2xl transition-all duration-300 font-medium"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-3">
                    Show
                  </span>
                  <FormField
                    control={filterForm.control}
                    name="count"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-24 h-11 border-none bg-white shadow-sm focus:ring-[#4F6F52] font-black text-[#4F6F52] cursor-pointer rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="10" className="rounded-lg">10 Rows</SelectItem>
                            <SelectItem value="25" className="rounded-lg">25 Rows</SelectItem>
                            <SelectItem value="50" className="rounded-lg">50 Rows</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-[#F6F7F4]/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100/50">
                  <TableHead className="font-extrabold text-[#3A4D39] py-6 pl-8 uppercase tracking-widest text-[10px]">
                    Identifier
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    User Context
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Machine Ref
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Incident Timestamp
                  </TableHead>
                  <TableHead className="text-right font-extrabold text-[#3A4D39] pr-8 uppercase tracking-widest text-[10px]">
                    Operations
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="h-12 w-12 text-[#4F6F52] animate-spin opacity-20" />
                        <p className="text-[#3A4D39] font-black text-xl tracking-tight opacity-40">Syncing database records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedEmergencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-16 w-16 text-gray-100 mb-2" />
                        <p className="text-[#3A4D39] font-black text-2xl tracking-tight">No incident logs</p>
                        <p className="text-gray-400 font-medium">Clear system status. No emergency records found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmergencies.map((e) => (
                    <TableRow
                      key={e.emergency_id}
                      className="group hover:bg-[#F6F7F4]/40 border-b border-gray-50 last:border-none transition-all duration-300"
                    >
                      <TableCell className="py-7 pl-8">
                        <span className="font-mono text-xs font-black bg-gray-50 text-[#3A4D39] px-4 py-2 rounded-xl border border-gray-100">
                          #{e.emergency_id.substring(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell className="py-7">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-[#4F6F52]/10 flex items-center justify-center group-hover:bg-[#4F6F52] group-hover:text-white transition-all duration-500 shadow-sm">
                            <User size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-[#3A4D39] text-lg leading-none mb-1">
                              {e.first_name ? `${e.first_name} ${e.last_name}` : "Unlinked Account"}
                            </span>
                            <span className="text-sm text-gray-400 font-bold">{e.email || "No contact info"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-7">
                        <div className="flex items-center gap-2 font-black text-sm text-[#4F6F52] bg-[#4F6F52]/5 px-4 py-2 rounded-xl border border-[#4F6F52]/10 w-fit">
                          <Monitor size={16} />
                          {e.machine_id.split("-")[0].toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="py-7">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-[#3A4D39] mb-1">
                            {formatDate(e.date_created).split(",")[0]}
                          </span>
                          <span className="text-xs text-gray-400 font-black uppercase tracking-widest">
                            {formatDate(e.date_created).split(",")[1]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-7 pr-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 hover:bg-gray-50 rounded-2xl group/btn transition-all duration-300">
                              <MoreHorizontalIcon size={24} className="text-gray-300 group-hover/btn:text-[#3A4D39]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2 bg-white/90 backdrop-blur-md">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-4 py-3">
                              Incident Management
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedEmergency(e)}
                              className="gap-3 px-4 py-3.5 cursor-pointer font-black text-[#3A4D39] focus:bg-[#F6F7F4] focus:text-[#4F6F52] rounded-xl transition-all"
                            >
                              <Eye size={20} className="opacity-50" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(e.emergency_id)}
                              className="gap-3 px-4 py-3.5 cursor-pointer font-black text-red-500 focus:bg-red-50 focus:text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 size={20} className="opacity-50" /> Purge Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                Page <span className="text-[#4F6F52]">{currentPage}</span> of <span className="text-[#4F6F52]">{totalPages || 1}</span>
              </p>
            </div>
            <Pagination className="w-auto m-0">
              <PaginationContent className="gap-3">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`border-none bg-white shadow-sm hover:bg-gray-50 rounded-2xl font-black text-[#3A4D39] h-12 px-6 transition-all duration-300 ${
                      currentPage === 1 ? "opacity-30 pointer-events-none" : "cursor-pointer active:scale-95 shadow-md shadow-gray-100"
                    }`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={`border-none bg-white shadow-sm hover:bg-gray-50 rounded-2xl font-black text-[#3A4D39] h-12 px-6 transition-all duration-300 ${
                      currentPage === totalPages || totalPages === 0 ? "opacity-30 pointer-events-none" : "cursor-pointer active:scale-95 shadow-md shadow-gray-100"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>

      {/* View Emergency Dialog */}
      <Dialog
        open={!!selectedEmergency}
        onOpenChange={(open) => !open && setSelectedEmergency(null)}
      >
        <DialogContent className="max-w-md border-none shadow-2xl p-0 overflow-hidden rounded-[2.5rem] bg-white">
          <div className="bg-red-600 p-8 flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              <AlertTriangle className="text-white h-10 w-10" />
            </div>
            <div>
              <h2 className="text-white text-3xl font-black tracking-tight">Incident Report</h2>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Database Audit Entry</p>
            </div>
          </div>
          
          {selectedEmergency && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Identifier</p>
                  <p className="font-mono text-sm font-black text-[#3A4D39] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    {selectedEmergency.emergency_id.substring(0, 16)}...
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Event Time</p>
                  <p className="text-sm font-black text-[#3A4D39] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    {formatDate(selectedEmergency.date_created)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#F6F7F4] border border-gray-100 shadow-inner group/card">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 ml-1">User Context</p>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover/card:scale-110 transition-transform">
                      <User size={28} className="text-[#4F6F52]" />
                    </div>
                    <div>
                      <p className="font-black text-[#3A4D39] text-xl leading-none mb-1">
                        {selectedEmergency.first_name || "Unlinked"} {selectedEmergency.last_name || "Account"}
                      </p>
                      <p className="text-sm text-gray-500 font-bold italic opacity-70">{selectedEmergency.email || "No contact info"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#F6F7F4] border border-gray-100 shadow-inner group/card">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 ml-1">Machine Context</p>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover/card:scale-110 transition-transform">
                      <Monitor size={28} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-mono font-black text-[#3A4D39] tracking-tighter">
                        {selectedEmergency.machine_id}
                      </p>
                      <p className="text-xs text-gray-500 font-black uppercase tracking-widest opacity-70">Hardware Unit ID</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedEmergency(null)}
                className="w-full bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-black h-16 rounded-2xl shadow-xl shadow-[#3A4D39]/20 transition-all active:scale-95 text-lg"
              >
                Dismiss Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border-none shadow-2xl rounded-[3rem] p-10 bg-white max-w-sm text-center">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-[2rem] bg-red-50 flex items-center justify-center mb-8 shadow-inner">
              <Trash2 className="h-12 w-12 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-[#3A4D39] tracking-tighter">Purge Record?</DialogTitle>
              <p className="text-gray-400 font-bold mt-4 leading-relaxed">
                This will permanently erase the incident report from the audit trail. This protocol cannot be reversed.
              </p>
            </DialogHeader>
            <div className="flex flex-col w-full gap-4 mt-10">
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="w-full bg-red-600 hover:bg-red-700 h-16 rounded-2xl text-xl font-black shadow-xl shadow-red-200 transition-all active:scale-95"
              >
                Execute Purge
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full h-14 text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest text-xs"
              >
                Abort Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Emergency;
