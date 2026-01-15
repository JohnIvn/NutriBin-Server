import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MoreHorizontalIcon,
  Search,
  CheckCircle2,
  Wrench,
  XCircle,
} from "lucide-react";

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { machinesFilter } from "@/schema/machines";
import ConfirmBox from "@/components/partials/confirmBox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Machines() {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInformation, setConfirmInformation] = useState({
    title: "",
    description: "",
    mode: "",
  });

  const [repairList, setRepairList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const displayConfirm = (mode, title, description, repair = null) => {
    setSelectedRepair(repair);
    setShowConfirm(true);
    setConfirmInformation({ mode, title, description });
  };

  const onConfirm = async () => {
    if (!selectedRepair) return;

    try {
      setActionLoading(true);
      let endpoint = "";
      let statusValue = "";

      if (confirmInformation.mode === "Resolve") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "active";
      } else if (confirmInformation.mode === "Accept") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "active";
      } else if (confirmInformation.mode === "Reject") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "cancelled";
      }

      if (endpoint) {
        const response = await Requests({
          url: endpoint,
          method: "PATCH",
          data: { status: statusValue },
          credentials: true,
        });

        if (response.data.ok) {
          toast.success(
            `Repair ${confirmInformation.mode.toLowerCase()}ed successfully`
          );
          fetchRepairs();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/repair",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setRepairList(response.data.repairs || []);
      }
    } catch {
      toast.error("Failed to load repair data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filterForm = useForm({
    resolver: zodResolver(machinesFilter),
    defaultValues: {
      count: "10",
      term: "",
    },
  });

  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const filteredRepairs = repairList.filter((repair) => {
    const searchTerm = filterForm.watch("term").toLowerCase();
    if (!searchTerm) return true;

    const fullName =
      repair.first_name && repair.last_name
        ? `${repair.first_name} ${repair.last_name}`.toLowerCase()
        : "";

    return (
      repair.repair_id.toLowerCase().includes(searchTerm) ||
      repair.machine_id?.toLowerCase().includes(searchTerm) ||
      repair.description?.toLowerCase().includes(searchTerm) ||
      false ||
      fullName.includes(searchTerm)
    );
  });

  const paginatedRepairs = filteredRepairs.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount
  );
  const totalPages = Math.ceil(filteredRepairs.length / entriesCount);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  function navigateModules(id) {
    navigate(`/machines/${id}`);
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Machine Repairs
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Full facility machine maintenance logs.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden w-full">
          <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
            <Form {...filterForm}>
              <form className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Search global records..."
                            className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] w-full h-11 transition-all duration-200"
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
                          defaultValue={field.value}
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
              </form>
            </Form>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 pl-6 uppercase text-xs tracking-wider">
                    Request ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Machine ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    User ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-6 uppercase text-xs tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium">
                          Fetching Repair Records...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRepairs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-64 text-center text-gray-400 font-medium"
                    >
                      No repair requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRepairs.map((repair) => (
                    <TableRow
                      key={repair.repair_id}
                      className="hover:bg-gray-50/30 transition-all cursor-pointer group"
                      onClick={() => navigateModules(repair.repair_id)}
                    >
                      <TableCell className="font-mono text-[#739072] font-bold pl-6">
                        {repair.repair_id.substring(0, 8)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {repair.machine_id || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {repair.user_id || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {repair.first_name && repair.last_name
                          ? `${repair.first_name} ${repair.last_name}`
                          : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm max-w-xs">
                        {repair.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                            repair.repair_status === "active"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : repair.repair_status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-orange-50 text-orange-700 border border-orange-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              repair.repair_status === "active"
                                ? "bg-green-500 animate-pulse"
                                : repair.repair_status === "cancelled"
                                ? "bg-red-500"
                                : "bg-orange-500"
                            }`}
                          />
                          {repair.repair_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 font-medium text-sm">
                        {formatDate(repair.date_created)}
                      </TableCell>
                      <TableCell
                        className="text-right pr-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {repair.repair_status === "cancelled" ? (
                          <span className="text-xs text-gray-400 italic">
                            No actions
                          </span>
                        ) : (
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-[#3A4D39] rounded-full hover:bg-[#4F6F52]/10 hover:text-[#4F6F52] transition-colors cursor-pointer"
                              >
                                <MoreHorizontalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-52 p-2 shadow-2xl border-gray-100"
                            >
                              <DropdownMenuLabel className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                Maintenance Ops
                              </DropdownMenuLabel>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Resolve",
                                      "Resolve Report",
                                      "Mark this repair request as resolved.",
                                      repair
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-green-600 focus:text-white font-medium rounded-md py-2 transition-colors mb-1"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
                                  Resolve
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Accept",
                                      "Accepting Report",
                                      "Accept this repair request and begin work.",
                                      repair
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-[#4F6F52] focus:text-white font-medium rounded-md py-2 transition-colors mb-1"
                                >
                                  <Wrench className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
                                  Accept
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    displayConfirm(
                                      "Reject",
                                      "Rejecting Report",
                                      "Reject this repair request.",
                                      repair
                                    )
                                  }
                                  className="group cursor-pointer focus:bg-red-600 focus:text-white font-medium rounded-md py-2 transition-colors"
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" />{" "}
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
              Total Records: {filteredRepairs.length}
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
                  <div className="flex items-center px-5 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-[#4F6F52] shadow-sm tracking-tighter">
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

export default Machines;
