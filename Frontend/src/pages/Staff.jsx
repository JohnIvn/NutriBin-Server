import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AdminModal from "@/components/partials/adminModal";
import DialogBox from "@/components/partials/confirmBox";
import ConfirmBox from "@/components/partials/confirmBox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Staff() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [confirmType, setConfirmType] = useState("");
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

  const onConfirm = async () => {
    if (!selectedStaff || !confirmInformation.mode) return;

    try {
      setActionLoading(true);
      const mode = confirmInformation.mode.toLowerCase();

      if (mode === "disable") {
        await handleDisableStaff(selectedStaff.staff_id);
      } else if (mode === "enable") {
        await handleEnableStaff(selectedStaff.staff_id);
      } else if (mode === "delete") {
        await handleDeleteStaff(selectedStaff.staff_id);
      }

      closeConfirm();
      setSelectedStaff(null);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const role = /* Get this from context */ "admin";

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: {
      count: "10",
      term: "",
    },
  });

  // Fetch staff data from backend
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

      console.log("Staff API Response:", response.data);

      if (response.data.ok) {
        console.log("Staff data received:", response.data.staff);
        setStaffList(response.data.staff || []);
      } else {
        console.error("API returned ok: false");
        toast.error("Failed to fetch staff list");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        "Failed to load staff data: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisableStaff = async (staffId) => {
    try {
      const response = await Requests({
        url: `/management/staff/${staffId}/disable`,
        method: "PATCH",
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Staff member disabled successfully");
        await fetchStaff(); // Refresh the list
      } else {
        toast.error("Failed to disable staff member");
      }
    } catch (error) {
      console.error("Error disabling staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to disable staff member"
      );
    }
  };

  const handleEnableStaff = async (staffId) => {
    try {
      const response = await Requests({
        url: `/management/staff/${staffId}/enable`,
        method: "PATCH",
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Staff member enabled successfully");
        await fetchStaff(); // Refresh the list
      } else {
        toast.error("Failed to enable staff member");
      }
    } catch (error) {
      console.error("Error enabling staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to enable staff member"
      );
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      const response = await Requests({
        url: `/management/staff/${staffId}`,
        method: "DELETE",
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Staff member deleted successfully");
        await fetchStaff(); // Refresh the list
      } else {
        toast.error("Failed to delete staff member");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete staff member"
      );
    }
  };

  const displayModal = (mode, staff = null) => {
    setShowModal(true);
    setModalMode(mode);
    setSelectedStaff(staff);
  };

  const displayConfirm = (mode, title, description, staff) => {
    setShowConfirm(true);
    setSelectedStaff(staff);
    setConfirmInformation({
      mode: mode,
      title: title,
      description: description,
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  const entriesCount = parseInt(filterForm.watch("count") || "10");

  function filterSubmit() {
    console.log("Filtration");
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Filter staff based on search term
  const filteredStaff = staffList.filter((staff) => {
    const searchTerm = filterForm.watch("term").toLowerCase();
    if (!searchTerm) return true;

    return (
      staff.staff_id.toLowerCase().includes(searchTerm) ||
      staff.first_name.toLowerCase().includes(searchTerm) ||
      staff.last_name.toLowerCase().includes(searchTerm) ||
      staff.email.toLowerCase().includes(searchTerm)
    );
  });

  // Paginate filtered staff
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount
  );

  const totalPages = Math.ceil(filteredStaff.length / entriesCount);

  console.log("Staff counts:", {
    total: staffList.length,
    filtered: filteredStaff.length,
    paginated: paginatedStaff.length,
    currentPage,
    entriesCount,
    totalPages,
  });

  return (
    <>
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
      <section className="relative flex flex-col h-auto my-auto pb-4">
        <h1 className="text-3xl md:text-5xl font-medium my-4 text-center">
          Staff Management
        </h1>
        <Table className={"flex flex-col h-auto w-auto xl:w-5xl border-2"}>
          <TableCaption className={"flex w-full justify-between px-2"}>
            <Form {...filterForm}>
              <form
                onSubmit={filterForm.handleSubmit(filterSubmit)}
                className="flex justify-between items-center gap-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <p className="font-medium text-xs md:text-sm">Show</p>

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
                            <SelectTrigger className="w-auto text-xs md:text-sm">
                              <SelectValue placeholder="Select count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Entries</SelectLabel>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <p className="font-medium text-xs md:text-sm">Entries</p>
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Search"
                            className={
                              "border border-secondary-foreground w-auto md:w-lg"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
            <Button
              onClick={() => displayModal("default")}
              className={
                "bg-secondary hover:bg-secondary-foreground cursor-pointer"
              }
            >
              +<span className="hidden md:flex">Add Staff</span>
            </Button>
          </TableCaption>
          <TableHeader>
            <TableRow className={"flex items-center"}>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Staff ID
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                First Name
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Last Name
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Created At
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Status
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className={"flex items-center justify-center"}>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading staff data...
                </TableCell>
              </TableRow>
            ) : paginatedStaff.length === 0 ? (
              <TableRow className={"flex items-center justify-center"}>
                <TableCell colSpan={6} className="text-center py-8">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              paginatedStaff.map((staff, index) => (
                <TableRow className={"flex items-center"} key={staff.staff_id}>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {staff.staff_id}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {staff.first_name}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {staff.last_name}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {formatDate(staff.date_created)}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    <p
                      className={`px-3 py-1 rounded-sm ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {staff.status.charAt(0).toUpperCase() +
                        staff.status.slice(1)}
                    </p>
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className={"text-white"}
                          variant="outline"
                          aria-label="Open menu"
                          size="icon-sm"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          {role === "admin" && (
                            <DropdownMenuItem
                              onClick={() => displayModal("edit", staff)}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {staff.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                displayConfirm(
                                  "Disable",
                                  "Disabling Account",
                                  "Disabled account won't be able to access any staff privileges! Are you sure you want to disable this account?",
                                  staff
                                )
                              }
                            >
                              Disable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                displayConfirm(
                                  "Enable",
                                  "Enabling Account",
                                  "This will restore staff privileges to this account. Are you sure you want to enable this account?",
                                  staff
                                )
                              }
                            >
                              Enable
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              displayConfirm(
                                "Delete",
                                "Account Deletion",
                                "This will permanently delete the account! Are you sure you want to delete this account?",
                                staff
                              )
                            }
                          >
                            Delete
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </>
  );
}

export default Staff;
