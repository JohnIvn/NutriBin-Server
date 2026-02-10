import React, { useState, useEffect } from "react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serialFilter } from "@/schema/serial";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Search,
  Key,
  MoreHorizontalIcon,
  Plus,
  Trash2,
  Ban,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Serial() {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionStates, setActionStates] = useState({});

  const filterForm = useForm({
    resolver: zodResolver(serialFilter),
    defaultValues: { count: "10", term: "" },
  });

  const createForm = useForm({
    defaultValues: { numbers: "", alphanumeric: "" },
  });

  const fetchSerials = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/serials",
        method: "GET",
        credentials: true,
      });

      if (response.data.ok) {
        setSerials(response.data.serials || []);
      } else {
        toast.error("Failed to fetch serials");
      }
    } catch (error) {
      console.error("Error fetching serials:", error);
      toast.error("An error occurred while fetching serials");
    } finally {
      setLoading(false);
    }
  };

  const onCreateSerial = async (data) => {
    try {
      setIsSubmitting(true);
      // Combine the three parts into the serial number format
      const serialNumber = `Serial-${data.numbers}-${data.alphanumeric}`;
      const response = await Requests({
        url: "/management/serials",
        method: "POST",
        credentials: true,
        data: { serial_number: serialNumber },
      });

      if (response.data.ok) {
        toast.success("Serial created successfully");
        createForm.reset();
        setOpenDialog(false);
        fetchSerials();
      } else {
        toast.error(response.data.message || "Failed to create serial");
      }
    } catch (error) {
      console.error("Error creating serial:", error);
      toast.error("An error occurred while creating serial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteSerial = async (serialId) => {
    try {
      setActionStates((prev) => ({ ...prev, [serialId]: "deleting" }));
      const response = await Requests({
        url: `/management/serials/${serialId}`,
        method: "DELETE",
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Serial deleted successfully");
        fetchSerials();
      } else {
        toast.error(response.data.message || "Failed to delete serial");
      }
    } catch (error) {
      console.error("Error deleting serial:", error);
      toast.error("An error occurred while deleting serial");
    } finally {
      setActionStates((prev) => {
        const newState = { ...prev };
        delete newState[serialId];
        return newState;
      });
    }
  };

  const onSetInactive = async (serialId) => {
    try {
      setActionStates((prev) => ({ ...prev, [serialId]: "inactivating" }));
      const response = await Requests({
        url: `/management/serials/${serialId}`,
        method: "PATCH",
        credentials: true,
        data: { is_active: false },
      });

      if (response.data.ok) {
        toast.success("Serial marked as inactive");
        fetchSerials();
      } else {
        toast.error(response.data.message || "Failed to update serial");
      }
    } catch (error) {
      console.error("Error updating serial:", error);
      toast.error("An error occurred while updating serial");
    } finally {
      setActionStates((prev) => {
        const newState = { ...prev };
        delete newState[serialId];
        return newState;
      });
    }
  };

  useEffect(() => {
    fetchSerials();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const entriesCount = parseInt(filterForm.watch("count") || "10");
  const filteredSerials = serials.filter((serial) => {
    const searchTerm = filterForm.watch("term").toLowerCase();
    if (!searchTerm) return true;
    return (
      serial.serial_number.toLowerCase().includes(searchTerm) ||
      (serial.machine_id &&
        serial.machine_id.toLowerCase().includes(searchTerm))
    );
  });

  const paginatedSerials = filteredSerials.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filteredSerials.length / entriesCount);

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Machine Serials
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Manage and view all registered machine serial numbers.
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white gap-2 h-11">
                <Plus className="h-5 w-5" />
                Add Serial
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-[#4F6F52] border-2">
              <DialogHeader className="border-b-2 border-[#4F6F52] pb-4 mb-2">
                <DialogTitle className="text-[#4F6F52] text-2xl font-bold">
                  Create New Serial Number
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add a new machine serial number to the system.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form
                  onSubmit={createForm.handleSubmit(onCreateSerial)}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-[#4F6F52] block mb-3">
                      Serial Number Format: Serial-{"(13 numbers)"}-(9 alphanumeric)
                    </label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-gray-700 mb-2">Serial</div>
                        <div className="h-11 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md flex items-center text-gray-500 font-medium">
                          Serial
                        </div>
                      </div>
                      <span className="text-xl font-bold text-gray-400 mb-2">-</span>
                      <FormField
                        control={createForm.control}
                        name="numbers"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <label className="text-sm font-medium text-gray-700">13 Numbers</label>
                            <FormControl>
                              <Input
                                placeholder="0000000000000"
                                maxLength="13"
                                pattern="\d{13}"
                                className="border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="text-xl font-bold text-gray-400 mb-2">-</span>
                      <FormField
                        control={createForm.control}
                        name="alphanumeric"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <label className="text-sm font-medium text-gray-700">9 Alphanumeric</label>
                            <FormControl>
                              <Input
                                placeholder="ABCD12345"
                                maxLength="9"
                                className="border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] uppercase"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^A-Z0-9]/g, '').slice(0, 9).toUpperCase();
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                      className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Serial"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                            placeholder="Filter by serial number..."
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
                          onValueChange={(val) => {
                            field.onChange(val);
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
                    SERIAL NUMBER
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    MACHINE ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    STATUS
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    USAGE
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    DATE CREATED
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-6">
                    ACTIONS
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
                          Fetching Serial Records...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedSerials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-64 text-center text-gray-400 font-medium"
                    >
                      No serial numbers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSerials.map((serial) => (
                    <TableRow
                      key={serial.machine_serial_id}
                      className="hover:bg-gray-50/30 transition-all"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-bold pl-6">
                        {serial.serial_number}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {serial.machine_id || "Not Linked"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                            serial.is_active
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              serial.is_active
                                ? "bg-green-500 animate-pulse"
                                : "bg-red-500"
                            }`}
                          />
                          {serial.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                            serial.is_used
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-gray-50 text-gray-700 border border-gray-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              serial.is_used ? "bg-blue-500" : "bg-gray-500"
                            }`}
                          />
                          {serial.is_used ? "Used" : "Available"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium italic">
                        {formatDate(serial.date_created)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {!serial.is_used ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-[#3A4D39] hover:bg-[#4F6F52]/10 hover:text-[#4F6F52] transition-colors cursor-pointer"
                              >
                                <MoreHorizontalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  onSetInactive(serial.machine_serial_id)
                                }
                                disabled={
                                  actionStates[serial.machine_serial_id] ===
                                  "inactivating"
                                }
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Set Inactive</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onDeleteSerial(serial.machine_serial_id)
                                }
                                disabled={
                                  actionStates[serial.machine_serial_id] ===
                                  "deleting"
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="p-5 border-t border-gray-50 bg-gray-50/30">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`cursor-pointer ${
                        currentPage === 1
                          ? "opacity-50 pointer-events-none"
                          : "hover:bg-[#4F6F52] hover:text-white"
                      }`}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm font-medium text-gray-500 px-4">
                      Page <span className="text-[#4F6F52]">{currentPage}</span>{" "}
                      of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={`cursor-pointer ${
                        currentPage === totalPages
                          ? "opacity-50 pointer-events-none"
                          : "hover:bg-[#4F6F52] hover:text-white"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Serial;
