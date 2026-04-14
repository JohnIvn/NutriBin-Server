//Machine Serial ID Page
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
  DropdownMenuLabel,
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
  QrCode,
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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const filterForm = useForm({
    resolver: zodResolver(serialFilter),
    defaultValues: { count: "10", term: "" },
  });

  const createForm = useForm({
    defaultValues: { numbers: "", alphanumeric: "", model: "NB-100" },
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

  const fetchQRCode = async (serialNumber, machineId) => {
    try {
      setQrLoading(true);
      const response = await Requests({
        url: `/qr/generate/${encodeURIComponent(serialNumber)}`,
        method: "GET",
      });

      if (response.data.ok) {
        setQrData({
          ...response.data,
          machineId: machineId,
        });
        setQrModalOpen(true);
      } else {
        toast.error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("An error occurred while generating QR code");
    } finally {
      setQrLoading(false);
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
        data: { serial_number: serialNumber, model: data.model },
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
      (serial.model && serial.model.toLowerCase().includes(searchTerm)) ||
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
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold uppercase tracking-wider">
              <Key className="h-3.5 w-3.5" />
              Hardware Identity
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              Machine <span className="text-[#4F6F52]">Serials</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Manage and view all registered machine serial numbers. Control
              hardware provisioning and monitor deployment status.
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white shadow-xl shadow-[#4F6F52]/20 cursor-pointer transition-all active:scale-95 px-8 h-14 rounded-2xl font-bold text-lg">
                <Plus className="mr-2 h-6 w-6 stroke-[3]" />
                Add Serial
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
              <div className="bg-[#4F6F52] p-8 text-white">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  Provision <span className="opacity-70">Serial</span>
                </DialogTitle>
                <DialogDescription className="text-[#ECE3CE] font-medium mt-2">
                  Initialize a new hardware identifier for the NutriBin
                  deployment registry.
                </DialogDescription>
              </div>
              <div className="p-8">
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit(onCreateSerial)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                        Identity Configuration
                      </label>
                      <div className="flex gap-3 items-end">
                        <div className="flex-shrink-0">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-2">
                            Prefix
                          </label>
                          <div className="h-14 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl flex items-center text-[#4F6F52] font-black">
                            Serial
                          </div>
                        </div>
                        <span className="text-xl font-bold text-gray-200 mb-4">
                          -
                        </span>
                        <FormField
                          control={createForm.control}
                          name="numbers"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-2">
                                13-Digit Code
                              </label>
                              <FormControl>
                                <Input
                                  placeholder="0000000000000"
                                  maxLength="13"
                                  pattern="\d{13}"
                                  className="h-14 bg-gray-50 border-transparent focus:bg-white focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#3A4D39] focus-visible:border-[#4F6F52] rounded-2xl font-bold"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 13);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )}
                        />
                        <span className="text-xl font-bold text-gray-200 mb-4">
                          -
                        </span>
                        <FormField
                          control={createForm.control}
                          name="alphanumeric"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-2">
                                9-Char Suffix
                              </label>
                              <FormControl>
                                <Input
                                  placeholder="ABCD12345"
                                  maxLength="9"
                                  className="h-14 bg-gray-50 border-transparent focus:bg-white focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#3A4D39] focus-visible:border-[#4F6F52] rounded-2xl font-black uppercase"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .replace(/[^A-Z0-9]/g, "")
                                      .slice(0, 9)
                                      .toUpperCase();
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={createForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Product Classification
                          </label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 bg-gray-50 border-transparent focus:ring-2 focus:ring-[#4F6F52]/20 font-bold text-[#3A4D39] rounded-2xl">
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              <SelectItem
                                value="NB-100"
                                className="rounded-xl font-bold py-3"
                              >
                                NB-100 (Standard Edition)
                              </SelectItem>
                              <SelectItem
                                value="NB-200"
                                className="rounded-xl font-bold py-3"
                              >
                                NB-200 (Professional Edition)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 justify-end pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpenDialog(false)}
                        className="rounded-xl font-bold text-gray-400 hover:text-gray-600 px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-xl font-bold px-8 shadow-lg shadow-[#4F6F52]/20 h-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Initialing..."
                          : "Provision Identification"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
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
                            placeholder="Search by serial, model, or machine ID..."
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
                          onValueChange={(val) => {
                            field.onChange(val);
                            setCurrentPage(1);
                          }}
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
                    Identifer
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Classification
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Hardware Linkage
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Lifecycle
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Provisioning
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Visual ID
                  </TableHead>
                  <TableHead className="font-extrabold text-[#3A4D39] uppercase tracking-widest text-[10px]">
                    Est.
                  </TableHead>
                  <TableHead className="text-right font-extrabold text-[#3A4D39] pr-8 uppercase tracking-widest text-[10px]">
                    Operations
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-[#4F6F52]/10 rounded-full" />
                          <div className="w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                        </div>
                        <p className="text-[#3A4D39] font-black text-lg">
                          Synchronizing Hardware Registry...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedSerials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                          <Ban className="h-10 w-10" />
                        </div>
                        <p className="text-gray-400 font-black text-xl">
                          No serial numbers documented.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSerials.map((serial) => (
                    <TableRow
                      key={serial.serial_id}
                      className="hover:bg-[#F6F7F4]/30 transition-all border-b border-gray-50 last:border-0 group"
                    >
                      <TableCell className="font-mono text-[#4F6F52] font-black pl-8 text-sm">
                        {serial.serial_number}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-[#3A4D39] text-[10px] font-black uppercase tracking-wider">
                          {serial.model || "NB-100"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-gray-400 text-xs font-bold">
                        {serial.machine_id
                          ? `#${serial.machine_id}`
                          : "UNLINKED"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            serial.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${serial.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                          />
                          {serial.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            serial.is_used
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {serial.is_used ? "DEPLOYED" : "AVAILABLE"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            fetchQRCode(serial.serial_number, serial.machine_id)
                          }
                          disabled={qrLoading}
                          className="h-9 px-4 rounded-xl font-black text-[10px] text-[#4F6F52] bg-[#4F6F52]/5 hover:bg-[#4F6F52] hover:text-white transition-all gap-2"
                        >
                          <QrCode className="h-4 w-4" />
                          GENERATE
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-400 font-bold text-xs italic">
                        {formatDate(serial.date_created)}
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
                            className="w-56 p-3 shadow-2xl rounded-[1.5rem] border-none bg-white mt-2 animate-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuLabel className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3 px-2">
                              System Registry Ops
                            </DropdownMenuLabel>
                            {serial.is_active && (
                              <DropdownMenuItem
                                onClick={() => onSetInactive(serial.serial_id)}
                                disabled={actionStates[serial.serial_id]}
                                className="group cursor-pointer focus:bg-amber-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-[#3A4D39]"
                              >
                                <Ban className="mr-3 h-5 w-5 text-amber-600 group-focus:text-white transition-colors" />
                                Deactivate Identifier
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onDeleteSerial(serial.serial_id)}
                              disabled={actionStates[serial.serial_id]}
                              className="group cursor-pointer focus:bg-red-600 focus:text-white rounded-xl py-3 px-3 transition-all font-bold text-red-600"
                            >
                              <Trash2 className="mr-3 h-5 w-5 text-red-600 group-focus:text-white transition-colors" />
                              Purge Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-8 py-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 backdrop-blur-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Hardware Inventory: {filteredSerials.length} Registered
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-gray-100 text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm cursor-pointer"
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
              <div className="h-10 px-4 flex items-center justify-center bg-white border border-gray-50 rounded-xl text-xs font-black text-[#4F6F52] shadow-sm min-w-[80px]">
                {currentPage} <span className="mx-2 text-gray-200">/</span>{" "}
                {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === (totalPages || 1)}
                className="h-10 w-10 p-0 rounded-xl border-gray-100 text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm cursor-pointer"
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <div className="bg-[#4F6F52] p-8 text-white">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              <QrCode className="h-8 w-8 stroke-[2.5]" />
              Identify <span className="opacity-70">Hardware</span>
            </DialogTitle>
            <DialogDescription className="text-[#ECE3CE] font-medium mt-2">
              Encrypted machine registration protocol for secure deployment.
            </DialogDescription>
          </div>

          <div className="p-8 flex flex-col items-center">
            {qrLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#4F6F52]/10 rounded-full" />
                  <div className="w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
                <p className="text-[#3A4D39] font-black uppercase tracking-widest text-xs">
                  Generating ID...
                </p>
              </div>
            ) : qrData?.qrCode ? (
              <div className="space-y-8 w-full">
                <div className="bg-[#F6F7F4] p-10 rounded-[2rem] border-2 border-dashed border-[#4F6F52]/20 flex justify-center shadow-inner">
                  <div className="bg-white p-4 rounded-2xl shadow-xl">
                    <img
                      src={qrData.qrCode}
                      alt="Hardware ID"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F6F7F4] p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Serial Number
                    </span>
                    <span className="font-mono font-black text-[#4F6F52] text-sm break-all">
                      {qrData.serial}
                    </span>
                  </div>
                  <div className="bg-[#F6F7F4] p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Assigned Link
                    </span>
                    <span className="font-mono font-black text-[#3A4D39] text-sm">
                      {qrData.machineId || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3 items-start">
                  <div className="bg-emerald-500 p-1.5 rounded-full text-white mt-0.5 shadow-sm">
                    <QrCode size={12} strokeWidth={3} />
                  </div>
                  <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                    Identity verified. Scan this secure identifier using the
                    NutriBin Field Ops application to finalize hardware
                    handshake.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="w-full pt-8 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setQrModalOpen(false)}
                className="rounded-xl font-bold text-gray-400 hover:text-gray-600 px-8 h-12"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Serial;
