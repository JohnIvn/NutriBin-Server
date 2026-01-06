<<<<<<< HEAD
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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { machinesFilter } from "@/schema/machines";
import { useNavigate } from "react-router-dom";
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
    repairId: null,
    status: null,
  });
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filterForm = useForm({
    resolver: zodResolver(machinesFilter),
    defaultValues: {
      count: "10",
      term: "",
    },
  });

  const displayConfirm = (
    mode,
    title,
    description,
    repairId,
    status = null
  ) => {
    setShowConfirm(true);
    setConfirmInformation({
      mode: mode,
      title: title,
      description: description,
      repairId: repairId,
      status: status,
    });
  };

  const onConfirm = () => {
    const { mode, repairId, status } = confirmInformation;

    if (mode === "status") {
      handleStatusUpdate(repairId, status);
    } else if (mode === "delete") {
      handleDeleteRepair(repairId);
    }

    closeConfirm();
  };

  const closeConfirm = () => {
    setShowConfirm(false);
    setConfirmInformation({
      title: "",
      description: "",
      mode: "",
      repairId: null,
      status: null,
    });
  };

  const entriesCount = parseInt(filterForm.watch("count") || "10");
  const searchTerm = filterForm.watch("term")?.toLowerCase() || "";

  const filteredRepairs = repairs.filter((repair) => {
    if (!searchTerm) return true;

    const haystack = [
      repair.repair_id,
      repair.machine_id,
      repair.user_id,
      repair.repair_status,
    ]
      .filter(Boolean)
      .map((value) => value.toString().toLowerCase());

    return haystack.some((value) => value.includes(searchTerm));
  });

  const paginatedRepairs = filteredRepairs.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRepairs.length / entriesCount)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesCount, searchTerm]);

  useEffect(() => {
    fetchRepairs();
  }, []);

  async function fetchRepairs() {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/repair",
        method: "GET",
        credentials: true,
      });

      if (response.data.ok) {
        setRepairs(response.data.repairs);
      }
    } catch (error) {
      console.error("Error fetching repairs:", error);
      toast.error("Failed to load repair data");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(repairId, status) {
    try {
      const response = await Requests({
        url: `/management/repair/${repairId}/status`,
        method: "PATCH",
        data: { status },
        credentials: true,
      });

      if (response.data.ok) {
        toast.success(`Repair ${status} successfully`);
        fetchRepairs();
      }
    } catch (error) {
      console.error("Error updating repair status:", error);
      toast.error("Failed to update repair status");
    }
  }

  async function handleDeleteRepair(repairId) {
    try {
      const response = await Requests({
        url: `/management/repair/${repairId}`,
        method: "DELETE",
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Repair deleted successfully");
        fetchRepairs();
      }
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast.error("Failed to delete repair");
    }
  }

  function filterSubmit() {
    console.log("Filtration");
  }

  function navigateModules(id) {
    navigate(`/machines/${id}`);
  }

  return (
    <>
      {showConfirm && (
        <ConfirmBox
          mode={confirmInformation.modal}
          cancel={closeConfirm}
          confirm={onConfirm}
          description={confirmInformation.description}
          title={confirmInformation.title}
        />
      )}
      <section className="flex flex-col h-auto my-auto pb-4">
        <h1 className="text-3xl md:text-5xl font-medium my-4 text-center">
          Machine Repairs
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

=======
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  MoreHorizontalIcon, 
  Search, 
  CheckCircle2, 
  Wrench, 
  XCircle 
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { machinesFilter } from "@/schema/machines"
import ConfirmBox from "@/components/partials/confirmBox"

function Machines() {
  const navigate = useNavigate()

  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmInformation, setConfirmInformation] = useState({
    title: "",
    description: "",
    mode: ""
  })

  const [currentPage, setCurrentPage] = useState(1)

  const displayConfirm = (mode, title, description) => {
    setShowConfirm(true)
    setConfirmInformation({ mode, title, description })
  }

  const onConfirm = () => {
    setShowConfirm(false)
  }
  
  const closeConfirm = () => {
    setShowConfirm(false)
  }

  const filterForm = useForm({
    resolver: zodResolver(machinesFilter),
    defaultValues: {
      count: "10",
      term: "",
    },
  });

  const entriesCount = parseInt(filterForm.watch("count") || "10");
  const totalPages = 1; 

  function navigateModules(id) {
    navigate(`/machines/${id}`)
  }

  return (
    <div className="w-full bg-[#FDF8F1] min-h-screen pb-10">
      {showConfirm && (
        <ConfirmBox 
          mode={confirmInformation.mode} 
          cancel={closeConfirm} 
          confirm={onConfirm} 
          description={confirmInformation.description} 
          title={confirmInformation.title} 
        />
      )}

      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#CD5C08] pl-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Machine Repairs</h1>
            <p className="text-sm text-muted-foreground italic mt-1">Full facility machine maintenance logs.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden w-full">
          
          <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
            <Form {...filterForm}>
              <form className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#CD5C08] z-10" />
                  <FormField
                    control={filterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input 
                            placeholder="Search global records..." 
                            className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#CD5C08] focus-visible:border-[#CD5C08] w-full h-11 transition-all duration-200" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Show</span>
>>>>>>> 37ba42f (altered designs and fixed responsiveness)
                  <FormField
                    control={filterForm.control}
                    name="count"
                    render={({ field }) => (
                      <FormItem>
<<<<<<< HEAD
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
=======
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-20 h-11 border-gray-200 focus:ring-[#CD5C08]">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
>>>>>>> 37ba42f (altered designs and fixed responsiveness)
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
<<<<<<< HEAD

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
          </TableCaption>
          <TableHeader>
            <TableRow className={"flex items-center"}>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Repair ID
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Machine ID
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                User ID
              </TableHead>
              <TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">
                Date
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
              <TableRow className="flex items-center">
                <TableCell
                  colSpan={6}
                  className="flex flex-1 h-10 items-center justify-center text-xs md:text-sm"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : repairs.length === 0 ? (
              <TableRow className="flex items-center">
                <TableCell
                  colSpan={6}
                  className="flex flex-1 h-10 items-center justify-center text-xs md:text-sm"
                >
                  No repairs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRepairs.map((repair) => (
                <TableRow
                  key={repair.repair_id}
                  className="flex items-center cursor-pointer"
                  onClick={() => navigateModules(repair.repair_id)}
                >
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {repair.repair_id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {repair.machine_id || "N/A"}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {repair.user_id ? repair.user_id.substring(0, 8) : "N/A"}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    {new Date(repair.date_created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        repair.repair_status === "active"
                          ? "bg-green-100 text-green-800"
                          : repair.repair_status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {repair.repair_status}
                    </span>
                  </TableCell>
                  <TableCell
                    className="flex flex-1 h-10 items-center text-xs md:text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="text-white"
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
                          <DropdownMenuItem
                            onClick={() =>
                              displayConfirm(
                                "status",
                                "Mark as Active",
                                "Are you sure you want to mark this repair as active?",
                                repair.repair_id,
                                "active"
                              )
                            }
                          >
                            Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              displayConfirm(
                                "status",
                                "Postpone Repair",
                                "Are you sure you want to postpone this repair?",
                                repair.repair_id,
                                "postponed"
                              )
                            }
                          >
                            Postpone
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              displayConfirm(
                                "status",
                                "Cancel Repair",
                                "Are you sure you want to cancel this repair?",
                                repair.repair_id,
                                "cancelled"
                              )
                            }
                          >
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              displayConfirm(
                                "delete",
                                "Delete Repair",
                                "Are you sure you want to permanently delete this repair? This action cannot be undone.",
                                repair.repair_id
                              )
                            }
                            className="text-red-600"
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
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
        </Table>
      </section>
    </>
  );
}

export default Machines;
=======
                  <span className="text-sm font-medium text-gray-500 text-nowrap">per page</span>
                </div>
              </form>
            </Form>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 pl-6 uppercase text-xs tracking-wider">Request ID</TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">Machine ID</TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">Owner</TableHead>
                  <TableHead className="font-bold text-gray-700 w-[30%] uppercase text-xs tracking-wider">Description</TableHead>
                  <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider">Date</TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-6 uppercase text-xs tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50/30 transition-all cursor-pointer group"
                    onClick={() => navigateModules(index)}
                  >
                    <TableCell className="font-mono text-[#CD5C08] font-bold pl-6">#R3211</TableCell>
                    <TableCell className="font-semibold text-gray-900">1</TableCell>
                    <TableCell className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-200">James Jones</TableCell>
                    <TableCell className="text-gray-600 italic leading-relaxed">Broken Blender Motor</TableCell>
                    <TableCell className="text-gray-500 font-medium text-sm">12-12-2023</TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full hover:bg-[#CD5C08]/10 hover:text-[#CD5C08] transition-colors cursor-pointer"
                          >
                            <MoreHorizontalIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 p-2 shadow-2xl border-gray-100">
                          <DropdownMenuLabel className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Maintenance Ops</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => displayConfirm("Resolve", "Resolve Report", "...")} 
                              className="group cursor-pointer focus:bg-green-600 focus:text-white font-medium rounded-md py-2 transition-colors mb-1"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" /> Resolve
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => displayConfirm("Accept", "Accepting Report", "...")} 
                              className="group cursor-pointer focus:bg-[#CD5C08] focus:text-white font-medium rounded-md py-2 transition-colors mb-1"
                            >
                              <Wrench className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" /> Accept
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => displayConfirm("Reject", "Rejecting Report", "...")} 
                              className="group cursor-pointer focus:bg-red-600 focus:text-white font-medium rounded-md py-2 transition-colors"
                            >
                              <XCircle className="mr-2 h-4 w-4 text-gray-500 group-focus:text-white transition-colors" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="p-5 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Records: {entriesCount}
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={`text-[#CD5C08] hover:text-white bg-white hover:bg-[#CD5C08] border-[#CD5C08] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${
                      currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"
                    }`}
                  />
                </PaginationItem>
                
                <PaginationItem>
                  <div className="flex items-center px-5 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-[#CD5C08] shadow-sm tracking-tighter">
                    {currentPage} / {totalPages || 1}
                  </div>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={`text-[#CD5C08] hover:text-white bg-white hover:bg-[#CD5C08] border-[#CD5C08] transition-colors shadow-sm h-10 px-4 rounded-md flex items-center ${
                      currentPage === (totalPages || 1) ? "opacity-50 pointer-events-none" : "cursor-pointer"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Machines;
>>>>>>> 37ba42f (altered designs and fixed responsiveness)
