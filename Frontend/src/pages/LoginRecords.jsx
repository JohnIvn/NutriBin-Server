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

export default function LoginRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (e) {
        setError(e.message || "Failed to load");
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
    } catch (e) {
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
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Login Records
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Recent login attempts and metadata
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden w-full">
          <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
            <Form {...filterForm}>
              <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Filter by id, type, ip or identifier..."
                            className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] text-[#4F6F52] focus-visible:border-[#4F6F52] w-full h-11"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
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
                            <SelectTrigger className="w-20 h-11 border-gray-200 focus:ring-[#4F6F52] font-bold text-[#4F6F52] cursor-pointer">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm font-medium text-gray-500">
                    per page
                  </span>
                </div>
              </div>
            </Form>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 pl-6">
                    TIMESTAMP
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    USER TYPE
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    IDENTIFIER
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    SITE
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    IP ADDRESS
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-6">
                    STATUS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium">
                          Fetching login records...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-64 text-center text-gray-400 font-medium"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r) => (
                    <TableRow
                      key={r.attempt_id}
                      className="hover:bg-gray-50/30 transition-all"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-bold pl-6">
                        {formatDate(r.date_created)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-2">
                          <span className="font-semibold text-gray-900 leading-none mb-1">
                            {r.user_type || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-2">
                          <span className="font-semibold text-gray-900 leading-none mb-1">
                            {r.full_name ||
                              r.admin_id ||
                              r.staff_id ||
                              r.customer_id ||
                              "-"}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {r.email || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium">
                        {r.site_visited || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium italic">
                        {r.ip_address || "-"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${r.success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
                        >
                          <div
                            className={`${r.success ? "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" : "w-1.5 h-1.5 rounded-full bg-red-500"}`}
                          />
                          {r.success ? "Success" : "Failed"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-5 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
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
