import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { adminAccount, adminAccountEdit } from "@/schema/adminAccount";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function AdminModal({ mode, cancel, staff, onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [user, setUser] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(null);
  const [originalPhone, setOriginalPhone] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeFormatValid, setCodeFormatValid] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const form = useForm({
    resolver: zodResolver(mode === "edit" ? adminAccountEdit : adminAccount),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      birthday: "",
      age: 0,
      contact: "",
      address: "",
      password: "",
      confirmPassword: "",
      emailVerificationCode: "",
    },
  });

  const displayPassword = (state) => {
    setShowPass(state);
  };

  const setUserData = (data) => {
    setUser(data);
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 0;

    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const birthday = form.watch("birthday");
  const email = form.watch("email");
  const password = form.watch("password");
  const contact = form.watch("contact");
  const emailVerificationCode = form.watch("emailVerificationCode");
  const emailChanged = mode === "edit" && email !== originalEmail;

  // Password validation checks
  const passwordChecks = {
    minLength: password && password.length >= 8,
    hasUppercase: password && /[A-Z]/.test(password),
    hasLowercase: password && /[a-z]/.test(password),
    hasNumber: password && /\d/.test(password),
    hasSpecial: password && /[^A-Za-z0-9]/.test(password),
  };

  useEffect(() => {
    if (!birthday) return;

    const age = calculateAge(birthday);
    form.setValue("age", age, { shouldValidate: true });
  }, [birthday]);

  // Validate verification code format in real time
  useEffect(() => {
    if (!emailVerificationCode) {
      setCodeFormatValid(false);
      return;
    }

    setCodeFormatValid(/^\d{6}$/.test(emailVerificationCode.trim()));
    setCodeError("");
  }, [emailVerificationCode]);

  // Check email availability with debounce
  useEffect(() => {
    // Skip if email is empty or too short
    if (!email || email.length < 3) {
      setEmailAvailable(null);
      return;
    }

    // In edit mode, skip if email hasn't changed from original
    if (mode === "edit" && email === originalEmail) {
      setEmailAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const response = await Requests({
          url: `/management/staff/check-email/${encodeURIComponent(email)}`,
          method: "GET",
          credentials: true,
        });

        if (response.data.ok) {
          setEmailAvailable(response.data.available);
          if (!response.data.available) {
            form.setError("email", {
              type: "manual",
              message: "This email is already taken",
            });
          } else {
            form.clearErrors("email");
          }
        }
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setEmailChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [email, mode, originalEmail]);

  useEffect(() => {
    if (!emailChanged) {
      setCodeSent(false);
      form.setValue("emailVerificationCode", "");
    }
  }, [emailChanged]);

  // Check phone number availability with debounce
  useEffect(() => {
    // Skip if contact is empty or too short
    if (!contact || contact.length < 11) {
      setPhoneAvailable(null);
      return;
    }

    // In edit mode, skip if phone hasn't changed from original
    if (mode === "edit" && contact === originalPhone) {
      setPhoneAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setPhoneChecking(true);
        const response = await Requests({
          url: `/management/staff/check-phone/${encodeURIComponent(contact)}`,
          method: "GET",
          credentials: true,
        });

        if (response.data.ok) {
          setPhoneAvailable(response.data.available);
          if (!response.data.available) {
            form.setError("contact", {
              type: "manual",
              message: "This phone number is already taken",
            });
          } else {
            form.clearErrors("contact");
          }
        }
      } catch (error) {
        console.error("Error checking phone number:", error);
      } finally {
        setPhoneChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [contact, mode, originalPhone]);

  async function handleGoogleSignIn(credentialResponse) {
    try {
      setGoogleError("");
      const response = await axios.post(
        "http://localhost:3000/staff/google-signup",
        { credential: credentialResponse.credential }
      );

      if (!response.data.ok) {
        setGoogleError(response.data.error || "Google sign-up failed");
        return;
      }

      toast.success("Staff account created with Google!");
      if (onSuccess) {
        onSuccess();
      }
      cancel();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create staff account with Google";
      setGoogleError(errorMessage);
      console.error(error);
    }
  }

  function handleGoogleError() {
    toast.error("Google sign-in failed. Please try again.");
  }

  async function onSubmit(values) {
    console.log("Submitting", values);
    try {
      const formData = values;

      if (emailChanged) {
        if (!values.emailVerificationCode?.trim()) {
          toast.error(
            "Enter the 6-digit verification code sent to the new email"
          );
          return;
        }

        if (!/^\d{6}$/.test(values.emailVerificationCode.trim())) {
          toast.error("Verification code must be 6 digits");
          return;
        }

        formData.emailVerificationCode = values.emailVerificationCode.trim();
      } else {
        delete formData.emailVerificationCode;
      }

      if (mode === "edit" && staff) {
        // Update existing staff member
        const response = await Requests({
          url: `/management/staff/${staff.staff_id}`,
          method: "PUT",
          data: formData,
          credentials: true,
        });

        if (response.data.ok) {
          setCodeError("");
          toast.success("Staff member updated successfully");
          if (onSuccess) onSuccess();
          cancel();
        } else {
          toast.error("Failed to update staff member");
        }
      } else {
        // Create new staff member using management controller
        const response = await Requests({
          url: "/management/staff",
          method: "POST",
          data: formData,
          credentials: true,
        });

        if (response.data.ok) {
          toast.success("Staff member created successfully");
          if (onSuccess) onSuccess();
          cancel();
        } else {
          toast.error("Failed to create staff member");
        }
      }
    } catch (error) {
      // ErrorHandler here
      console.error(error);
      const msg =
        error.response?.data?.message || "Failed to save staff member";
      if (msg.toLowerCase().includes("verification code")) {
        setCodeError(msg);
      }
      toast.error(msg);
    }
  }

  const handleSendCode = async () => {
    if (!emailChanged) {
      toast.info("Email is unchanged");
      return;
    }

    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email first");
      return;
    }

    try {
      setSendingCode(true);
      const response = await Requests({
        url: `/management/staff/${staff.staff_id}/email-verification`,
        method: "POST",
        data: { newEmail: email },
        credentials: true,
      });

      if (response.data?.ok) {
        toast.success("Verification code sent to the new email");
        setCodeSent(true);
        setCodeError("");
      } else {
        toast.error(response.data?.message || "Failed to send code");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setSendingCode(false);
    }
  };

  // Load staff data when in edit mode
  useEffect(() => {
    if (mode === "edit" && staff) {
      // Format birthday for date input (YYYY-MM-DD)
      const formattedBirthday = staff.birthday
        ? new Date(staff.birthday).toISOString().split("T")[0]
        : "";

      const staffData = {
        firstname: staff.first_name || "",
        lastname: staff.last_name || "",
        birthday: formattedBirthday,
        age: staff.age || 0,
        address: staff.address || "",
        email: staff.email || "",
        contact: staff.contact_number || "",
        emailVerificationCode: "",
      };

      setOriginalEmail(staff.email || "");
      setOriginalPhone(staff.contact_number || "");
      setUserData(staffData);
      form.reset(staffData);
    }
  }, [mode, staff]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex justify-center items-center w-screen h-screen  fixed z-10 backdrop-blur-md">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>
              {mode === "edit"
                ? `Edit Staff: ${staff?.first_name || ""} ${
                    staff?.last_name || ""
                  }`
                : "Create new staff account"}
            </CardTitle>
            <CardDescription>
              {mode === "edit"
                ? "Edit the staff account information"
                : "Create a new account for the staff management"}
            </CardDescription>
            {googleError && (
              <div className="mt-3 p-3 bg-destructive/15 border border-destructive/50 rounded-md text-destructive text-sm">
                {googleError}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className={"border border-secondary-foreground"}
                              {...field}
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
                              placeholder="Doe"
                              className={"border border-secondary-foreground"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Phase X Brgy XXX Place City"
                              className={"border border-secondary-foreground"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="email123@gmail.com"
                                className={"border border-secondary-foreground"}
                                {...field}
                              />
                              {emailChecking && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                  Checking...
                                </span>
                              )}
                              {!emailChecking && emailAvailable === true && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                                  ✓ Available
                                </span>
                              )}
                              {!emailChecking && emailAvailable === false && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600">
                                  ✗ Taken
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {mode === "edit" && (
                    <div className="flex flex-col gap-2 p-3 border border-dashed border-gray-200 rounded-md bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Verify New Email
                          </FormLabel>
                          <p className="text-xs text-gray-500">
                            Send a code to confirm the updated email before
                            saving.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          disabled={
                            !emailChanged ||
                            sendingCode ||
                            emailChecking ||
                            emailAvailable === false ||
                            !email
                          }
                          onClick={handleSendCode}
                        >
                          {sendingCode
                            ? "Sending..."
                            : codeSent
                            ? "Resend Code"
                            : "Send Code"}
                        </Button>
                      </div>
                      {emailChanged && (
                        <FormField
                          control={form.control}
                          name="emailVerificationCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="6-digit code"
                                  inputMode="numeric"
                                  maxLength={6}
                                  className={
                                    "border border-secondary-foreground"
                                  }
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2 text-xs">
                                {codeError ? (
                                  <span className="text-red-600">
                                    {codeError}
                                  </span>
                                ) : codeFormatValid ? (
                                  <span className="text-green-600">
                                    Code format looks good
                                  </span>
                                ) : (
                                  <span className="text-amber-600">
                                    Enter a 6-digit numeric code
                                  </span>
                                )}
                                {!codeError && codeSent && (
                                  <span className="text-gray-500">
                                    Code sent
                                  </span>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                  {mode !== "edit" && (
                    <div className="flex flex-col gap-2 p-3 border border-dashed border-gray-200 rounded-md bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Verify Email Address
                          </FormLabel>
                          <p className="text-xs text-gray-500">
                            Send a code to verify the email before creating
                            account.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          disabled={
                            sendingCode ||
                            emailChecking ||
                            emailAvailable === false ||
                            !email
                          }
                          onClick={handleSendCode}
                        >
                          {sendingCode
                            ? "Sending..."
                            : codeSent
                            ? "Resend Code"
                            : "Send Code"}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="emailVerificationCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="6-digit code"
                                inputMode="numeric"
                                maxLength={6}
                                className={"border border-secondary-foreground"}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2 text-xs">
                              {codeError ? (
                                <span className="text-red-600">
                                  {codeError}
                                </span>
                              ) : codeFormatValid ? (
                                <span className="text-green-600">
                                  Code format looks good
                                </span>
                              ) : (
                                <span className="text-amber-600">
                                  Enter a 6-digit numeric code
                                </span>
                              )}
                              {!codeError && codeSent && (
                                <span className="text-gray-500">Code sent</span>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthday</FormLabel>
                          <FormControl>
                            <Input
                              type={"date"}
                              className={"border border-secondary-foreground"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="+639****"
                                className={"border border-secondary-foreground"}
                                {...field}
                              />
                              {phoneChecking && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                  Checking...
                                </span>
                              )}
                              {!phoneChecking && phoneAvailable === true && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                                  ✓ Available
                                </span>
                              )}
                              {!phoneChecking && phoneAvailable === false && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600">
                                  ✗ Taken
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {mode !== "edit" && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder="@John1234"
                                className={"border border-secondary-foreground"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            {password && (
                              <div className="mt-2 space-y-1 text-xs">
                                <div
                                  className={`flex items-center gap-2 ${
                                    passwordChecks.minLength
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {passwordChecks.minLength ? "✓" : "○"}
                                  </span>
                                  <span>At least 8 characters</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 ${
                                    passwordChecks.hasUppercase
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {passwordChecks.hasUppercase ? "✓" : "○"}
                                  </span>
                                  <span>Contains uppercase letter</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 ${
                                    passwordChecks.hasLowercase
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {passwordChecks.hasLowercase ? "✓" : "○"}
                                  </span>
                                  <span>Contains lowercase letter</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 ${
                                    passwordChecks.hasNumber
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {passwordChecks.hasNumber ? "✓" : "○"}
                                  </span>
                                  <span>Contains number</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 ${
                                    passwordChecks.hasSpecial
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {passwordChecks.hasSpecial ? "✓" : "○"}
                                  </span>
                                  <span>Contains special character</span>
                                </div>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder="Re-enter password"
                                className={"border border-secondary-foreground"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between w-full">
                        <div className="flex h-full justify-start items-center w-full gap-2">
                          <Checkbox
                            id="showPassword"
                            onCheckedChange={(checked) =>
                              displayPassword(checked)
                            }
                            className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:border-secondary"
                          />
                          <Label htmlFor="showPassword">Show Password</Label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <section className="flex flex-col gap-2 w-full mt-2">
                  <Button
                    type="submit"
                    className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer"
                  >
                    {mode === "edit" ? `Confirm` : "Create"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => cancel()}
                    className="bg-gray-800 hover:bg-gray-600 w-full cursor-pointer"
                  >
                    Cancel
                  </Button>

                  {mode !== "edit" && (
                    <>
                      <div className="flex justify-between items-center w-full">
                        <hr className="w-1/3 border border-secondary" />
                        <h1 className="font-medium">Or</h1>
                        <hr className="w-1/3 border border-secondary" />
                      </div>
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSignIn}
                          onError={handleGoogleError}
                          theme="outline"
                          size="large"
                          text="signup_with"
                          shape="rectangular"
                          width="100%"
                        />
                      </div>
                    </>
                  )}
                </section>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AdminModal;
