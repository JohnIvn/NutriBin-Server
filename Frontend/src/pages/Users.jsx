//User Mangement Page
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
  Users as UsersIcon,
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
import ConfirmBox from "@/components/partials/confirmBox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Users() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInformation, setConfirmInformation] = useState({
    mode: "",
    title: "",
    description: "",
  });
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // const role = "admin";

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: { count: "10", term: "" },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/users",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) setUserList(response.data.users || []);
    } catch {
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const displayConfirm = (mode, title, description, user = null) => {
    setSelectedUser(user);
    setShowConfirm(true);
    setConfirmInformation({ mode, title, description });
  };

  const onConfirm = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      if (confirmInformation.mode === "Disable") {
        const response = await Requests({
          url: `/management/users/${selectedUser.customer_id}/disable`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("User disabled successfully");
          fetchUsers();
        }
      } else if (confirmInformation.mode === "Ban") {
        const response = await Requests({
          url: `/management/users/${selectedUser.customer_id}/ban`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("User banned successfully");
          fetchUsers();
        }
      } else if (confirmInformation.mode === "Enable") {
        const response = await Requests({
          url: `/management/users/${selectedUser.customer_id}/enable`,
          method: "PATCH",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("User enabled successfully");
          fetchUsers();
        }
      } else if (confirmInformation.mode === "Delete") {
        const response = await Requests({
          url: `/management/users/${selectedUser.customer_id}`,
          method: "DELETE",
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("User deleted successfully");
          fetchUsers();
        }
      }
      closeConfirm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(false);
    }
  };

  const closeConfirm = () => setShowConfirm(false);
  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const filteredUsers = userList.filter((user) => {
    const searchTerm = filterForm.watch("term").toLowerCase();
    if (!searchTerm) return true;
    return (
      user.customer_id.toLowerCase().includes(searchTerm) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filteredUsers.length / entriesCount);

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
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
              <UsersIcon className="h-3.5 w-3.5" />
              Customer Relations
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              User <span className="text-[#4F6F52]">Database</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Monitor customer accounts, manage access states, and maintain the
              integrity of the NutriBin user base.
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
                            placeholder="Search by ID, name, or customer email..."
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
                    User Identifier
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Full Name & Email
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Joined Date
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Account Status
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
                            Synchronizing Database
                          </p>
                          <p className="text-gray-400 text-sm font-medium">
                            Please wait while we fetch customer data...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <Search className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">
                          No users found.
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.customer_id}
                      className="hover:bg-[#F6F7F4]/30 transition-all border-b border-gray-50 last:border-0 group"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-black pl-8 text-sm">
                        #{user.customer_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-4">
                          <span className="font-bold text-[#3A4D39] text-base leading-none mb-1.5 group-hover:text-[#4F6F52] transition-colors">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            {user.email || "user@nutribin.system"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 font-bold text-sm italic">
                        {formatDate(user.date_created)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-sm ${
                            user.status === "active"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              user.status === "active"
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse"
                                : "bg-red-500"
                            }`}
                          />
                          {user.status}
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
                              Account Operations
                            </DropdownMenuLabel>
                            <DropdownMenuGroup className="space-y-1">
                              {user.status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Disable",
                                      "Restrict Access",
                                      "This user will immediately lose access to the Nutribin App. They will be logged out from all active sessions.",
                                      user,
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
                                      "This user will regain full access to their NutriBin account and mobile services.",
                                      user,
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-emerald-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-[#3A4D39]"
                                >
                                  <UserCheck className="mr-3 h-5 w-5 text-emerald-600 group-focus:text-white transition-colors" />{" "}
                                  Enable Account
                                </DropdownMenuItem>
                              )}

                              {user.status !== "banned" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Ban",
                                      "Ban User",
                                      "This user will be banned from the NutriBin ecosystem. This action is irreversible and recorded in the security logs.",
                                      user,
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-red-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-red-600"
                                >
                                  <ShieldAlert className="mr-3 h-5 w-5 text-red-600 group-focus:text-white transition-colors" />{" "}
                                  Ban User
                                </DropdownMenuItem>
                              )}
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
          <div className="px-8 py-6 border-t border-[#E9E9E9] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F6F7F4]/30">
            <span className="text-[10px] font-black text-[#4F6F52]/40 uppercase tracking-[0.2em]">
              Customer Inventory: {filteredUsers.length} Entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-[#E9E9E9] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm cursor-pointer"
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
                className="h-10 w-10 p-0 rounded-xl border-[#E9E9E9] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm cursor-pointer"
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

export default Users;
