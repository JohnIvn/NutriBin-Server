import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CloudUpload,
  HardDrive,
  RotateCw,
  Tag,
  Calendar,
  Server,
  FileText,
} from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function bytesToHex(buffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (b) => ("00" + b.toString(16)).slice(-2))
    .join("");
}

async function computeSHA256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return bytesToHex(digest);
}

function Firmware() {
  const [currentFirmware] = useState({
    version: "v1.2.3",
    build: "abcdef1234",
    releaseDate: "2025-12-10",
    models: ["NB-100", "NB-200"],
    status: "Stable",
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [checksum, setChecksum] = useState("");
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [targetModel, setTargetModel] = useState("NB-100");
  const [validating, setValidating] = useState(false);

  const [devices] = useState([
    {
      id: "NB-001",
      name: "Device A",
      current: "v1.2.0",
      target: "v1.2.3",
      status: "notified",
      last: "2026-01-15 09:12",
      retry: 0,
    },
    {
      id: "NB-002",
      name: "Device B",
      current: "v1.1.9",
      target: "v1.2.3",
      status: "pending",
      last: "2026-01-15 09:15",
      retry: 1,
    },
    {
      id: "NB-003",
      name: "Device C",
      current: "v1.2.0",
      target: "v1.2.3",
      status: "failed",
      last: "2026-01-15 08:58",
      retry: 3,
    },
  ]);

  const [history] = useState([
    {
      id: 1,
      version: "v1.2.3",
      uploadedBy: "admin@nutribin",
      date: "2025-12-10",
      note: "Stable release",
    },
    {
      id: 2,
      version: "v1.2.2-beta",
      uploadedBy: "admin@nutribin",
      date: "2025-11-20",
      note: "Beta",
    },
  ]);

  function handleFileChange(e) {
    setFileError("");
    setChecksum("");
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = [".bin", ".hex", ".uf2"];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes("." + ext)) {
      setFileError("Unsupported file type. Allowed: .bin, .hex, .uf2");
      setFile(null);
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setFileError("File too large. Max 10MB.");
      setFile(null);
      return;
    }

    setFile(f);
    setVersion("");
    setChangelog("");
    setTargetModel("NB-100");
  }

  async function handleValidate() {
    if (!file) return toast.error("No file selected");
    setValidating(true);
    try {
      const sha = await computeSHA256(file);
      setChecksum(sha);
      toast.success("Checksum computed");
    } catch (err) {
      setFileError("Failed to compute checksum");
    } finally {
      setValidating(false);
    }
  }

  async function handleUpload() {
    if (!file) return toast.error("No file selected");
    if (!version) return toast.error("Please provide a firmware version");
    // Placeholder: implement upload API call
    toast.success("Firmware uploaded (mock)");
  }

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3A4D39]">
            Firmware Management
          </h1>
          <p className="text-sm text-[#4F6F52]/80 italic">
            Upload, validate, and deploy firmware updates to registered NutriBin
            devices.
          </p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-[#6B6F68] uppercase font-bold">
              <Tag className="inline-block mr-2 h-4 w-4 text-[#4F6F52]" />
              Current Version
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-extrabold text-[#3A4D39]">
                {currentFirmware.version}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm font-bold ${currentFirmware.status === "Stable" ? "bg-green-50 text-green-700" : currentFirmware.status === "Beta" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
              >
                {currentFirmware.status}
              </span>
            </div>
            <div className="text-xs text-[#6B6F68] mt-2">
              Build: <span className="font-mono">{currentFirmware.build}</span>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-[#6B6F68] uppercase font-bold">
              <Calendar className="inline-block mr-2 h-4 w-4 text-[#4F6F52]" />
              Release Date
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#3A4D39]">
              {currentFirmware.releaseDate}
            </div>
            <div className="text-xs text-[#6B6F68] mt-2">
              Models: {currentFirmware.models.join(", ")}
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-[#6B6F68] uppercase font-bold">
              <Server className="inline-block mr-2 h-4 w-4 text-[#4F6F52]" />
              Active Devices
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#3A4D39]">
              {devices.length}
            </div>
            <div className="text-xs text-[#6B6F68] mt-2">Connected</div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-[#6B6F68] uppercase font-bold">
              <CloudUpload className="inline-block mr-2 h-4 w-4 text-[#4F6F52]" />
              Latest Upload
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#3A4D39]">
              {history[0]?.version}
            </div>
            <div className="text-xs text-[#6B6F68] mt-2">
              {history[0]?.date} by {history[0]?.uploadedBy}
            </div>
          </Card>
        </div>

        {/* Main area */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
              <CardHeader className="flex items-start justify-between p-6">
                <div>
                  <div className="flex items-center gap-3">
                    <CloudUpload className="h-5 w-5 text-[#4F6F52]" />
                    <CardTitle className="text-[#3A4D39]">
                      Upload & Validate
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-[#6B6F68] mt-1">
                    Upload firmware and run validation checks (size, checksum).
                  </CardDescription>
                </div>
                <div className="text-xs text-[#6B6F68]">
                  Supported: .bin, .hex, .uf2
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="mb-2 text-xs font-bold text-[#6B6F68]">
                      Firmware file
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".bin,.hex,.uf2"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-[#3A4D39]"
                      />
                    </div>
                    {fileError && (
                      <div className="mt-2 text-xs text-red-600">
                        {fileError}
                      </div>
                    )}
                    {file && (
                      <div className="mt-2 text-sm text-[#4F6F52]">
                        {file.name} • {(file.size / 1024).toFixed(1)} KB
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="text-xs font-bold text-[#6B6F68]">
                        Version
                      </div>
                      <Input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="e.g. v1.3.0"
                        className="mt-2 w-48"
                      />
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-bold text-[#6B6F68]">
                        Release Notes
                      </div>
                      <textarea
                        value={changelog}
                        onChange={(e) => setChangelog(e.target.value)}
                        rows={4}
                        className="mt-2 w-full border border-gray-100 rounded-md p-3 text-sm"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button onClick={handleValidate} variant="outline">
                        {validating ? "Validating..." : "Validate"}
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={!version || !file}
                      >
                        Upload
                      </Button>
                      {checksum && (
                        <div className="ml-4 text-xs font-mono text-[#4F6F52]">
                          Checksum: {checksum.slice(0, 12)}…
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <div className="text-xs font-bold text-[#6B6F68]">
                      Target Model
                    </div>
                    <select
                      value={targetModel}
                      onChange={(e) => setTargetModel(e.target.value)}
                      className="mt-2 w-full bg-white border border-gray-100 rounded-md p-2 text-sm"
                    >
                      <option>NB-100</option>
                      <option>NB-200</option>
                    </select>

                    <div className="mt-6">
                      <div className="text-xs font-bold text-[#6B6F68]">
                        Validation
                      </div>
                      <div className="mt-2 text-sm text-[#3A4D39]">
                        {checksum ? "Valid checksum" : "Not validated"}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-bold text-[#6B6F68]">
                        Quick Actions
                      </div>
                      <div className="mt-2 flex flex-col gap-2">
                        <Button onClick={() => toast("Deploy (mock)")}>
                          Deploy (mock)
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => toast("Schedule (mock)")}
                        >
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white rounded-xl shadow-md h-full flex flex-col">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-[#4F6F52]" />
                    <div>
                      <CardTitle className="text-[#3A4D39]">
                        Device Update Status
                      </CardTitle>
                      <CardDescription className="text-sm text-[#6B6F68]">
                        Live device overview — statuses: notified, pending,
                        success, failed
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1">
                <div className="space-y-3">
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#3A4D39]">
                          {d.name}
                        </div>
                        <div className="text-xs text-[#6B6F68]">
                          {d.id} • last: {d.last}
                        </div>
                      </div>
                      <div className="flex-1 mx-6">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${d.status === "success" ? "bg-green-600" : d.status === "failed" ? "bg-red-600" : d.status === "pending" ? "bg-amber-500" : "bg-gray-400"}`}
                            style={{
                              width:
                                d.status === "success"
                                  ? "100%"
                                  : d.status === "failed"
                                    ? "5%"
                                    : d.status === "pending"
                                      ? "60%"
                                      : "10%",
                            }}
                          />
                        </div>
                        <div className="w-36 text-right mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.status === "success" ? "bg-green-50 text-green-700" : d.status === "failed" ? "bg-red-50 text-red-700" : d.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700"}`}
                          >
                            {d.status.charAt(0).toUpperCase() +
                              d.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-white rounded-xl shadow-md p-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#4F6F52]" />
            <div className="text-sm font-bold text-[#3A4D39]">
              Logs & History
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-[#FAF9F6]">
                <TableRow>
                  <TableHead className="font-bold text-[#3A4D39] py-4 pl-6">
                    ID
                  </TableHead>
                  <TableHead className="font-bold text-[#3A4D39]">
                    Version
                  </TableHead>
                  <TableHead className="font-bold text-[#3A4D39]">
                    Uploaded by
                  </TableHead>
                  <TableHead className="font-bold text-[#3A4D39]">
                    Date
                  </TableHead>
                  <TableHead className="font-bold text-[#3A4D39]">
                    Note
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow
                    key={h.id}
                    className="hover:bg-[#ECE3CE]/30 transition-all"
                  >
                    <TableCell className="pl-6 font-mono text-[#3A4D39]">
                      {h.id}
                    </TableCell>
                    <TableCell>{h.version}</TableCell>
                    <TableCell className="text-[#6B6F68]">
                      {h.uploadedBy}
                    </TableCell>
                    <TableCell className="text-[#6B6F68]">{h.date}</TableCell>
                    <TableCell className="text-[#6B6F68]">{h.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Firmware;
