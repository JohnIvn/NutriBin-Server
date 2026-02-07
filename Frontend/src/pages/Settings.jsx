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
// RadioGroup removed — gender hidden in settings
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
import { User, Lock, AlertTriangle, Camera, Eye, EyeOff } from "lucide-react";

function Account() {
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

  useEffect(() => {
    const userId = user?.staff_id || user?.admin_id;
    if (userId) {
      fetchProfile();
      fetchMFASettings();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.staff_id, user?.admin_id]);

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
        // Set current avatar if provided by API (try several common field names)
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

  // Watch contact number changes to require verification when changed
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

  // Debounced availability check for pendingPhone
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

      // Prevent saving if phone changed but not verified
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
    <section className="flex bg-[#ECE3CE]/10 flex-col min-h-screen w-full justify-start items-center p-4 sm:p-8 gap-8">
      <div className="w-full max-w-7xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[black]">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account details and preferences.
        </p>
      </div>

      <section className="flex flex-col lg:flex-row w-full max-w-7xl gap-8 items-start">
        {/* === Left Column: Profile Form === */}
        <Form {...form}>
          <form className="w-full lg:flex-1 space-y-8 bg-white border border-gray-100 shadow-sm rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="bg-[#4F6F52]/10 p-2 rounded-lg">
                <User className="w-5 h-5 text-[#4F6F52]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h2>
                <p className="text-xs text-gray-500">
                  Update your personal details here.
                </p>
              </div>
            </div>

            {/* Avatar Upload - redesigned */}
            <div className="py-6 border-b border-gray-100">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <label
                    htmlFor="avatar-input"
                    className="block w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90"
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={previewUrl || currentAvatar || undefined}
                        alt={previewUrl ? "Preview" : "Avatar"}
                      />
                      <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xl">
                        {getInitials(
                          form.getValues().firstname ||
                            user?.first_name ||
                            user?.email?.[0],
                          form.getValues().lastname || user?.last_name || "",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute right-0 bottom-0 -mb-1 -mr-1 bg-white rounded-full p-1 shadow">
                      <Camera className="w-4 h-4 text-gray-600" />
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
                      const MAX_BYTES = 5 * 1024 * 1024; // 5MB
                      if (file) {
                        // Validate type: prefer MIME type, fallback to extension
                        const allowedMime = ["image/jpeg", "image/png"];
                        const nameExt = file.name
                          ?.split(".")
                          .pop()
                          ?.toLowerCase();
                        const allowedExt = ["jpg", "jpeg", "png"];
                        const isTypeOk =
                          allowedMime.includes(file.type) ||
                          allowedExt.includes(nameExt);

                        if (!isTypeOk) {
                          setAvatarError(
                            "Only JPG or PNG images are allowed. Please pick another picture.",
                          );
                          setSelectedPhoto(null);
                          setPreviewUrl("");
                          return;
                        }

                        if (file.size > MAX_BYTES) {
                          setAvatarError(
                            "File is too large (max 5MB). Please pick another picture.",
                          );
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

                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a square image for best results. JPG, PNG up to 5MB.
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      type="button"
                      disabled={
                        !selectedPhoto || uploadingPhoto || !!avatarError
                      }
                      className="h-9 px-3 bg-[#4F6F52] text-white"
                      onClick={async () => {
                        if (!selectedPhoto) return;
                        const userId = user?.staff_id || user?.admin_id;
                        if (!userId) {
                          toast.error("No user id");
                          return;
                        }
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
                            toast.success("Photo uploaded");
                            fetchProfile();
                            try {
                              refreshUser?.();
                            } catch {
                              // ignore
                            }
                            setSelectedPhoto(null);
                            setPreviewUrl("");
                          } else {
                            toast.error(res.data?.message || "Upload failed");
                          }
                        } catch (err) {
                          toast.error("Failed to upload photo");
                          console.error(err);
                        } finally {
                          setUploadingPhoto(false);
                        }
                      }}
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </Button>

                    <Button
                      type="button"
                      className="h-9 px-3 bg-[#4F6F52] hover:bg-[#3A523D] text-white"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      Choose
                    </Button>

                    {(selectedPhoto || currentAvatar) && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-red-600"
                        onClick={async () => {
                          const userId = user?.staff_id || user?.admin_id;
                          if (!userId) return toast.error("No user id");
                          try {
                            const res = await Requests({
                              url: `/settings/${userId}/photo`,
                              method: "DELETE",
                              credentials: true,
                            });
                            if (res.data?.ok) {
                              toast.success("Photo removed");
                              setCurrentAvatar("");
                              setSelectedPhoto(null);
                              setPreviewUrl("");
                              fetchProfile();
                              try {
                                refreshUser?.();
                              } catch {
                                // ignore
                              }
                            } else {
                              toast.error(
                                res.data?.message || "Failed to remove photo",
                              );
                            }
                          } catch (err) {
                            toast.error("Failed to remove photo");
                            console.error(err);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {selectedPhoto && (
                    <div className="mt-2 text-xs text-gray-600">
                      Selected: {selectedPhoto.name} (
                      {Math.round(selectedPhoto.size / 1024)} KB)
                    </div>
                  )}
                  {avatarError && (
                    <div className="mt-2 text-xs text-red-600">
                      {avatarError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#4F6F52] text-sm font-medium">
                  Loading profile...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!editMode}
                          className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {editMode &&
                    pendingPhone &&
                    pendingPhone !== originalNumber && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-gray-500">
                          You changed your phone number. Please verify it to
                          save changes.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#4F6F52] hover:bg-[#3A523D] text-white h-9"
                            disabled={
                              sendingCode || checkingPhone || !phoneAvailable
                            }
                            onClick={sendPhoneCode}
                          >
                            {sendingCode
                              ? "Sending..."
                              : checkingPhone
                                ? "Checking..."
                                : "Send verification code"}
                          </Button>

                          {checkingPhone ? (
                            <span className="text-sm text-gray-500">
                              Checking
                            </span>
                          ) : !phoneAvailable ? (
                            <span className="text-sm text-red-600">
                              Number already in use
                            </span>
                          ) : phoneVerified ? (
                            <span className="text-sm text-green-600">
                              Verified
                            </span>
                          ) : null}
                        </div>

                        {!phoneVerified && (
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              placeholder="Enter 6-digit code"
                              value={phoneCode}
                              onChange={(e) => setPhoneCode(e.target.value)}
                              className="h-9 w-44"
                            />
                            <Button
                              size="sm"
                              className="bg-[#4F6F52] hover:bg-[#3A523D] text-white h-9"
                              onClick={verifyPhone}
                              disabled={verifyingPhone}
                            >
                              {verifyingPhone ? "Verifying..." : "Verify"}
                            </Button>
                            {phoneError && (
                              <div className="text-xs text-red-600">
                                {phoneError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    className={`${
                      editMode ? "hidden" : "inline-flex"
                    } h-11 px-8 bg-[#4F6F52] hover:bg-[#3A523D] text-white font-semibold transition-all cursor-pointer`}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    type="button"
                    disabled={saveLoading}
                    className={`${
                      editMode ? "inline-flex" : "hidden"
                    } h-11 px-8 bg-[#4F6F52] hover:bg-[#3A523D] text-white font-semibold transition-all cursor-pointer`}
                    onClick={handleSubmission}
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saveLoading}
                    className={`${
                      editMode ? "inline-flex" : "hidden"
                    } h-11 px-8 bg-[red]/80 text-white border-gray-200 font-semibold hover:bg-[red]/100 hover:text-[white] cursor-pointer`}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>

        {/* === Right Column: Sidebar Actions === */}
        <div className="flex flex-col w-full lg:w-96 gap-6">
          {/* Security Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4F6F52]" />
              <h3 className="font-bold text-gray-800 text-sm">
                Security & Privacy
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Password Reset */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Password
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Secure your account by updating your password regularly.
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-[#3A4D39] text-white hover:text-[#4F6F52] hover:border-[#4F6F52] cursor-pointer"
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setResetOpen(true);
                  }}
                >
                  Change Password
                </Button>
              </div>

              <hr className="border-gray-100" />

              {/* MFA Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#4F6F52]" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Multi-Factor Auth
                  </h4>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-[#ECE3CE]/20 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="mfa"
                      value="N/A"
                      checked={mfaType === "N/A"}
                      onChange={() => handleMFAChange("N/A")}
                      disabled={mfaLoading}
                      className="accent-[#4F6F52]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Disabled
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-[#ECE3CE]/20 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="mfa"
                      value="email"
                      checked={mfaType === "email"}
                      onChange={() => handleMFAChange("email")}
                      disabled={mfaLoading}
                      className="accent-[#4F6F52]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Email Verification
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Code sent to email on login
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-[#ECE3CE]/20 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="mfa"
                      value="sms"
                      checked={mfaType === "sms"}
                      onChange={() => handleMFAChange("sms")}
                      disabled={mfaLoading}
                      className="accent-[#4F6F52]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        SMS Verification
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Code sent to your phone number on login
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Close Account */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full h-10 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start px-2 cursor-pointer"
                  disabled={closingAccount}
                  onClick={() => setCloseConfirmOpen(true)}
                >
                  Deactivate Account
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <User className="w-4 h-4 text-[#4F6F52]" />
              <h3 className="font-bold text-gray-800 text-sm">Resources</h3>
            </div>
            <div className="p-2">
              {[
                { label: "About Us", link: "/about" },
                { label: "FAQs", link: "/faqs" },
                { label: "Terms of Service", link: "/policies" },
                { label: "Socials", link: "/socials" },
                { label: "Studies", link: "/studies" },
                { label: "Guide", link: "/guide" },
              ].map((item) => (
                <Button
                  key={item.label}
                  asChild
                  variant="ghost"
                  className="w-full justify-between h-10 text-gray-600 hover:text-[#4F6F52] hover:bg-[#ECE3CE]/20 font-normal"
                >
                  <Link to={item.link}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === Dialogs === */}

      {/* Password Reset Dialog */}
      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) {
            // Reset form when dialog closes
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
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#4F6F52]">
              Change Password
            </DialogTitle>
            <DialogDescription>
              We'll send a code to your email to verify it's you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm">
                <p className="text-gray-500 text-xs uppercase font-bold">
                  Send code to:
                </p>
                <p className="font-medium text-gray-900">
                  {emailShown || user?.email}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#4F6F52] hover:bg-[#3A523D] text-white text-xs h-8"
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
                      toast.success("Code sent!");
                    } else {
                      toast.error(res.data?.message || "Failed");
                    }
                  } catch {
                    toast.error("Error sending code");
                  } finally {
                    setSendingReset(false);
                  }
                }}
              >
                {sendingReset
                  ? "Sending..."
                  : resetSent
                    ? "Resend"
                    : "Send Code"}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">
                  Verification Code
                </label>
                <Input
                  placeholder="000000"
                  maxLength={6}
                  className="text-center tracking-[0.5em] font-mono text-lg border-gray-200 focus-visible:border-[#4F6F52] text-[#4F6F52]"
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      className="border-gray-200 focus-visible:border-[#4F6F52] pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52] cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    Confirm
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="border-gray-200 focus-visible:border-[#4F6F52] pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52] cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Requirements */}
              {newPassword && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Password must contain:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.minLength
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.minLength && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.minLength
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        8-20 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.hasUppercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasUppercase && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.hasUppercase
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.hasLowercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasLowercase && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.hasLowercase
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.hasNumber
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasNumber && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.hasNumber
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.hasSpecial
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasSpecial && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.hasSpecial
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        One special character
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordChecks.match ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.match && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks.match
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-[#4F6F52] hover:bg-[#3A523D]"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !allPasswordRequirementsMet
              }
              onClick={async () => {
                const userId = user?.staff_id || user?.admin_id;

                // Validate all password requirements are met
                if (!allPasswordRequirementsMet) {
                  toast.error("Please meet all password requirements");
                  return;
                }

                // Validate code format
                if (!codeFormatValid) {
                  toast.error("Please enter a valid 6-digit code");
                  return;
                }

                try {
                  setResetSubmitting(true);
                  const res = await Requests({
                    url: `/settings/${userId}/password-reset/verify`,
                    method: "POST",
                    data: { code: resetCode, newPassword },
                    credentials: true,
                  });
                  if (res.data?.ok) {
                    toast.success("Password changed successfully!");
                    setResetOpen(false);
                    // Reset form
                    setResetCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetSent(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  } else {
                    toast.error(
                      res.data?.message || "Failed to change password",
                    );
                  }
                } catch (error) {
                  toast.error(
                    error.response?.data?.message ||
                      "Failed to change password",
                  );
                } finally {
                  setResetSubmitting(false);
                }
              }}
            >
              {resetSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Account Dialog */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Deactivate Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your account? You will be
              logged out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCloseAccount}
              disabled={closingAccount}
            >
              {closingAccount ? "Deactivating..." : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Account;
