//Multi Factor Authentication Records Page
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, UserCog, ShieldCheck, Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Requests from "@/utils/Requests";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForm } from "react-hook-form";

export default function MfaRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("customers");

  const filterForm = useForm({ defaultValues: { count: "10", term: "" } });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await Requests({
          url: "/management/mfa-records",
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

  const formatAuthenticationType = (type) => {
    const t = (type || "").toString().toLowerCase().trim();
    if (!t || t === "nothing" || t === "n/a") return "N/A";
    if (t === "email") return "Email";
    if (t === "sms") return "SMS";
    return type;
  };

  const term = filterForm.watch("term").toLowerCase();

  const customers = records.filter(
    (r) => (r.user_type || "").toLowerCase() === "customer",
  );
  const staff = records.filter(
    (r) => (r.user_type || "").toLowerCase() === "staff",
  );
  const admins = records.filter(
    (r) => (r.user_type || "").toLowerCase() === "admin",
  );

  const currentData =
    activeTab === "customers"
      ? customers
      : activeTab === "staff"
        ? staff
        : admins;

  const filtered = currentData.filter((r) => {
    if (!term) return true;
    return (
      (r.full_name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term) ||
      (r.identifier || "").toLowerCase().includes(term) ||
      (r.authentication_type || "").toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filtered.length / entriesCount) || 1;

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-4">
            <div className="bg-[#4F6F52] p-3 rounded-2xl shadow-lg shadow-[#4F6F52]/20">
              <ShieldCheck className="text-white h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1C19]">
                  Security Audit
                </h1>
                <span className="px-3 py-1 bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold rounded-full uppercase tracking-wider border border-[#4F6F52]/20">
                  MFA Registry
                </span>
              </div>
              <p className="text-sm text-[#4F6F52]/60 font-medium mt-1">
                Multi-factor authentication lifecycle and status monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-[#E9E9E9] shadow-2xl shadow-[#4F6F52]/5 overflow-hidden w-full transition-all duration-300">
          <div className="flex gap-4 px-8 pt-8 pb-2">
            {[
              { id: "customers", label: "Customers", icon: Users },
              { id: "staff", label: "Staff", icon: UserCog },
              { id: "admins", label: "Admins", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-3 h-12 px-8 rounded-2xl transition-all duration-300 font-bold text-sm ${
                    isActive
                      ? "bg-[#4F6F52] text-white shadow-lg shadow-[#4F6F52]/30 scale-105"
                      : "bg-[#F6F7F4] text-[#4F6F52] hover:bg-[#4F6F52]/5 border border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="px-8 py-6 flex flex-col md:flex-row gap-6 items-center justify-between">
            <Form {...filterForm}>
              <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                <div className="relative w-full md:w-[500px] group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4F6F52]/40 transition-colors duration-300 group-focus-within:text-[#4F6F52] z-10">
                    <Search className="h-full w-full" />
                  </div>
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Search by identity or method..."
                            className="pl-12 bg-[#F6F7F4]/50 border-[#E9E9E9] focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#4F6F52] focus-visible:border-[#4F6F52] w-full h-14 rounded-2xl font-medium transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3 bg-[#F6F7F4]/50 px-4 py-2 rounded-2xl border border-[#E9E9E9]">
                  <span className="text-xs font-bold text-[#4F6F52]/60 uppercase tracking-widest">
                    Showing
                  </span>
                  <FormField
                    control={filterForm.control}
                    name="count"
                    render={({ field }) => (
                      <FormItem>
                        <select
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          className="bg-transparent border-none text-[#4F6F52] font-black focus:ring-0 cursor-pointer text-sm"
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                      </FormItem>
                    )}
                  />
                  <span className="text-xs font-bold text-[#4F6F52]/60 uppercase tracking-widest">
                    results
                  </span>
                </div>
              </div>
            </Form>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-[#F6F7F4]/50">
                <TableRow className="hover:bg-transparent border-b border-[#E9E9E9]">
                  <TableHead className="font-black text-[#4F6F52]/60 py-5 pl-8 text-xs uppercase tracking-widest">
                    {activeTab === "customers"
                      ? "IDENTITY ID"
                      : activeTab === "staff"
                        ? "STAFF ID"
                        : "ADMIN ID"}
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-xs uppercase tracking-widest">
                    INDIVIDUAL
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-xs uppercase tracking-widest">
                    METHOD
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-xs uppercase tracking-widest">
                    STATUS
                  </TableHead>
                  <TableHead className="text-right font-black text-[#4F6F52]/60 pr-8 text-xs uppercase tracking-widest">
                    ESTABLISHED
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 border-4 border-[#4F6F52]/10 rounded-full" />
                          <div className="absolute top-0 w-14 h-14 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-[#4F6F52]/60 font-bold uppercase tracking-widest text-xs">
                          Syncing MFA Data...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-80 text-center text-[#4F6F52]/40 font-bold"
                    >
                      No records found in this segment.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r, idx) => (
                    <TableRow
                      key={`${r.user_type}-${r.identifier}-${idx}`}
                      className="hover:bg-[#F6F7F4]/30 transition-all border-b border-[#E9E9E9]/50 group"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-black pl-8 text-sm">
                        {r.identifier}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-3">
                          <span className="font-bold text-[#1A1C19] text-base leading-none mb-1.5 group-hover:text-[#4F6F52] transition-colors">
                            {r.full_name || "N/A"}
                          </span>
                          <span className="text-xs text-[#4F6F52]/60 font-bold font-mono">
                            {r.email || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-[#F6F7F4] text-[#4F6F52] text-[11px] font-black rounded-lg uppercase border border-[#E9E9E9]">
                          {formatAuthenticationType(r.authentication_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            r.enabled
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${r.enabled ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
                          />
                          {r.enabled ? "Verified" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#4F6F52]/60 font-bold text-sm text-right pr-8">
                        {formatDate(r.auth_date_created || r.date_created)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-8 py-6 border-t border-[#E9E9E9] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F6F7F4]/30">
            <span className="text-[10px] font-black text-[#4F6F52]/40 uppercase tracking-[0.2em]">
              Total Records: {filtered.length}
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`text-[#4F6F52] hover:text-white bg-white hover:bg-[#4F6F52] border-[#4F6F52] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-[#4F6F52] shadow-sm">
                    {currentPage} / {totalPages}
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={`text-[#4F6F52] hover:text-white bg-white hover:bg-[#4F6F52] border-[#4F6F52] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
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
