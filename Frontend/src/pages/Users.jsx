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
    currentPage * entriesCount
  );
  const totalPages = Math.ceil(filteredUsers.length / entriesCount);

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
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

      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Oversee customer accounts and user records.
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
                            placeholder="Filter by ID, name, or email..."
                            className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] text-[#4F6F52] focus-visible:border-[#4F6F52] w-full h-11 transition-all duration-200"
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
                            <SelectTrigger className="w-20 h-11 border-gray-200 focus:ring-[#4F6F52] font-bold text-[#4F6F52]">
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
                    USER ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    FULL NAME
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    JOINED DATE
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    ACCOUNT STATUS
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-6">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium">
                          Fetching User Records...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-64 text-center text-gray-400 font-medium"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.customer_id}
                      className="hover:bg-gray-50/30 transition-all"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-bold pl-6">
                        {user.customer_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-2">
                          <span className="font-semibold text-gray-900 leading-none mb-1">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {user.email || "user@nutribin.system"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium italic">
                        {formatDate(user.date_created)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                            user.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : user.status === "banned"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-gray-50 text-gray-700 border border-gray-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "active"
                                ? "bg-green-500 animate-pulse"
                                : user.status === "banned"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          />
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full text-[#3A4D39] hover:bg-[#4F6F52]/10 hover:text-[#4F6F52] transition-colors cursor-pointer"
                            >
                              <MoreHorizontalIcon className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 p-2 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                              Operations
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                              {user.status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Disable",
                                      "Restrict Access",
                                      "This user will immediately lose access to their account.",
                                      user
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-amber-600 focus:text-white rounded-md py-2 transition-colors"
                                >
                                  <ShieldAlert className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
                                  Disable Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Enable",
                                      "Restore Access",
                                      "This user will regain access to their account.",
                                      user
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-green-600 focus:text-white rounded-md py-2 transition-colors"
                                >
                                  <UserCheck className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
                                  Enable Account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  displayConfirm(
                                    "Delete",
                                    "Permanently Remove",
                                    "Warning: This action cannot be undone.",
                                    user
                                  )
                                }
                                className="group cursor-pointer focus:bg-red-600 focus:text-white rounded-md py-2 transition-colors"
                              >
                                <UserCheck className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
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
              Total Users: {filteredUsers.length}
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

export default Users;
