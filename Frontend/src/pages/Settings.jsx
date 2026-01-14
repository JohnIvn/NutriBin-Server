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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { adminAccount } from "@/schema/adminAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
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
import {
  Copy,
  Upload,
  User,
  Lock,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";

function Account() {
  const [activeTab, setActiveTab] = useState("my-details");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [emailShown, setEmailShown] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeFormatValid, setCodeFormatValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [closingAccount, setClosingAccount] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [mfaType, setMfaType] = useState("N/A");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const tabs = [
    { id: "my-details", label: "My details" },
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "content", label: "Content" },
  ];

  const form = useForm({
    resolver: zodResolver(adminAccount),
    defaultValues: {
      firstname: "",
      lastname: "",
      address: "",
      age: 0,
      gender: "male",
      number: "",
    },
  });

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
          age: staff.age || 0,
          number: staff.contact_number || "",
          gender: "male", // Default since gender is not in the backend
        });
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
          `MFA set to ${newMfaType === "N/A" ? "Disabled" : "Email"}`
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update MFA settings"
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

  const passwordChecks = {
    minLength: newPassword && newPassword.length >= 8,
    hasUppercase: newPassword && /[A-Z]/.test(newPassword),
    hasLowercase: newPassword && /[a-z]/.test(newPassword),
    hasNumber: newPassword && /\d/.test(newPassword),
    hasSpecial: newPassword && /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword && confirmPassword && newPassword === confirmPassword,
  };

  const handleSubmission = async () => {
    const userId = user?.staff_id || user?.admin_id;
    try {
      setSaveLoading(true);
      const values = form.getValues();

      const response = await Requests({
        url: `/settings/${userId}`,
        method: "PATCH",
        data: {
          firstname: values.firstname,
          lastname: values.lastname,
          address: values.address,
          age: values.age,
          contact: values.number,
        },
        credentials: true,
      });

      if (response.data.ok) {
        toast.success("Profile updated successfully");
        setEditMode(false);
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setSaveLoading(false);
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
    <section className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account and preferences
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow overflow-hidden flex items-center justify-center flex-shrink-0">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#4F6F52] to-[#3d5642] flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {form.getValues("firstname")?.charAt(0) || "U"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const icons = {
                  "my-details": <User className="w-4 h-4" />,
                  profile: <User className="w-4 h-4" />,
                  password: <Lock className="w-4 h-4" />,
                  content: <FileText className="w-4 h-4" />,
                };
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors font-medium text-sm ${
                      activeTab === tab.id
                        ? "text-[#4F6F52] border-[#4F6F52]"
                        : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {icons[tab.id]}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 md:px-8">
        <Form {...form}>
          <form className="w-full space-y-8">
            {/* My Details Tab */}
            {activeTab === "my-details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Your Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    View your account details
                  </p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">
                      Loading profile...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          First Name
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {form.getValues("firstname") || "Not set"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Last Name
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {form.getValues("lastname") || "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Email Address
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium text-gray-900">
                          {emailShown || user?.email || "Not set"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(user?.email || "");
                            toast.success("Email copied to clipboard");
                          }}
                          className="p-2 hover:bg-white rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Age & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Age
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {form.getValues("age") || "Not set"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Contact Number
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {form.getValues("number") || "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Role & Address */}
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Role
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {user?.admin_id ? (
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              Staff Member
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-base text-gray-900">
                        {form.getValues("address") || "Not set"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Edit Profile
                  </h2>
                  <p className="text-sm text-gray-600">
                    Update your personal information
                  </p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">
                      Loading profile...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#4F6F52]" />
                        Profile Picture
                      </h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4F6F52] transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProfileImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfileImagePreview(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="profile-upload"
                        />
                        <label
                          htmlFor="profile-upload"
                          className="flex flex-col items-center gap-3 cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (max. 800x600px)
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#4F6F52]" />
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">
                                First name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  placeholder="First Name"
                                  className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                              <FormLabel className="text-gray-700 font-medium">
                                Last name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  placeholder="Last Name"
                                  className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                            <FormLabel className="text-gray-700 font-medium">
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!editMode}
                                placeholder="Complete Address"
                                className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">
                                Age
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  disabled={!editMode}
                                  className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">
                                Contact Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  placeholder="+1234567890"
                                  className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-gray-700 font-medium">
                              Gender
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-6"
                                disabled={!editMode}
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem
                                      value="male"
                                      className="border-gray-300 data-[state=checked]:border-[#4F6F52] data-[state=checked]:text-[#4F6F52] cursor-pointer"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Male
                                  </FormLabel>
                                </FormItem>

                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem
                                      value="female"
                                      className="border-gray-300 data-[state=checked]:border-[#4F6F52] data-[state=checked]:text-[#4F6F52] cursor-pointer"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Female
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        type="button"
                        className={`${
                          editMode ? "hidden" : "inline-flex"
                        } bg-[#4F6F52] hover:bg-[#3d5642] text-white cursor-pointer h-10`}
                        onClick={() => setEditMode(true)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        type="button"
                        disabled={saveLoading}
                        className={`${
                          editMode ? "inline-flex" : "hidden"
                        } bg-green-600 hover:bg-green-700 text-white cursor-pointer h-10 disabled:opacity-50`}
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
                        } h-10`}
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your password and authentication options
                  </p>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#4F6F52]" />
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Request a 6-digit code sent to your registered email to
                    change your password.
                  </p>
                  <Button
                    className="bg-[#4F6F52] hover:bg-[#3d5642] cursor-pointer text-white h-10"
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setResetOpen(true);
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {/* MFA Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#4F6F52]" />
                    Multi-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Add an extra layer of security to your account.
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        mfaType === "N/A"
                          ? "border-[#4F6F52] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        id="mfa-disabled"
                        name="mfa"
                        value="N/A"
                        checked={mfaType === "N/A"}
                        onChange={() => handleMFAChange("N/A")}
                        disabled={mfaLoading}
                        className="cursor-pointer w-4 h-4"
                      />
                      <label
                        htmlFor="mfa-disabled"
                        className="cursor-pointer flex-1"
                      >
                        <div className="font-medium text-gray-900">
                          Disabled
                        </div>
                        <div className="text-xs text-gray-500">
                          No additional security
                        </div>
                      </label>
                      {mfaType === "N/A" && (
                        <span className="text-[#4F6F52] text-sm font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        mfaType === "email"
                          ? "border-[#4F6F52] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        id="mfa-email"
                        name="mfa"
                        value="email"
                        checked={mfaType === "email"}
                        onChange={() => handleMFAChange("email")}
                        disabled={mfaLoading}
                        className="cursor-pointer w-4 h-4"
                      />
                      <label
                        htmlFor="mfa-email"
                        className="cursor-pointer flex-1"
                      >
                        <div className="font-medium text-gray-900">
                          Email Verification
                        </div>
                        <div className="text-xs text-gray-500">
                          Requires email verification on login
                        </div>
                      </label>
                      {mfaType === "email" && (
                        <span className="text-[#4F6F52] text-sm font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {mfaLoading && (
                    <p className="text-xs text-gray-400 mt-3">Updating...</p>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Close your account permanently. You will not be able to log
                    in again unless an admin reactivates you.
                  </p>
                  <Button
                    variant="destructive"
                    className="cursor-pointer h-10"
                    disabled={closingAccount}
                    onClick={() => setCloseConfirmOpen(true)}
                  >
                    {closingAccount ? "Closing..." : "Close Account"}
                  </Button>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Resources & Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Quick access to important information and resources
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    asChild
                    className="justify-between h-14 bg-white border-2 border-gray-200 hover:border-[#4F6F52] hover:bg-green-50 text-gray-900 font-medium"
                  >
                    <Link to="/about" className="flex items-center">
                      <span>About Us</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-between h-14 bg-white border-2 border-gray-200 hover:border-[#4F6F52] hover:bg-green-50 text-gray-900 font-medium"
                  >
                    <Link to="/faqs" className="flex items-center">
                      <span>FAQs</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-between h-14 bg-white border-2 border-gray-200 hover:border-[#4F6F52] hover:bg-green-50 text-gray-900 font-medium"
                  >
                    <Link to="/policies" className="flex items-center">
                      <span>Terms of Service</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-between h-14 bg-white border-2 border-gray-200 hover:border-[#4F6F52] hover:bg-green-50 text-gray-900 font-medium"
                  >
                    <Link to="/socials" className="flex items-center">
                      <span>Socials</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-between h-14 bg-white border-2 border-gray-200 hover:border-[#4F6F52] hover:bg-green-50 text-gray-900 font-medium"
                  >
                    <Link to="/studies" className="flex items-center">
                      <span>Studies</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Dialogs */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Send a 6-digit code to your email, then enter it below with your
              new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 p-3 border border-dashed border-gray-200 rounded-md bg-gray-50">
                <div className="text-sm text-gray-600">Registered email</div>
                <div className="font-semibold">
                  {emailShown || user?.email || "(unknown)"}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
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
                      toast.success("Verification code sent to your email");
                    } else {
                      toast.error(res.data?.message || "Failed to send code");
                    }
                  } catch (error) {
                    console.error(error);
                    toast.error(
                      error.response?.data?.message || "Failed to send code"
                    );
                  } finally {
                    setSendingReset(false);
                  }
                }}
              >
                {sendingReset
                  ? "Sending..."
                  : resetSent
                  ? "Resend Code"
                  : "Send Code"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  placeholder="6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-1"
                  value={resetCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    setResetCode(v);
                  }}
                />
                <div className="flex items-center gap-2 text-xs mt-1">
                  {codeError ? (
                    <span className="text-red-600">{codeError}</span>
                  ) : codeFormatValid ? (
                    <span className="text-green-600">
                      Code format looks good
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      Enter a 6-digit numeric code
                    </span>
                  )}
                  {!codeError && resetSent && (
                    <span className="text-gray-500">Code sent</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  className="mt-1"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mt-1">
                  <span
                    className={passwordChecks.minLength ? "text-green-600" : ""}
                  >
                    • 8+ characters
                  </span>
                  <span
                    className={
                      passwordChecks.hasUppercase ? "text-green-600" : ""
                    }
                  >
                    • Uppercase
                  </span>
                  <span
                    className={
                      passwordChecks.hasLowercase ? "text-green-600" : ""
                    }
                  >
                    • Lowercase
                  </span>
                  <span
                    className={passwordChecks.hasNumber ? "text-green-600" : ""}
                  >
                    • Number
                  </span>
                  <span
                    className={
                      passwordChecks.hasSpecial ? "text-green-600" : ""
                    }
                  >
                    • Symbol
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  className="mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="text-[11px] mt-1">
                  {newPassword && confirmPassword && (
                    <span
                      className={
                        passwordChecks.match ? "text-green-600" : "text-red-600"
                      }
                    >
                      {passwordChecks.match
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="bg-[#4F6F52] hover:bg-[#3d5642] text-white"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !passwordChecks.minLength ||
                !passwordChecks.hasUppercase ||
                !passwordChecks.hasLowercase ||
                !passwordChecks.hasNumber ||
                !passwordChecks.hasSpecial ||
                !passwordChecks.match
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
                    toast.success("Password has been changed successfully");
                    setCodeError("");
                    setResetOpen(false);
                    setResetCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } else {
                    toast.error(
                      res.data?.message || "Failed to change password"
                    );
                  }
                } catch (error) {
                  const msg =
                    error.response?.data?.message ||
                    "Failed to change password";
                  if (msg.toLowerCase().includes("code")) setCodeError(msg);
                  toast.error(msg);
                } finally {
                  setResetSubmitting(false);
                }
              }}
            >
              {resetSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Close account</DialogTitle>
            <DialogDescription>
              Deactivate your account and sign out. You will not be able to log
              in again unless an admin reactivates you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={closingAccount}
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={closingAccount}
              onClick={handleCloseAccount}
            >
              {closingAccount ? "Closing..." : "Confirm close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Account;
