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
    <section className="flex flex-col min-h-full h-auto w-full max-w-7xl m-auto justify-start items-center p-4 sm:p-6 gap-6">
      <section className="flex flex-col lg:flex-row w-full h-full gap-6 items-start">
        <Form {...form}>
          <form className="w-full lg:flex-1 space-y-6 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg p-6 sm:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Account Settings
              </h1>
              <p className="text-sm text-gray-500">
                Manage your personal information and contact details.
              </p>
            </div>

            <hr className="border-gray-100" />

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-medium">Loading profile...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            placeholder="First Name"
                            className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            placeholder="Last Name"
                            className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!editMode}
                          placeholder="Complete Address"
                          className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled={!editMode}
                            className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            placeholder="+1234567890"
                            className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-6"
                          disabled={!editMode}
                        >
                          {/* radio buttons */}
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

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    type="button"
                    className={`${
                      editMode ? "hidden" : "inline-flex"
                    } min-w-[140px] h-11 bg-[#4F6F52] hover:bg-[#A34906] text-white cursor-pointer`}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    type="button"
                    disabled={saveLoading}
                    className={`${
                      editMode ? "inline-flex" : "hidden"
                    } min-w-[140px] h-11 bg-[#1CE01C] hover:bg-[#13B013] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
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
                    } min-w-[140px] h-11 bg-[#D73E18] text-white hover:bg-[#B62E0B] cursor-pointer hover:text-white disabled:opacity-50`}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>

        {/* right side cards */}
        <div className="flex flex-col w-full lg:w-80 gap-6">
          <div className="flex flex-col justify-center items-center h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black text-center w-full">
              Change Password
            </h1>
            <hr className="w-full border-gray-100" />
            <p className="text-gray-500 text-center text-sm leading-relaxed w-full">
              Request a 6-digit code sent to your registered email, then enter
              it below to change your password.
            </p>
            <Button
              className="w-full h-10 bg-sky-700 hover:bg-sky-800 cursor-pointer"
              type="button"
              onClick={() => {
                setResetSent(false);
                setResetOpen(true);
              }}
            >
              Change
            </Button>
          </div>

          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Send a 6-digit code to your email, then enter it below with
                  your new password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 p-3 border border-dashed border-gray-200 rounded-md bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Registered email
                    </div>
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
                          toast.error(
                            res.data?.message || "Failed to send code"
                          );
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
                    <label className="text-sm font-medium">
                      Verification Code
                    </label>
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
                        className={
                          passwordChecks.minLength ? "text-green-600" : ""
                        }
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
                        className={
                          passwordChecks.hasNumber ? "text-green-600" : ""
                        }
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
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
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
                            passwordChecks.match
                              ? "text-green-600"
                              : "text-red-600"
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
                  className="bg-sky-700 hover:bg-sky-800"
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

          <div className="flex flex-col justify-center items-center h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black text-center w-full">
              Close Account
            </h1>
            <hr className="w-full border-gray-100" />
            <p className="text-gray-500 text-center text-sm leading-relaxed w-full">
              Deactivate your account and sign out. You will not be able to log
              in again unless an admin reactivates you.
            </p>
            <Button
              variant="destructive"
              className="w-full h-10 cursor-pointer"
              disabled={closingAccount}
              onClick={() => setCloseConfirmOpen(true)}
            >
              {closingAccount ? "Closing..." : "Close"}
            </Button>
          </div>

          <div className="flex flex-col justify-center items-start h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black w-full">
              Multi-Factor Authentication
            </h1>
            <hr className="w-full border-gray-100" />
            <p className="text-gray-500 text-sm leading-relaxed w-full">
              Add an extra layer of security to your account. When enabled,
              you'll need to verify your identity via email when logging in.
            </p>
            <div className="w-full space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-amber-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  id="mfa-disabled"
                  name="mfa"
                  value="N/A"
                  checked={mfaType === "N/A"}
                  onChange={() => handleMFAChange("N/A")}
                  disabled={mfaLoading}
                  className="cursor-pointer"
                />
                <label htmlFor="mfa-disabled" className="cursor-pointer flex-1">
                  <div className="font-medium text-gray-900">Disabled</div>
                  <div className="text-xs text-gray-500">
                    No additional security
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-amber-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  id="mfa-email"
                  name="mfa"
                  value="email"
                  checked={mfaType === "email"}
                  onChange={() => handleMFAChange("email")}
                  disabled={mfaLoading}
                  className="cursor-pointer"
                />
                <label htmlFor="mfa-email" className="cursor-pointer flex-1">
                  <div className="font-medium text-gray-900">
                    Email Verification
                  </div>
                  <div className="text-xs text-gray-500">
                    Requires email verification on login
                  </div>
                </label>
              </div>
            </div>
            {mfaLoading && <p className="text-xs text-gray-400">Updating...</p>}
          </div>

          <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Close account</DialogTitle>
                <DialogDescription>
                  Deactivate your account and sign out. You will not be able to
                  log in again unless an admin reactivates you.
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

          <div className="flex flex-col justify-center items-start h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black w-full">
              Content
            </h1>
            <hr className="w-full border-gray-100" />
            <div className="flex flex-col gap-2 w-full">
              <Button
                asChild
                variant="outline"
                className="justify-start h-10 bg-[#4F6F52] text-white hover:bg-amber-50 hover:text-[#4F6F52] hover:border-[#4F6F52]"
              >
                <Link to="/about">About Us</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-10 bg-[#4F6F52] text-white hover:bg-amber-50 hover:text-[#4F6F52] hover:border-[#4F6F52]"
              >
                <Link to="/faqs">FAQs</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-10 bg-[#4F6F52] text-white hover:bg-amber-50 hover:text-[#4F6F52] hover:border-[#4F6F52]"
              >
                <Link to="/policies">Terms of Service</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-10 bg-[#4F6F52] text-white hover:bg-amber-50 hover:text-[#4F6F52] hover:border-[#4F6F52]"
              >
                <Link to="/socials">Socials</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-10 bg-[#4F6F52] text-white hover:bg-amber-50 hover:text-[#4F6F52] hover:border-[#4F6F52]"
              >
                <Link to="/studies">Studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Account;
