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
import { Copy, Upload } from "lucide-react";

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
      {/* Gradient Header */}
      <div className="h-40 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500"></div>

      {/* Settings Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 -mt-20 relative z-10 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {form.getValues("firstname")?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 -mx-6 sm:-mx-8 px-6 sm:px-8">
            <div className="flex gap-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "text-[#4F6F52] border-[#4F6F52]"
                      : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <Form {...form}>
            <form className="w-full space-y-6">
              {/* My Details Tab */}
              {activeTab === "my-details" && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 font-medium">
                        Loading profile...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-gray-700 font-medium text-sm block mb-2">
                            First name
                          </label>
                          <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.getValues("firstname") || "Not set"}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-700 font-medium text-sm block mb-2">
                            Last name
                          </label>
                          <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.getValues("lastname") || "Not set"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 font-medium text-sm block mb-2">
                          Email
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-400">✉</span>
                          <span className="text-gray-700 text-sm">
                            {emailShown || user?.email || "Not set"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-gray-700 font-medium text-sm block mb-2">
                            Age
                          </label>
                          <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.getValues("age") || "Not set"}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-700 font-medium text-sm block mb-2">
                            Contact Number
                          </label>
                          <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.getValues("number") || "Not set"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 font-medium text-sm block mb-2">
                          Role
                        </label>
                        <div className="text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {user?.admin_id ? "Administrator" : "Staff Member"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 font-medium">
                        Loading profile...
                      </p>
                    </div>
                  ) : (
                    <>
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

                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Upload profile picture
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

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          className={`${
                            editMode ? "hidden" : "inline-flex"
                          } bg-[#4F6F52] hover:bg-[#3d5642] text-white cursor-pointer h-10`}
                          onClick={() => setEditMode(true)}
                        >
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
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600">
                      Request a 6-digit code sent to your registered email, then
                      enter it below to change your password.
                    </p>
                    <Button
                      className="bg-[#4F6F52] hover:bg-[#3d5642] cursor-pointer text-white h-10"
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setResetOpen(true);
                      }}
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Multi-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                      </div>
                    </div>
                    {mfaLoading && (
                      <p className="text-xs text-gray-400 mt-3">Updating...</p>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">
                      Danger Zone
                    </h3>
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
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Content & Resources
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Quick access to important information and resources.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      asChild
                      variant="outline"
                      className="justify-start h-12 border-2 hover:border-[#4F6F52] hover:bg-green-50"
                    >
                      <Link to="/about" className="flex items-center">
                        <span className="font-medium">About Us</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="justify-start h-12 border-2 hover:border-[#4F6F52] hover:bg-green-50"
                    >
                      <Link to="/faqs" className="flex items-center">
                        <span className="font-medium">FAQs</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="justify-start h-12 border-2 hover:border-[#4F6F52] hover:bg-green-50"
                    >
                      <Link to="/policies" className="flex items-center">
                        <span className="font-medium">Terms of Service</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="justify-start h-12 border-2 hover:border-[#4F6F52] hover:bg-green-50"
                    >
                      <Link to="/socials" className="flex items-center">
                        <span className="font-medium">Socials</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="justify-start h-12 border-2 hover:border-[#4F6F52] hover:bg-green-50"
                    >
                      <Link to="/studies" className="flex items-center">
                        <span className="font-medium">Studies</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
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
