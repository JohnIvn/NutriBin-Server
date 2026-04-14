//Staff Management Page
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFilter } from "@/schema/users";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontalIcon,
  Plus,
  Search,
  UserCog,
  UserCheck,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AdminModal from "@/components/partials/adminModal";
import ConfirmBox from "@/components/partials/confirmBox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

function Staff() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInformation, setConfirmInformation] = useState({
    mode: "",
    title: "",
    description: "",
  });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const role = user?.role || "staff";

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: { count: "10", term: "" },
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/staff",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) setStaffList(response.data.staff || []);
    } catch {
      toast.error("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const displayModal = (mode, staff = null) => {
    setSelectedStaff(staff);
    setShowModal(true);
    setModalMode(mode);
  };

  const displayConfirm = (mode, title, description, staff = null) => {
    setSelectedStaff(staff);
    setShowConfirm(true);
    setConfirmInformation({ mode, title, description });
  };

  const onConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setActionLoading(true);
      if (confirmInformation.mode === "Disable") {
        const response = await Requests({
          url: `/management/staff/${selectedStaff.staff_id}/disable`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Staff member disabled successfully");
          fetchStaff();
        }
      } else if (confirmInformation.mode === "Ban") {
        const response = await Requests({
          url: `/management/staff/${selectedStaff.staff_id}/ban`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Staff member banned successfully");
          fetchStaff();
        }
      } else if (confirmInformation.mode === "Enable") {
        const response = await Requests({
          url: `/management/staff/${selectedStaff.staff_id}/enable`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Staff member enabled successfully");
          fetchStaff();
        }
      } else if (confirmInformation.mode === "Delete") {
        const response = await Requests({
          url: `/management/staff/${selectedStaff.staff_id}`,
          method: "DELETE",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Staff member deleted successfully");
          fetchStaff();
        }
      }
      closeConfirm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);
  const closeConfirm = () => setShowConfirm(false);
  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const filteredStaff = staffList.filter((staff) => {
    const searchTerm = filterForm.watch("term").toLowerCase();
    if (!searchTerm) return true;
    return (
      staff.staff_id.toLowerCase().includes(searchTerm) ||
      `${staff.first_name} ${staff.last_name}`
        .toLowerCase()
        .includes(searchTerm) ||
      staff.email?.toLowerCase().includes(searchTerm)
    );
  });

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filteredStaff.length / entriesCount);

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      {showModal && (
        <AdminModal
          mode={modalMode}
          cancel={closeModal}
          staff={selectedStaff}
          onSuccess={fetchStaff}
        />
      )}
      {showConfirm && (
        <ConfirmBox
          mode={confirmInformation.mode}
          cancel={closeConfirm}
          confirm={onConfirm}
          description={confirmInformation.description}
          title={confirmInformation.title}
          loading={actionLoading}
        />
      )}

      <section className="flex flex-col w-full px-4 md:px-8 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold uppercase tracking-wider">
              <UserCog className="h-3.5 w-3.5" />
              Administrative
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              Staff <span className="text-[#4F6F52]">Directory</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Manage internal access, oversee administrative privileges, and
              monitor staff engagement within the NutriBin ecosystem.
            </p>
          </div>
          <Button
            onClick={() => displayModal("default")}
            className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white shadow-xl shadow-[#4F6F52]/20 cursor-pointer transition-all active:scale-95 px-8 h-14 rounded-2xl font-bold text-lg"
          >
            <Plus className="mr-2 h-6 w-6 stroke-[3]" /> Add New Personnel
          </Button>
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
                            placeholder="Search by ID, name, or system email..."
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
                    Personnel Identifier
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Legal Name & Contact
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Registration
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Access Level
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
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-[#4F6F52]/10 rounded-full" />
                          <div className="w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[#3A4D39] font-black text-lg">
                            Synchronizing Records
                          </p>
                          <p className="text-gray-400 text-sm font-medium">
                            Please wait while we fetch personnel data...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <Search className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">
                          No personnel found.
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStaff.map((staff) => (
                    <TableRow
                      key={staff.staff_id}
                      className="hover:bg-[#F6F7F4]/30 transition-all border-b border-gray-50 last:border-0 group"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-black pl-8 text-sm">
                        #{staff.staff_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-4">
                          <span className="font-bold text-[#3A4D39] text-base leading-none mb-1.5 group-hover:text-[#4F6F52] transition-colors">
                            {staff.first_name} {staff.last_name}
                          </span>
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            {staff.email || "staff@nutribin.system"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 font-bold text-sm italic">
                        {formatDate(staff.date_created)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-sm ${
                            staff.status === "active"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              staff.status === "active"
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse"
                                : "bg-red-500"
                            }`}
                          />
                          {staff.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-2xl text-[#3A4D39] hover:bg-[#4F6F52] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-lg border border-transparent hover:border-[#4F6F52]/20"
                            >
                              <MoreHorizontalIcon className="h-5 w-5 stroke-[2.5]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-3 shadow-2xl rounded-[1.5rem] border-none bg-white mt-2 animate-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuLabel className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3 px-2">
                              System Operations
                            </DropdownMenuLabel>
                            <DropdownMenuGroup className="space-y-1">
                              {role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() => displayModal("edit", staff)}
                                  className="group cursor-pointer focus:bg-[#4F6F52] focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-[#3A4D39]"
                                >
                                  <UserCog className="mr-3 h-5 w-5 text-[#4F6F52] group-focus:text-white transition-colors" />
                                  Edit Profile
                                </DropdownMenuItem>
                              )}

                              {staff.status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Disable",
                                      "Restrict Access",
                                      "This user will immediately lose access to the staff portal. They will be logged out from all active sessions.",
                                      staff,
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-amber-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-[#3A4D39]"
                                >
                                  <ShieldAlert className="mr-3 h-5 w-5 text-amber-600 group-focus:text-white transition-colors" />{" "}
                                  Disable Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Enable",
                                      "Restore Access",
                                      "This staff member will regain full access to their NutriBin administrative account.",
                                      staff,
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-emerald-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-[#3A4D39]"
                                >
                                  <UserCheck className="mr-3 h-5 w-5 text-emerald-600 group-focus:text-white transition-colors" />{" "}
                                  Enable Account
                                </DropdownMenuItem>
                              )}

                              {staff.status !== "banned" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Ban",
                                      "Ban Staff Account",
                                      "This staff member will be banned from the system. This action is recorded in the security logs.",
                                      staff,
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-red-700 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-red-700"
                                >
                                  <ShieldAlert className="mr-3 h-5 w-5 text-red-700 group-focus:text-white transition-colors" />{" "}
                                  Ban Account
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() =>
                                  displayConfirm(
                                    "Delete",
                                    "Permanently Remove",
                                    "Warning: This action cannot be undone.",
                                    staff,
                                  )
                                }
                                className="group cursor-pointer focus:bg-red-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-red-600"
                              >
                                <Trash2 className="mr-3 h-5 w-5 text-red-600 group-focus:text-white transition-colors" />{" "}
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="p-5 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Personnel: {filteredStaff.length}
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

export default Staff;
