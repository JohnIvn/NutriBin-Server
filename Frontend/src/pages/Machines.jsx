import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Filter,
  Calendar,
  History,
  ShieldAlert,
  HardDrive,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

      if (confirmInformation.mode === "Postpone") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "postponed";
      } else if (confirmInformation.mode === "Accept") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "accepted";
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
          const pastTense = {
            Accept: "accepted",
            Postpone: "postponed",
            Reject: "rejected",
          };
          toast.success(
            `Repair ${pastTense[confirmInformation.mode] || "updated"} successfully`,
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

  const term = filterForm.watch("term");
  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const filteredRepairs = repairList.filter((repair) => {
    const searchTerm = term.toLowerCase();
    if (!searchTerm) return true;

    const fullName =
      repair.first_name && repair.last_name
        ? `${repair.first_name} ${repair.last_name}`.toLowerCase()
        : "";

    return (
      repair.repair_id.toLowerCase().includes(searchTerm) ||
      repair.machine_id?.toLowerCase().includes(searchTerm) ||
      repair.description?.toLowerCase().includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });

  const paginatedRepairs = filteredRepairs.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filteredRepairs.length / entriesCount);

  const stats = {
    pending: repairList.filter((r) => r.status === "active").length,
    active: repairList.filter((r) => r.status === "accepted").length,
    total: repairList.length,
  };

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase tracking-widest">
              <Wrench className="w-4 h-4" />
              Service Registry
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Maintenance <span className="text-[#4F6F52]">Nexus</span>
            </h1>
            <p className="text-gray-400 font-medium">
              Coordinate logistics and system restorations across the fleet.
            </p>
          </div>

          <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Awaiting
              </span>
              <span className="text-lg font-black text-[#4F6F52]">
                {stats.pending}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                In-Service
              </span>
              <span className="text-lg font-black text-amber-500">
                {stats.active}
              </span>
            </div>
            <div className="flex flex-col px-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Capacity
              </span>
              <span className="text-lg font-black text-gray-800">
                {stats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative z-10">
          <Form {...filterForm}>
            <form className="flex flex-col md:flex-row gap-4 w-full">
              <FormField
                control={filterForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
                        <Input
                          {...field}
                          placeholder="Search by ID, Serial, or Client Name..."
                          className="pl-12 h-14 bg-[#FAF9F6] border-none rounded-2xl text-base font-medium placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/50"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 w-full md:w-auto">
                <FormField
                  control={filterForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-32">
                      <FormControl>
                        <div className="relative">
                          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            {...field}
                            className="w-full h-14 pl-10 pr-4 bg-[#FAF9F6] border-none rounded-2xl text-sm font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-[#4F6F52]/50"
                          >
                            <option value="10">10 Rows</option>
                            <option value="20">20 Rows</option>
                            <option value="50">50 Rows</option>
                          </select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Repairs List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-10 h-10 border-4 border-[#4F6F52]/20 border-t-[#4F6F52] rounded-full animate-spin" />
                <p className="text-xs font-bold text-[#4F6F52] uppercase tracking-[0.3em]">
                  Synching Logs
                </p>
              </div>
            ) : paginatedRepairs.length > 0 ? (
              paginatedRepairs.map((repair, idx) => (
                <motion.div
                  key={repair.repair_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#4F6F52]/5 hover:border-[#4F6F52]/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* ID & Type */}
                    <div className="flex items-center gap-5 lg:w-1/4">
                      <div
                        className={`p-4 rounded-2xl ${
                          repair.status === "active"
                            ? "bg-amber-50 text-amber-600"
                            : repair.status === "accepted"
                              ? "bg-emerald-50 text-emerald-600"
                              : repair.status === "cancelled"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">
                          REQ-{repair.repair_id.slice(0, 8)}
                        </p>
                        <h3 className="text-lg font-black text-[#1A1A1A] truncate">
                          {repair.first_name} {repair.last_name}
                        </h3>
                        <p className="text-xs font-mono text-gray-400">
                          Unit: {repair.machine_id?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div className="flex flex-wrap gap-6 lg:flex-1">
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Issue Description
                        </span>
                        <p className="text-sm font-medium text-gray-600 line-clamp-1">
                          {repair.description}
                        </p>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Filed On
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <Calendar className="w-4 h-4 text-[#4F6F52]" />
                          {new Date(repair.date_created).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Stage
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            repair.status === "active"
                              ? "bg-amber-100 text-amber-700"
                              : repair.status === "accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : repair.status === "cancelled"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              repair.status === "active"
                                ? "bg-amber-500 animate-pulse"
                                : repair.status === "accepted"
                                  ? "bg-emerald-500"
                                  : repair.status === "cancelled"
                                    ? "bg-rose-500"
                                    : "bg-gray-400"
                            }`}
                          />
                          {repair.status === "active"
                            ? "active"
                            : repair.status}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 lg:w-48">
                      <button
                        onClick={() =>
                          navigate(`/machine/${repair.machine_id}`)
                        }
                        className="p-3 rounded-xl bg-[#FAF9F6] text-gray-400 hover:text-[#4F6F52] hover:bg-[#4F6F52]/10 transition-all flex items-center gap-2 group/btn"
                      >
                        <span className="text-xs font-bold hidden group-hover/btn:block">
                          View Unit
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          disabled={["accepted", "cancelled"].includes(
                            repair.status,
                          )}
                        >
                          <button
                            disabled={["accepted", "cancelled"].includes(
                              repair.status,
                            )}
                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                          >
                            {["accepted", "cancelled"].includes(
                              repair.status,
                            ) ? (
                              <Ban className="w-5 h-5 text-rose-300" />
                            ) : (
                              <MoreHorizontal className="w-5 h-5" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-2xl p-2 border-gray-100"
                        >
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2">
                            Workflow Actions
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() =>
                                displayConfirm(
                                  "Accept",
                                  "Authorize Restoration",
                                  "This unit will be moved to active maintenance queue.",
                                  repair,
                                )
                              }
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm">
                                Accept Request
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                displayConfirm(
                                  "Postpone",
                                  "Defer Maintenance",
                                  "Notify the client that service will be delayed.",
                                  repair,
                                )
                              }
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-amber-50 focus:text-amber-600 cursor-pointer"
                            >
                              <Clock className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm">
                                Postpone
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-gray-50" />
                            <DropdownMenuItem
                              onClick={() =>
                                displayConfirm(
                                  "Reject",
                                  "Hard Rejection",
                                  "Permanently close this maintenance ticket.",
                                  repair,
                                )
                              }
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm text-rose-500">
                                Reject
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    No registry entries found
                  </h3>
                  <p className="text-sm text-gray-400">
                    Try adjusting your filters or search term.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-4">
              Showing Page {currentPage} of {totalPages}
            </p>
            <Pagination className="w-auto mx-0">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-3 rounded-xl border-none font-bold transition-all ${currentPage === 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-[#4F6F52]/10 text-[#4F6F52]"}`}
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-xl border-none font-bold transition-all ${currentPage === totalPages ? "opacity-20 cursor-not-allowed" : "hover:bg-[#4F6F52]/10 text-[#4F6F52]"}`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

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
    </div>
  );
}

export default Machines;
