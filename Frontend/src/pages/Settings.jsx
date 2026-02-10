import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { settingsProfile } from "@/schema/settingsProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/UserContext";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Lock,
  AlertTriangle,
  Camera,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  CreditCard,
  ExternalLink,
  Info,
  ChevronRight,
  LogOut,
  Smartphone,
  MapPin,
  Phone,
} from "lucide-react";

function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, logout, refreshUser } = useUser();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [emailShown, setEmailShown] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [_codeError, setCodeError] = useState("");
  const [codeFormatValid, setCodeFormatValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [closingAccount, setClosingAccount] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [mfaType, setMfaType] = useState("N/A");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState(undefined);
  const [originalNumber, setOriginalNumber] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [phoneCode, setPhoneCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneAvailable, setPhoneAvailable] = useState(true);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const avatarInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(settingsProfile),
    defaultValues: {
      firstname: "",
      lastname: "",
      address: "",
      number: "",
    },
  });

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const userId = user?.staff_id || user?.admin_id;
    if (userId) {
      fetchProfile();
      fetchMFASettings();
    } else {
      setLoading(false);
    }
  }, [user?.staff_id, user?.admin_id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchProfile = async () => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await Requests({
        url: `/settings/${userId}`,
        method: "GET",
        credentials: true,
      });

      if (response.data.ok) {
        const staff = response.data.staff;
        form.reset({
          firstname: staff.first_name || "",
          lastname: staff.last_name || "",
          address: staff.address || "",
          number: staff.contact_number || "",
        });
        setOriginalNumber(staff.contact_number || "");
        setPhoneVerified(true);
        setCurrentAvatar(
          staff.avatar ||
            staff.profile_photo ||
            staff.profile_image ||
            staff.photo ||
            user?.avatar ||
            undefined,
        );
        setEmailShown(staff.email || user?.email || "");
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMFASettings = async () => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) return;

    try {
      const response = await Requests({
        url: `/authentication/${userId}/mfa`,
        method: "GET",
        credentials: true,
      });

      if (response.data.ok) {
        setMfaType(response.data.mfaType || "N/A");
      }
    } catch (error) {
      console.error("Failed to load MFA settings", error);
    }
  };

  const handleMFAChange = async (newMfaType) => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) return;

    try {
      setMfaLoading(true);
      const response = await Requests({
        url: `/authentication/${userId}/mfa`,
        method: "PATCH",
        data: { mfaType: newMfaType },
        credentials: true,
      });

      if (response.data.ok) {
        setMfaType(newMfaType);
        toast.success(
          `MFA set to ${newMfaType === "N/A" ? "Disabled" : newMfaType === "email" ? "Email" : "SMS"}`,
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update MFA settings",
      );
      console.error(error);
    } finally {
      setMfaLoading(false);
    }
  };

  useEffect(() => {
    if (!resetCode) {
      setCodeFormatValid(false);
      setCodeError("");
      return;
    }
    setCodeFormatValid(/^\d{6}$/.test(resetCode.trim()));
  }, [resetCode]);

  const watchedNumber = form.watch("number");
  useEffect(() => {
    if (loading) return;
    if ((watchedNumber || "") !== (originalNumber || "")) {
      setPendingPhone(watchedNumber || "");
      setPhoneVerified(false);
    } else {
      setPendingPhone("");
      setPhoneVerified(true);
    }
  }, [watchedNumber, originalNumber, loading]);

  useEffect(() => {
    if (!pendingPhone) {
      setPhoneAvailable(true);
      setCheckingPhone(false);
      return;
    }

    let cancelled = false;
    setCheckingPhone(true);
    const t = setTimeout(async () => {
      try {
        const res = await Requests({
          url: `/management/staff/check-phone/${encodeURIComponent(pendingPhone)}`,
          method: "GET",
          credentials: true,
        });
        if (cancelled) return;
        if (res.data?.ok) setPhoneAvailable(res.data.available === true);
        else setPhoneAvailable(true);
      } catch (err) {
        console.error("phone availability check failed", err);
        setPhoneAvailable(true);
      } finally {
        if (!cancelled) setCheckingPhone(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pendingPhone]);

  const passwordChecks = {
    minLength:
      newPassword && newPassword.length >= 8 && newPassword.length <= 20,
    hasUppercase: newPassword && /[A-Z]/.test(newPassword),
    hasLowercase: newPassword && /[a-z]/.test(newPassword),
    hasNumber: newPassword && /\d/.test(newPassword),
    hasSpecial: newPassword && /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword && confirmPassword && newPassword === confirmPassword,
  };

  const allPasswordRequirementsMet =
    passwordChecks.minLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.match;

  const handleSubmission = async () => {
    const userId = user?.staff_id || user?.admin_id;
    try {
      setSaveLoading(true);
      const values = form.getValues();

      if ((values.number || "") !== (originalNumber || "") && !phoneVerified) {
        toast.error("Please verify your new phone number before saving");
        setSaveLoading(false);
        return;
      }

      const response = await Requests({
        url: `/settings/${userId}`,
        method: "PATCH",
        data: {
          firstname: values.firstname,
          lastname: values.lastname,
          address: values.address,
          contact: values.number,
        },
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Profile updated successfully");
        setEditMode(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) return toast.error("No user id");
    if (!pendingPhone) return toast.error("Enter a phone number to verify");

    if (!phoneAvailable) {
      toast.error("That phone number is already in use");
      return;
    }

    try {
      setSendingCode(true);
      const res = await Requests({
        url: `/settings/${userId}/phone/verify/request`,
        method: "POST",
        data: { newPhone: pendingPhone },
        credentials: true,
      });

      if (res.data?.ok) {
        toast.success("Verification code sent");
      } else {
        toast.error(res.data?.message || "Failed to send verification code");
      }
    } catch (err) {
      toast.error("Failed to send verification code");
      console.error(err);
    } finally {
      setSendingCode(false);
    }
  };

  const verifyPhone = async () => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) return toast.error("No user id");
    if (!phoneCode || !/^[0-9]{6}$/.test(phoneCode.trim()))
      return setPhoneError("Enter a 6-digit code");

    try {
      setVerifyingPhone(true);
      const res = await Requests({
        url: `/settings/${userId}/phone/verify`,
        method: "POST",
        data: { code: phoneCode, newPhone: pendingPhone },
        credentials: true,
      });

      if (res.data?.ok) {
        toast.success("Phone verified");
        setPhoneVerified(true);
        setOriginalNumber(pendingPhone);
        form.setValue("number", pendingPhone);
        setPhoneCode("");
        setPhoneError("");
      } else {
        toast.error(res.data?.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify phone");
      console.error(err);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleCloseAccount = async () => {
    const userId = user?.staff_id || user?.admin_id;
    if (!userId) return;

    try {
      setClosingAccount(true);
      const response = await Requests({
        url: `/settings/${userId}/close`,
        method: "PATCH",
        credentials: true,
      });

      if (response.data?.ok) {
        toast.success("Account deactivated. You have been logged out.");
        logout();
        navigate("/login");
      } else {
        toast.error(response.data?.message || "Failed to close account");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close account");
    } finally {
      setClosingAccount(false);
      setCloseConfirmOpen(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-20">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 border-l-4 border-[#4F6F52] pl-6 transition-all duration-300 hover:pl-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#3A4D39]">
              Account Settings
            </h1>
            <p className="text-sm text-[#4F6F52]/70 font-medium italic">
              Configure your profile identity, security protocols, and
              preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#ECE3CE] shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${user?.staff_id ? "bg-blue-500" : "bg-green-500"} animate-pulse`}
              />
              <span className="text-[10px] font-black text-[#3A4D39] uppercase tracking-widest leading-none">
                {user?.staff_id ? "Staff Access" : "Admin Control"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-start">
          {/* Top Navbar (replaces sidebar) */}
          <nav className="w-full bg-white border border-[#ECE3CE] rounded-2xl p-2 flex items-center gap-3 overflow-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-[#4F6F52] text-white shadow-md"
                  : "bg-white text-[#6B6F68] border border-transparent hover:bg-[#FAF9F6] hover:border-[#4F6F52]"
              }`}
            >
              <User size={16} />
              Personal Profile
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeTab === "security"
                  ? "bg-[#4F6F52] text-white shadow-md"
                  : "bg-white text-[#6B6F68] border border-transparent hover:bg-[#FAF9F6] hover:border-[#4F6F52]"
              }`}
            >
              <ShieldCheck size={16} />
              Security
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeTab === "resources"
                  ? "bg-[#4F6F52] text-white shadow-md"
                  : "bg-white text-[#6B6F68] border border-transparent hover:bg-[#FAF9F6] hover:border-[#4F6F52]"
              }`}
            >
              <Info size={16} />
              Resources
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setCloseConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <AlertTriangle size={16} /> Deactivate
              </button>
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <Form {...form}>
                  <form className="w-full space-y-8 bg-white border border-[#ECE3CE] shadow-sm rounded-2xl p-6 sm:p-10 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4 border-b border-[#FAF9F6] pb-6">
                      <div className="bg-[#FAF9F6] p-3 rounded-xl text-[#4F6F52]">
                        <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Identity Details
                        </h2>
                        <p className="text-xs text-[#6B6F68] font-medium italic">
                          Public information and contact credentials
                        </p>
                      </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 py-4 px-2">
                      <div className="relative group">
                        <label
                          htmlFor="avatar-input"
                          className="block w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#FAF9F6] shadow-inner cursor-pointer relative transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                        >
                          <Avatar className="w-full h-full rounded-none">
                            <AvatarImage
                              src={previewUrl || currentAvatar || undefined}
                            />
                            <AvatarFallback className="bg-[#4F6F52] text-white font-black text-2xl rounded-none">
                              {getInitials(
                                form.getValues().firstname ||
                                  user?.first_name ||
                                  user?.email?.[0],
                                form.getValues().lastname ||
                                  user?.last_name ||
                                  "",
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="text-white w-8 h-8" />
                          </div>
                        </label>
                        <input
                          id="avatar-input"
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            const MAX_BYTES = 5 * 1024 * 1024;
                            if (file) {
                              const allowedMime = ["image/jpeg", "image/png"];
                              const nameExt = file.name
                                ?.split(".")
                                .pop()
                                ?.toLowerCase();
                              const allowedExt = ["jpg", "jpeg", "png"];
                              if (
                                !allowedMime.includes(file.type) &&
                                !allowedExt.includes(nameExt)
                              ) {
                                setAvatarError(
                                  "Only JPG or PNG images are allowed.",
                                );
                                setSelectedPhoto(null);
                                setPreviewUrl("");
                                return;
                              }
                              if (file.size > MAX_BYTES) {
                                setAvatarError("File too large (max 5MB).");
                                setSelectedPhoto(null);
                                setPreviewUrl("");
                              } else {
                                setAvatarError("");
                                setSelectedPhoto(file);
                                setPreviewUrl(URL.createObjectURL(file));
                              }
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-4">
                        <div>
                          <p className="text-lg font-black text-[#3A4D39]">
                            Avatar Identity
                          </p>
                          <p className="text-xs text-[#6B6F68] mt-1 font-medium">
                            Standard square formats (JPG/PNG). Max file size:
                            5MB.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <Button
                            type="button"
                            disabled={
                              !selectedPhoto || uploadingPhoto || !!avatarError
                            }
                            className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white px-6 rounded-xl font-bold transition-all shadow-sm"
                            onClick={async () => {
                              if (!selectedPhoto) return;
                              const userId = user?.staff_id || user?.admin_id;
                              try {
                                setUploadingPhoto(true);
                                const fd = new FormData();
                                fd.append("photo", selectedPhoto);
                                const res = await Requests({
                                  url: `/settings/${userId}/photo`,
                                  method: "POST",
                                  data: fd,
                                  credentials: true,
                                });
                                if (res.data?.ok) {
                                  toast.success("Identity updated");
                                  fetchProfile();
                                  try {
                                    refreshUser?.();
                                  } catch (e) {
                                    console.debug(e);
                                  }
                                  setSelectedPhoto(null);
                                  setPreviewUrl("");
                                } else {
                                  toast.error("Upload failed");
                                }
                              } catch {
                                toast.error("System error");
                              } finally {
                                setUploadingPhoto(false);
                              }
                            }}
                          >
                            {uploadingPhoto ? "Processing..." : "Commit Update"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white px-6 rounded-xl font-bold transition-all"
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            Browse File
                          </Button>

                          {currentAvatar && !selectedPhoto && (
                            <button
                              type="button"
                              onClick={async () => {
                                const userId = user?.staff_id || user?.admin_id;
                                try {
                                  const res = await Requests({
                                    url: `/settings/${userId}/photo`,
                                    method: "DELETE",
                                    credentials: true,
                                  });
                                  if (res.data?.ok) {
                                    toast.success("Avatar purged");
                                    setCurrentAvatar("");
                                    fetchProfile();
                                    try {
                                      refreshUser?.();
                                    } catch (e) {
                                      console.debug(e);
                                    }
                                  }
                                } catch {
                                  toast.error("Purge failed");
                                }
                              }}
                              className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline"
                            >
                              Purge Avatar
                            </button>
                          )}
                        </div>
                        {avatarError && (
                          <p className="text-[10px] text-red-600 font-bold uppercase">
                            {avatarError}
                          </p>
                        )}
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-[#FAF9F6] rounded-md">
                                    <User
                                      size={14}
                                      className="text-[#4F6F52]"
                                    />
                                  </div>
                                  <FormLabel className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest mb-0">
                                    Legal First Name
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!editMode}
                                    className="h-12 bg-[#FAF9F6]/50 border-[#ECE3CE] rounded-xl focus-visible:ring-[#4F6F52] text-[#3A4D39] font-bold"
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-[#FAF9F6] rounded-md">
                                    <User
                                      size={14}
                                      className="text-[#4F6F52]"
                                    />
                                  </div>
                                  <FormLabel className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest mb-0">
                                    Legal Last Name
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!editMode}
                                    className="h-12 bg-[#FAF9F6]/50 border-[#ECE3CE] rounded-xl focus-visible:ring-[#4F6F52] text-[#3A4D39] font-bold"
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-[#FAF9F6] rounded-md">
                                  <MapPin
                                    size={14}
                                    className="text-[#4F6F52]"
                                  />
                                </div>
                                <FormLabel className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest mb-0">
                                  Physical Address
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  className="h-12 bg-[#FAF9F6]/50 border-[#ECE3CE] rounded-xl focus-visible:ring-[#4F6F52] text-[#3A4D39] font-bold"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 gap-6">
                          <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-[#FAF9F6] rounded-md">
                                    <Phone
                                      size={14}
                                      className="text-[#4F6F52]"
                                    />
                                  </div>
                                  <FormLabel className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest mb-0">
                                    Contact Number
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!editMode}
                                    className="h-12 bg-[#FAF9F6]/50 border-[#ECE3CE] rounded-xl focus-visible:ring-[#4F6F52] text-[#3A4D39] font-bold"
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                              </FormItem>
                            )}
                          />

                          {editMode &&
                            pendingPhone &&
                            pendingPhone !== originalNumber && (
                              <div className="p-6 bg-[#FAF9F6] border border-[#ECE3CE] rounded-2xl space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center gap-3">
                                  <ShieldCheck
                                    size={20}
                                    className="text-[#4F6F52]"
                                  />
                                  <p className="text-xs font-black text-[#3A4D39] uppercase">
                                    Verification Sequence Required
                                  </p>
                                </div>
                                <p className="text-[11px] text-[#6B6F68] font-medium">
                                  A security code is required to manifest this
                                  new contact record.
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                  <Button
                                    size="sm"
                                    type="button"
                                    className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white h-10 px-6 rounded-xl font-bold"
                                    disabled={
                                      sendingCode ||
                                      checkingPhone ||
                                      !phoneAvailable
                                    }
                                    onClick={sendPhoneCode}
                                  >
                                    {sendingCode
                                      ? "Transmitting..."
                                      : "Send Secure Code"}
                                  </Button>

                                  {checkingPhone ? (
                                    <span className="text-[10px] font-black text-[#4F6F52] uppercase animate-pulse">
                                      Checking Registry...
                                    </span>
                                  ) : !phoneAvailable ? (
                                    <span className="text-[10px] font-black text-red-600 uppercase">
                                      Registry Conflict: Number In Use
                                    </span>
                                  ) : phoneVerified ? (
                                    <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                                      <ShieldCheck size={12} /> Verified
                                    </span>
                                  ) : null}
                                </div>

                                {!phoneVerified && (
                                  <div className="flex items-center gap-3 mt-4">
                                    <Input
                                      placeholder="6-DIGIT CODE"
                                      maxLength={6}
                                      value={phoneCode}
                                      onChange={(e) =>
                                        setPhoneCode(e.target.value)
                                      }
                                      className="h-10 w-40 text-center font-mono font-black tracking-widest border-[#ECE3CE] rounded-xl"
                                    />
                                    <Button
                                      size="sm"
                                      type="button"
                                      className="bg-[#3A4D39] text-white h-10 px-6 rounded-xl font-bold"
                                      onClick={verifyPhone}
                                      disabled={verifyingPhone}
                                    >
                                      {verifyingPhone
                                        ? "Validating..."
                                        : "Verify"}
                                    </Button>
                                  </div>
                                )}
                                {phoneError && (
                                  <p className="text-[10px] text-red-600 font-bold uppercase">
                                    {phoneError}
                                  </p>
                                )}
                              </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-8 border-t border-[#FAF9F6]">
                          <Button
                            type="button"
                            className={`${editMode ? "hidden" : "inline-flex"} h-12 px-10 bg-[#4F6F52] hover:bg-[#3A4D39] text-white font-black rounded-xl shadow-lg shadow-[#4F6F52]/20 transition-all active:scale-95`}
                            onClick={() => setEditMode(true)}
                          >
                            Unlock Profile
                          </Button>
                          <Button
                            type="button"
                            disabled={saveLoading}
                            className={`${editMode ? "inline-flex" : "hidden"} h-12 px-10 bg-[#4F6F52] hover:bg-[#3A3D39] text-white font-black rounded-xl shadow-lg transition-all active:scale-95`}
                            onClick={handleSubmission}
                          >
                            {saveLoading ? "Commiting..." : "Commit Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={saveLoading}
                            className={`${editMode ? "inline-flex" : "hidden"} h-12 px-10 text-red-600 font-black rounded-xl hover:bg-red-50`}
                            onClick={() => {
                              setEditMode(false);
                              fetchProfile();
                            }}
                          >
                            Abort
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#ECE3CE] p-8 rounded-2xl space-y-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 border-b border-[#FAF9F6] pb-6">
                      <div className="bg-[#FAF9F6] p-3 rounded-xl text-[#4F6F52]">
                        <Key size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Access Control
                        </h2>
                        <p className="text-xs text-[#6B6F68] font-medium italic">
                          Update your entry credentials
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[11px] text-[#6B6F68] font-medium leading-relaxed">
                        Regularly rotational password updates are recommended
                        for secure system integrity.
                      </p>
                      <Button
                        className="w-full bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-black h-12 rounded-xl"
                        onClick={() => {
                          setResetSent(false);
                          setResetOpen(true);
                        }}
                      >
                        Update System Password
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white border border-[#ECE3CE] p-8 rounded-2xl space-y-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 border-b border-[#FAF9F6] pb-6">
                      <div className="bg-[#FAF9F6] p-3 rounded-xl text-[#4F6F52]">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Dual-Phase Protocol
                        </h2>
                        <p className="text-xs text-[#6B6F68] font-medium italic">
                          Configure Multi-Factor Authentication
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          id: "N/A",
                          label: "Restricted Access",
                          desc: "Standard single-phase login only",
                          icon: Lock,
                        },
                        {
                          id: "email",
                          label: "SMTP Verification",
                          desc: "Code transmission via linked email",
                          icon: Key,
                        },
                        {
                          id: "sms",
                          label: "Cellular Auth",
                          desc: "Secure SMS code verification",
                          icon: Smartphone,
                        },
                      ].map((phase) => (
                        <label
                          key={phase.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${mfaType === phase.id ? "bg-[#4F6F52] border-[#4F6F52] text-white" : "bg-[#FAF9F6]/50 border-[#ECE3CE] text-[#3A4D39] hover:border-[#4F6F52]"}`}
                        >
                          <input
                            type="radio"
                            name="mfa"
                            checked={mfaType === phase.id}
                            onChange={() => handleMFAChange(phase.id)}
                            disabled={mfaLoading}
                            className="hidden"
                          />
                          <div
                            className={`p-2 rounded-lg ${mfaType === phase.id ? "bg-white/20" : "bg-white shadow-sm"}`}
                          >
                            <phase.icon
                              size={18}
                              className={
                                mfaType === phase.id
                                  ? "text-white"
                                  : "text-[#4F6F52]"
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black">{phase.label}</p>
                            <p
                              className={`text-[10px] font-medium ${mfaType === phase.id ? "text-white/80" : "text-[#6B6F68]"}`}
                            >
                              {phase.desc}
                            </p>
                          </div>
                          {mfaType === phase.id && <ShieldCheck size={16} />}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-500">
                {[
                  {
                    label: "About System",
                    link: "/about",
                    desc: "Corporate background and mission",
                    icon: Info,
                  },
                  {
                    label: "Logic Database",
                    link: "/faqs",
                    desc: "Frequently asked technical questions",
                    icon: ShieldCheck,
                  },
                  {
                    label: "Usage Policies",
                    link: "/policies",
                    desc: "Legal terms and operator guidelines",
                    icon: User,
                  },
                  {
                    label: "Network Socials",
                    link: "/socials",
                    desc: "Official community communication channels",
                    icon: ExternalLink,
                  },
                  {
                    label: "Research Studies",
                    link: "/studies",
                    desc: "Data analysis and whitepapers",
                    icon: CreditCard,
                  },
                  {
                    label: "Protocol Guide",
                    link: "/guide",
                    desc: "Operational manual and tutorial",
                    icon: Key,
                  },
                ].map((res) => (
                  <Link
                    key={res.label}
                    to={res.link}
                    className="bg-white border border-[#ECE3CE] p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#4F6F52] transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-[#FAF9F6] p-3 rounded-xl text-[#4F6F52] group-hover:bg-[#4F6F52] group-hover:text-white transition-colors">
                        <res.icon size={20} />
                      </div>
                      <h3 className="font-black text-[#3A4D39] group-hover:text-[#4F6F52]">
                        {res.label}
                      </h3>
                    </div>
                    <p className="text-[11px] font-medium text-[#6B6F68] leading-relaxed italic">
                      {res.desc}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-black text-[#4F6F52] uppercase tracking-widest mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      Access Intel <ChevronRight size={12} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Password Reset Dialog */}
      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) {
            setResetCode("");
            setNewPassword("");
            setConfirmPassword("");
            setResetSent(false);
            setCodeError("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-lg rounded-3xl border-none shadow-2xl p-0 overflow-hidden text-[#3A4D39]">
          <div className="bg-[#4F6F52] p-8 text-white relative">
            <DialogTitle className="text-2xl font-black">
              Secure Rotation
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium">
              Multi-factor password update protocol initialized.
            </DialogDescription>
            <ShieldCheck
              size={120}
              className="absolute -right-10 -bottom-10 opacity-10"
            />
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-2xl border border-[#ECE3CE]">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest">
                  Verification Node
                </p>
                <p className="font-bold text-sm">{emailShown || user?.email}</p>
              </div>
              <Button
                size="sm"
                className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white px-5 rounded-xl font-bold h-10"
                disabled={sendingReset}
                onClick={async () => {
                  const userId = user?.staff_id || user?.admin_id;
                  try {
                    setSendingReset(true);
                    const res = await Requests({
                      url: `/settings/${userId}/password-reset`,
                      method: "POST",
                      credentials: true,
                    });
                    if (res.data?.ok) {
                      setResetSent(true);
                      setCodeError("");
                      toast.success("Code Transmitted");
                    } else {
                      toast.error("Transmission Fail");
                    }
                  } catch {
                    toast.error("System Error");
                  } finally {
                    setSendingReset(false);
                  }
                }}
              >
                {sendingReset
                  ? "T-mitting..."
                  : resetSent
                    ? "Re-transmit"
                    : "Transmit Code"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest pl-1">
                  Security Token
                </label>
                <Input
                  placeholder="000 000"
                  maxLength={6}
                  className="h-14 tracking-[1em] text-center font-mono font-black text-2xl border-[#ECE3CE] rounded-2xl focus-visible:ring-[#4F6F52]"
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest pl-1">
                    New Hash
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      className="h-12 border-[#ECE3CE] rounded-2xl focus-visible:ring-[#4F6F52] pr-12 font-bold"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6F68] hover:text-[#4F6F52]"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest pl-1">
                    Confirm Hash
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-12 border-[#ECE3CE] rounded-2xl focus-visible:ring-[#4F6F52] pr-12 font-bold"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6F68] hover:text-[#4F6F52]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {newPassword && (
                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#ECE3CE] space-y-3">
                  <p className="text-[10px] uppercase font-black text-[#6B6F68] tracking-widest mb-2">
                    Complexity Audit
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { check: passwordChecks.minLength, label: "8-20 Length" },
                      {
                        check: passwordChecks.hasUppercase,
                        label: "Uppercase",
                      },
                      {
                        check: passwordChecks.hasLowercase,
                        label: "Lowercase",
                      },
                      { check: passwordChecks.hasNumber, label: "Numeric" },
                      {
                        check: passwordChecks.hasSpecial,
                        label: "Special Char",
                      },
                      { check: passwordChecks.match, label: "Hash Match" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${item.check ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-300"}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase ${item.check ? "text-[#3A4D39]" : "text-[#6B6F68]"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 pt-0">
            <Button
              className="w-full bg-[#4F6F52] hover:bg-[#3A4D39] text-white font-black h-14 rounded-2xl text-lg shadow-lg shadow-[#4F6F52]/20 transition-all active:scale-95"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !allPasswordRequirementsMet
              }
              onClick={async () => {
                const userId = user?.staff_id || user?.admin_id;
                try {
                  setResetSubmitting(true);
                  const res = await Requests({
                    url: `/settings/${userId}/password-reset/verify`,
                    method: "POST",
                    data: { code: resetCode, newPassword },
                    credentials: true,
                  });
                  if (res.data?.ok) {
                    toast.success("Security Hash Updated");
                    setResetOpen(false);
                  } else {
                    toast.error("Validation Fail");
                  }
                } catch {
                  toast.error("System Error");
                } finally {
                  setResetSubmitting(false);
                }
              }}
            >
              {resetSubmitting ? "Finalizing Hash..." : "Deploy Sec-Rotation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Account Dialog */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-white sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="items-center text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-black text-red-600">
              DEACTIVATE NODE
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              This operation will immediately terminate your session and revoke
              all access privileges.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 h-14 rounded-2xl font-black text-lg shadow-lg shadow-red-200"
              onClick={handleCloseAccount}
              disabled={closingAccount}
            >
              {closingAccount ? "TERMINATING..." : "CONFIRM DEACTIVATION"}
            </Button>
            <Button
              variant="ghost"
              className="h-14 rounded-2xl font-black text-[#6B6F68]"
              onClick={() => setCloseConfirmOpen(false)}
            >
              ABORT PROCEDURE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Account;
