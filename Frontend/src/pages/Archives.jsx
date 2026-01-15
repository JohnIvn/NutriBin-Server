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
import { Search, Archive, Users, UserCog } from "lucide-react";
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
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Archive Management
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              View archived user and staff records.
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-3">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("users");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 h-11 px-6 rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "users"
                ? "bg-[#4F6F52] hover:bg-[#739072] text-white shadow-md"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users size={18} />
            <span className="font-semibold">User Archive</span>
          </Button>
          <Button
            variant={activeTab === "staff" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("staff");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 h-11 px-6 rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "staff"
                ? "bg-[#4F6F52] hover:bg-[#739072] text-white shadow-md"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <UserCog size={18} />
            <span className="font-semibold">Staff Archive</span>
          </Button>
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
                            placeholder="Filter by ID, name, or email..."
                            className="pl-10 border-gray-200 focus-visible:ring-1 text-[#4F6F52] focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] w-full h-11 transition-all duration-200"
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            setCurrentPage(1);
                          }}
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
                  <span className="text-sm font-medium text-gray-500 text-nowrap">
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
                    {activeTab === "users" ? "USER ID" : "STAFF ID"}
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    FULL NAME
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    EMAIL
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    CONTACT
                  </TableHead>
                  {activeTab === "staff" && (
                    <TableHead className="font-bold text-gray-700">
                      BIRTHDAY
                    </TableHead>
                  )}
                  {activeTab === "staff" && (
                    <TableHead className="font-bold text-gray-700">
                      AGE
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-gray-700">
                    STATUS
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    DATE CREATED
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeTab === "staff" ? 8 : 6}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium">
                          Fetching Archive Records...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeTab === "staff" ? 8 : 6}
                      className="h-64 text-center text-gray-400 font-medium"
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
                        className="hover:bg-gray-50/30 transition-all"
                      >
                        <TableCell className="pl-6 font-mono text-xs text-gray-500">
                          {id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-semibold text-gray-800">
                          {item.first_name} {item.last_name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.email}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.contact_number || "N/A"}
                        </TableCell>
                        {activeTab === "staff" && (
                          <TableCell className="text-gray-600">
                            {item.birthday || "N/A"}
                          </TableCell>
                        )}
                        {activeTab === "staff" && (
                          <TableCell className="text-gray-600">
                            {item.age || "N/A"}
                          </TableCell>
                        )}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                              item.status === "active"
                                ? "bg-green-100 text-green-700"
                                : item.status === "inactive"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "active"
                                ? "bg-green-500 animate-pulse"
                                : item.status === "cancelled"
                                ? "bg-red-500"
                                : "bg-orange-500"
                            }`}
                          />
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
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
          <div className="p-5 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total {activeTab === "users" ? "Users" : "Staff"}:{" "}
              {filteredData.length}
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`text-[#4F6F52] hover:text-white bg-white hover:bg-[#4F6F52] border-[#4F6F52] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${
                      currentPage === 1
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-[#4F6F52] shadow-sm">
                    {currentPage} / {totalPages || 1}
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={`text-[#4F6F52] hover:text-white bg-white hover:bg-[#4F6F52] border-[#4F6F52] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${
                      currentPage === (totalPages || 1)
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }`}
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

export default Archives;
