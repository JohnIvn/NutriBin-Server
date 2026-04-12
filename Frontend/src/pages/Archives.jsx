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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFilter } from "@/schema/users";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Search,
  Archive,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
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
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

function Archives() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [userArchives, setUserArchives] = useState([]);
  const [staffArchives, setStaffArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: { count: "10", term: "" },
  });

  useEffect(() => {
    fetchArchives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const endpoint =
        activeTab === "users"
          ? "/management/archives/users"
          : "/management/archives/staff";

      const response = await Requests({
        url: endpoint,
        method: "GET",
        credentials: true,
      });

      if (response.data.ok) {
        if (activeTab === "users") {
          setUserArchives(response.data.archives || []);
        } else {
          setStaffArchives(response.data.archives || []);
        }
      }
    } catch {
      toast.error("Failed to load archive data");
    } finally {
      setLoading(false);
    }
  };

  const count = parseInt(filterForm.watch("count"));
  const term = filterForm.watch("term").toLowerCase();

  const currentData = activeTab === "users" ? userArchives : staffArchives;

  const filteredData = currentData.filter((item) => {
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    const email = item.email?.toLowerCase() || "";
    const id = activeTab === "users" ? item.customer_id : item.staff_id;
    return (
      fullName.includes(term) ||
      email.includes(term) ||
      id?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredData.length / count);
  const startIndex = (currentPage - 1) * count;
  const endIndex = startIndex + count;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10 font-sans">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-4">
            <div className="bg-[#4F6F52] p-3 rounded-2xl shadow-lg shadow-[#4F6F52]/20 text-white">
              <Archive className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1C19]">
                  Information Archives
                </h1>
                <span className="px-3 py-1 bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold rounded-full uppercase tracking-wider border border-[#4F6F52]/20">
                  Cold Storage
                </span>
              </div>
              <p className="text-sm text-[#4F6F52]/60 font-medium mt-1">
                Legacy user and staff records preserved for audit compliance
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-[#E9E9E9] shadow-2xl shadow-[#4F6F52]/5 overflow-hidden w-full transition-all duration-300">
          <div className="flex gap-4 px-8 pt-8 pb-2">
            {[
              { id: "users", label: "User Archive", icon: Users },
              { id: "staff", label: "Staff Archive", icon: UserCog },
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
                  className={`flex items-center gap-3 h-12 px-8 rounded-2xl transition-all duration-300 font-bold text-sm cursor-pointer ${
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
                            placeholder="Filter by ID, name, or email..."
                            className="pl-12 bg-[#F6F7F4]/50 border-[#E9E9E9] focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#4F6F52] focus-visible:border-[#4F6F52] w-full h-14 rounded-2xl font-medium transition-all duration-300"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setCurrentPage(1);
                            }}
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
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setCurrentPage(1);
                          }}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-none text-[#4F6F52] font-black focus:ring-0 cursor-pointer text-sm shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-[#E9E9E9]">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <span className="text-xs font-bold text-[#4F6F52]/60 uppercase tracking-widest text-nowrap">
                    records
                  </span>
                </div>
              </div>
            </Form>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-[#F6F7F4]/50">
                <TableRow className="hover:bg-transparent border-b border-[#E9E9E9]">
                  <TableHead className="font-black text-[#4F6F52]/60 py-5 pl-8 text-[11px] uppercase tracking-[0.1em]">
                    {activeTab === "users" ? "IDENTITY ID" : "STAFF ID"}
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                    FULL NAME
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                    EMAIL ADDRESS
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                    CONTACT
                  </TableHead>
                  {activeTab === "staff" && (
                    <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                      BIRTHDAY
                    </TableHead>
                  )}
                  {activeTab === "staff" && (
                    <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                      AGE
                    </TableHead>
                  )}
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                    STATE
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em]">
                    ARCHIVED
                  </TableHead>
                  <TableHead className="font-black text-[#4F6F52]/60 text-[11px] uppercase tracking-[0.1em] text-right pr-8">
                    INITIALIZED
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeTab === "staff" ? 9 : 8}
                      className="h-80 text-center"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 border-4 border-[#4F6F52]/10 rounded-full" />
                          <div className="absolute top-0 w-14 h-14 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-[#4F6F52]/60 font-bold uppercase tracking-widest text-xs">
                          Accessing Vault...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeTab === "staff" ? 9 : 8}
                      className="h-80 text-center text-[#4F6F52]/40 font-bold"
                    >
                      No archived records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const id =
                      activeTab === "users" ? item.customer_id : item.staff_id;
                    return (
                      <TableRow
                        key={id}
                        className="hover:bg-[#F6F7F4]/30 transition-all border-b border-[#E9E9E9]/50 group"
                      >
                        <TableCell className="pl-8 font-mono text-xs text-[#4F6F52] font-black">
                          {id}
                        </TableCell>
                        <TableCell className="font-bold text-[#1A1C19] group-hover:text-[#4F6F52] transition-colors">
                          {item.first_name} {item.last_name}
                        </TableCell>
                        <TableCell className="text-[#4F6F52]/70 font-medium">
                          {item.email}
                        </TableCell>
                        <TableCell className="text-[#4F6F52]/70 font-medium font-mono text-xs">
                          {item.contact_number || "N/A"}
                        </TableCell>
                        {activeTab === "staff" && (
                          <TableCell className="text-[#4F6F52]/70 font-medium">
                            {item.birthday || "N/A"}
                          </TableCell>
                        )}
                        {activeTab === "staff" && (
                          <TableCell className="text-[#4F6F52]/70 font-medium">
                            {item.age || "N/A"}
                          </TableCell>
                        )}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.status === "active"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : item.status === "inactive"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-rose-100 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "active"
                                  ? "bg-emerald-500 animate-pulse"
                                  : item.status === "cancelled"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                              }`}
                            />
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#4F6F52]/60 font-bold text-xs">
                          {formatDate(item.archive_date)}
                        </TableCell>
                        <TableCell className="text-[#4F6F52]/60 font-bold text-xs text-right pr-8">
                          {formatDate(item.date_created)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="px-8 py-6 border-t border-[#E9E9E9] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F6F7F4]/30">
            <span className="text-[10px] font-black text-[#4F6F52]/40 uppercase tracking-[0.2em]">
              Vault Inventory: {filteredData.length}{" "}
              {activeTab === "users" ? "Users" : "Staff"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-[#E9E9E9] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="h-10 px-4 flex items-center justify-center bg-white border border-[#E9E9E9] rounded-xl text-xs font-black text-[#4F6F52] shadow-sm min-w-[80px]">
                {currentPage} <span className="mx-2 text-[#4F6F52]/30">/</span>{" "}
                {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === (totalPages || 1)}
                className="h-10 w-10 p-0 rounded-xl border-[#E9E9E9] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Archives;
