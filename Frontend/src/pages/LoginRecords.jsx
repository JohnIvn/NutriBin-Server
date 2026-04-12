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
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Requests from "@/utils/Requests";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForm } from "react-hook-form";

import {
  ShieldAlert,
  Clock,
  ExternalLink,
  Activity,
  UserCheck,
} from "lucide-react";

export default function LoginRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filterForm = useForm({ defaultValues: { count: "10", term: "" } });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await Requests({
          url: "/management/login-records",
          method: "GET",
          credentials: true,
        });
        if (!mounted) return;
        setRecords(res.data?.rows || res.data || []);
      } catch {
        // failed to load
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return new Date(dateString).toString();
    }
  };

  const filtered = records.filter((r) => {
    const term = filterForm.watch("term").toLowerCase();
    if (!term) return true;
    return (
      (r.attempt_id || "").toLowerCase().includes(term) ||
      (r.user_type || "").toLowerCase().includes(term) ||
      (r.admin_id || r.staff_id || r.customer_id || "")
        .toString()
        .toLowerCase()
        .includes(term) ||
      (r.ip_address || "").toLowerCase().includes(term) ||
      (r.site_visited || "").toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filtered.length / entriesCount) || 1;

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" />
              Security Audit
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              Authentication <span className="text-[#4F6F52]">Logs</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Monitor real-time access attempts across all NutriBin portals.
              Review security metadata, identify anomalies, and audit system
              integrity.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden w-full">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 backdrop-blur-sm">
            <Form {...filterForm}>
              <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Search by ID, type, IP address or user name..."
                            className="pl-12 bg-gray-50/50 border-transparent focus:bg-white focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#3A4D39] focus-visible:border-[#4F6F52] w-full h-14 rounded-2xl transition-all duration-300 font-medium"
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
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-24 h-11 border-none bg-white shadow-sm focus:ring-[#4F6F52] font-black text-[#4F6F52] cursor-pointer rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="10" className="rounded-lg">
                              10 Rows
                            </SelectItem>
                            <SelectItem value="25" className="rounded-lg">
                              25 Rows
                            </SelectItem>
                            <SelectItem value="50" className="rounded-lg">
                              50 Rows
                            </SelectItem>
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
                    Chronology
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    User Category
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Operation
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Identity Metadata
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Endpoint
                  </TableHead>
                  <TableHead className="text-right font-extrabold text-[#3A4D39] pr-8 uppercase tracking-widest text-[10px]">
                    Access State
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-[#4F6F52]/10 rounded-full" />
                          <div className="w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                        </div>
                        <p className="text-[#3A4D39] font-black text-lg">
                          Retrieving Security Logs...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                          <Activity className="h-10 w-10" />
                        </div>
                        <p className="text-gray-400 font-black text-xl">
                          No authentication events found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r) => (
                    <TableRow
                      key={r.attempt_id}
                      className="hover:bg-[#F6F7F4]/30 transition-all border-b border-gray-50 last:border-0 group"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-black pl-8 text-xs">
                        {formatDate(r.date_created)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-50 text-[#3A4D39] text-[10px] font-black uppercase tracking-wider border border-gray-100 italic">
                          {r.user_type || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-[#3A4D39] text-[10px] uppercase tracking-[0.1em]">
                          {(r.attempt_type || "login").toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-4">
                          <span className="font-bold text-[#3A4D39] text-sm leading-none mb-1.5 group-hover:text-[#4F6F52] transition-colors">
                            {r.full_name ||
                              r.admin_id ||
                              r.staff_id ||
                              r.customer_id ||
                              "-"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                            {r.email || "NO-IDENTIFIED-EMAIL"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                          <ExternalLink className="h-3 w-3 text-gray-300" />
                          {r.site_visited || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${r.success ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
                        >
                          <div
                            className={`${r.success ? "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "w-1.5 h-1.5 rounded-full bg-red-500"}`}
                          />
                          {r.success ? "Authorized" : "Denied"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/30">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              Audit Volume: {filtered.length} Events
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-3">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`h-11 px-6 rounded-xl font-bold transition-all ${currentPage === 1 ? "opacity-30 pointer-events-none" : "bg-white text-[#4F6F52] border-gray-200 hover:bg-[#4F6F52] hover:text-white hover:border-[#4F6F52] shadow-sm cursor-pointer active:scale-95"}`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <div className="h-11 px-6 bg-[#4F6F52] text-white rounded-xl text-sm font-black flex items-center shadow-lg shadow-[#4F6F52]/20">
                    {currentPage}{" "}
                    <span className="opacity-50 mx-2 text-[10px] uppercase font-bold tracking-tighter">
                      of
                    </span>{" "}
                    {totalPages}
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={`h-11 px-6 rounded-xl font-bold transition-all ${currentPage === totalPages ? "opacity-30 pointer-events-none" : "bg-white text-[#4F6F52] border-gray-200 hover:bg-[#4F6F52] hover:text-white hover:border-[#4F6F52] shadow-sm cursor-pointer active:scale-95"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>
    </div>
  );
}
