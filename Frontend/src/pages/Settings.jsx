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
import { User, Lock, AlertTriangle } from "lucide-react";

function Account() {
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
          gender: "male",
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
        fetchProfile();
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
    <section className="flex bg-[#ECE3CE]/10 flex-col min-h-screen w-full justify-start items-center p-4 sm:p-8 gap-8">
      <div className="w-full max-w-7xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[black]">Settings</h1>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
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
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-500">Update your personal details here.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#4F6F52] text-sm font-medium">Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">First Name</FormLabel>
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
                        <FormLabel className="text-gray-600">Last Name</FormLabel>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Contact Number</FormLabel>
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-600">Gender</FormLabel>
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
                                className="border-gray-300 text-[#4F6F52] focus:ring-[#4F6F52]"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700 cursor-pointer">
                              Male
                            </FormLabel>
                          </FormItem>

                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="female"
                                className="border-gray-300 text-[#4F6F52] focus:ring-[#4F6F52]"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700 cursor-pointer">
                              Female
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                <h3 className="font-bold text-gray-800 text-sm">Security & Privacy</h3>
            </div>
            <div className="p-6 space-y-6">
                {/* Password Reset */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Password</h4>
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
                        <h4 className="text-sm font-semibold text-gray-700">Multi-Factor Auth</h4>
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
                                <div className="text-sm font-medium text-gray-900">Disabled</div>
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
                                <div className="text-sm font-medium text-gray-900">Email Verification</div>
                                <div className="text-[10px] text-gray-500">Code sent to email on login</div>
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
                  { label: "Studies", link: "/studies" }
              ].map((item) => (
                  <Button
                    key={item.label}
                    asChild
                    variant="ghost"
                    className="w-full justify-between h-10 text-gray-600 hover:text-[#4F6F52] hover:bg-[#ECE3CE]/20 font-normal"
                  >
                    <Link to={item.link}>
                        {item.label}
                    </Link>
                  </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === Dialogs === */}
      
      {/* Password Reset Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#4F6F52]">Change Password</DialogTitle>
            <DialogDescription>
              We'll send a code to your email to verify it's you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-sm">
                    <p className="text-gray-500 text-xs uppercase font-bold">Send code to:</p>
                    <p className="font-medium text-gray-900">{emailShown || user?.email}</p>
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
                    } catch (error) {
                    toast.error("Error sending code");
                    } finally {
                    setSendingReset(false);
                    }
                }}
                >
                {sendingReset ? "Sending..." : resetSent ? "Resend" : "Send Code"}
                </Button>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Verification Code</label>
                    <Input
                        placeholder="000000"
                        maxLength={6}
                        className="text-center tracking-[0.5em] font-mono text-lg border-gray-200 focus-visible:border-[#4F6F52] text-[#4F6F52]"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">New Password</label>
                        <Input
                            type="password"
                            className="border-gray-200 focus-visible:border-[#4F6F52]"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Confirm</label>
                        <Input
                            type="password"
                            className="border-gray-200 focus-visible:border-[#4F6F52]"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-[#4F6F52] hover:bg-[#3A523D]"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
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
                    toast.success("Password changed!");
                    setResetOpen(false);
                    }
                } catch {
                    toast.error("Failed to change password");
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
              Are you sure you want to deactivate your account? You will be logged out immediately.
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