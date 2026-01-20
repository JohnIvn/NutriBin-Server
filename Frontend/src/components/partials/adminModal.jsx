import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

function AdminModal({ mode, cancel, staff, onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [user, setUser] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");
  // const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(null);
  const [originalPhone, setOriginalPhone] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  // const [codeSent, setCodeSent] = useState(false);
  const [codeFormatValid, setCodeFormatValid] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const isEdit = mode === "edit";

  const form = useForm({
    resolver: zodResolver(isEdit ? adminAccountEdit : adminAccount),
    mode: "onChange",
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
  const confirmPassword = form.watch("confirmPassword");
  const contact = form.watch("contact");
  const emailVerificationCode = form.watch("emailVerificationCode");
  const emailChanged = isEdit && email !== originalEmail;

  const passwordChecks = {
    minLength: password && password.length >= 8 && password.length <= 20,
    hasUppercase: password && /[A-Z]/.test(password),
    hasLowercase: password && /[a-z]/.test(password),
    hasNumber: password && /\d/.test(password),
    hasSpecial: password && /[^A-Za-z0-9]/.test(password),
    match: password && confirmPassword && password === confirmPassword,
  };

  useEffect(() => {
    if (!birthday) return;
    const age = calculateAge(birthday);
    form.setValue("age", age, { shouldValidate: true });
  }, [birthday, form]);

  useEffect(() => {
    if (!emailVerificationCode) {
      setCodeFormatValid(false);
      return;
    }
    setCodeFormatValid(/^\d{6}$/.test(emailVerificationCode.trim()));
    setCodeError("");
  }, [emailVerificationCode]);

  useEffect(() => {
    if (!codeFormatValid) {
      setCodeVerified(false);
      return;
    }

    // Only verify when email is present and it's either a create or an edited email
    if (!email) return;
    if (isEdit && !emailChanged) return;
    if (emailAvailable === false) return;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await Requests({
          url: "/codes/check",
          method: "POST",
          data: {
            email: email.trim().toLowerCase(),
            code: emailVerificationCode.trim(),
            purpose: "email_verification",
          },
          credentials: true,
        });
        if (response.data?.valid) {
          setCodeVerified(true);
          setCodeError("");
          form.clearErrors("emailVerificationCode");
        } else {
          setCodeVerified(false);
          setCodeError(response.data?.message || "Invalid code");
        }
      } catch (err) {
        setCodeVerified(false);
        setCodeError("Failed to verify code");
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [
    codeFormatValid,
    emailVerificationCode,
    email,
    emailAvailable,
    isEdit,
    emailChanged,
    form,
  ]);

  useEffect(() => {
    if (!email || email.length < 3) {
      setEmailAvailable(null);
      return;
    }
    if (isEdit && email === originalEmail) {
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
            form.setError("email", { type: "manual", message: "Email taken" });
          } else {
            form.clearErrors("email");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setEmailChecking(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [email, mode, originalEmail, isEdit, form]);

  useEffect(() => {
    if (!contact || contact.length < 11) {
      setPhoneAvailable(null);
      return;
    }
    if (isEdit && contact === originalPhone) {
      setPhoneAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // setPhoneChecking(true);
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
              message: "Number taken",
            });
          } else {
            form.clearErrors("contact");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        /* setPhoneChecking(false); */
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [contact, mode, originalPhone, isEdit, form]);

  async function onSubmit(values) {
    try {
      const formData = { ...values };
      if (isEdit) {
        if (emailChanged) {
          if (!values.emailVerificationCode?.trim()) {
            toast.error("Enter verification code");
            return;
          }
          formData.emailVerificationCode = values.emailVerificationCode.trim();
        } else {
          delete formData.emailVerificationCode;
        }
      } else {
        // Creating new staff: require verification code
        if (!values.emailVerificationCode?.trim()) {
          toast.error("Enter verification code");
          return;
        }
        formData.emailVerificationCode = values.emailVerificationCode.trim();
      }

      if (isEdit && staff) {
        const response = await Requests({
          url: `/management/staff/${staff.staff_id}`,
          method: "PUT",
          data: formData,
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Updated successfully");
          if (onSuccess) onSuccess();
          cancel();
        }
      } else {
        const response = await Requests({
          url: "/management/staff",
          method: "POST",
          data: formData,
          credentials: true,
        });
        if (response.data.ok) {
          toast.success("Created successfully");
          if (onSuccess) onSuccess();
          cancel();
        }
      }
    } catch {
      toast.error("Action failed");
    }
  }

  async function handleGoogleSignup(credentialResponse) {
    try {
      setGoogleError("");
      const response = await Requests({
        url: "/management/staff/google-signup",
        method: "POST",
        data: { credential: credentialResponse.credential },
        credentials: true,
      });

      if (response.data?.ok) {
        toast.success("Staff account created successfully via Google!");
        if (onSuccess) onSuccess();
        cancel();
      } else {
        const errorMsg =
          response.data?.error ||
          response.data?.message ||
          "Google signup failed";
        setGoogleError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Google signup failed";
      setGoogleError(errorMsg);
      toast.error(errorMsg);
    }
  }

  function handleGoogleError() {
    const errorMsg = "Google signup failed. Please try again.";
    setGoogleError(errorMsg);
    toast.error(errorMsg);
  }

  const handleSendCode = async () => {
    if (!emailChanged && isEdit) {
      toast.info("Email unchanged");
      return;
    }
    try {
      setSendingCode(true);
      const response = await Requests({
        url: staff?.staff_id
          ? `/management/staff/${staff.staff_id}/email-verification`
          : `/management/staff/email-verification`,
        method: "POST",
        data: { newEmail: email },
        credentials: true,
      });
      if (response.data?.ok) {
        toast.success("Code sent!"); /* setCodeSent(true); */
      }
    } catch {
      toast.error("Failed to send code");
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (isEdit && staff) {
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
      setUser(staffData);
      form.reset(staffData);
    }
  }, [mode, staff, isEdit, form]);

  // eslint-disable-next-line no-unused-vars
  const InputIcon = ({ icon: IconComp, active }) => (
    <IconComp
      className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
        active
          ? "text-[#4F6F52]"
          : "text-gray-400 group-focus-within:text-[#4F6F52]"
      }`}
    />
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Dialog open={true} onOpenChange={cancel}>
        <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-[#4F6F52] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {isEdit ? "Edit Staff Profile" : "New Staff Registration"}
              </DialogTitle>
              <DialogDescription className="text-orange-100/90">
                {isEdit
                  ? `Currently editing: ${user.firstname || "user"}`
                  : "Fill in the details below to create a new administrative account."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* personal information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={User} />
                              <Input
                                placeholder="Barry"
                                className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={User} />
                              <Input
                                placeholder="Allen"
                                className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>Birthday</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={Calendar} />
                              <Input
                                type="date"
                                className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={MapPin} />
                              <Input
                                placeholder="City, Country"
                                className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* contact information */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={Mail} active={emailAvailable} />
                              <Input
                                placeholder="user@example.com"
                                className={`pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] ${
                                  emailAvailable === false
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                }`}
                                {...field}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailChecking && (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                                {!emailChecking && emailAvailable === true && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem className="space-y-1 text-[#4F6F52]">
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <InputIcon icon={Phone} active={phoneAvailable} />
                              <Input
                                placeholder="09..."
                                className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <div className="min-h-[1.25rem]">
                            <FormMessage className="text-[11px]" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* verification */}
                  {(!isEdit || emailChanged) && (
                    <div className="p-4 border border-[#4F6F52]/30 bg-[#4F6F52]/5 rounded-lg mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[#4F6F52] font-bold">
                          Verify Email
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSendCode}
                          disabled={
                            sendingCode || emailAvailable === false || !email
                          }
                          className="bg-[#4F6F52] text-white cursor-pointer hover:bg-[#A34906]"
                        >
                          {sendingCode ? "Sending..." : "Send Code"}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="emailVerificationCode"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <div className="relative">
                              <InputIcon
                                icon={KeyRound}
                                active={codeFormatValid}
                              />
                              <Input
                                placeholder="6-digit code"
                                maxLength={6}
                                className="pl-10 h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/[^0-9]/g, ""),
                                  )
                                }
                              />

                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                {!codeFormatValid && (
                                  <span className="text-gray-400 text-xs">
                                    •••
                                  </span>
                                )}
                                {codeFormatValid &&
                                  !codeVerified &&
                                  !codeError && (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                  )}
                                {codeVerified && (
                                  <CheckCircle2
                                    className="w-4 h-4 text-green-500"
                                    title="Code verified"
                                  />
                                )}
                                {codeError && (
                                  <XCircle
                                    className="w-4 h-4 text-red-500"
                                    title={codeError}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="min-h-[1rem]">
                              {codeError && (
                                <p className="text-[11px] text-red-500">
                                  {codeError}
                                </p>
                              )}
                              {codeVerified && (
                                <p className="text-[11px] text-green-600">
                                  Code verified
                                </p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* password */}
                {!isEdit && (
                  <div className="space-y-3 pt-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Security
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1 text-[#4F6F52]">
                            <FormLabel>Password</FormLabel>
                            <div className="relative group">
                              <InputIcon icon={Lock} />
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4F6F52] cursor-pointer transition-colors"
                              >
                                {showPass ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            </div>
                            <div className="min-h-[1.25rem]">
                              <FormMessage className="text-[11px]" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-1 text-[#4F6F52]">
                            <FormLabel>Confirm</FormLabel>
                            <div className="relative group">
                              <InputIcon icon={Lock} />
                              <Input
                                type={showConfirmPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52]"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPass(!showConfirmPass)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4F6F52] cursor-pointer transition-colors"
                              >
                                {showConfirmPass ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            </div>
                            <div className="min-h-[1.25rem]">
                              <FormMessage className="text-[11px]" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Password Strength Indicators */}
                    {password && (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Password must contain:
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                passwordChecks.minLength
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              {passwordChecks.minLength && (
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
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
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                passwordChecks.hasUppercase
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }
                            >
                              One uppercase
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
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                passwordChecks.hasLowercase
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }
                            >
                              One lowercase
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
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
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
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                passwordChecks.hasSpecial
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }
                            >
                              One special char
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                passwordChecks.match
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              {passwordChecks.match && (
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
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
                )}

                {/* footer */}
                <div className="pt-6 flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#4F6F52] hover:bg-[#3A4D39] text-white font-bold text-lg cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    {isEdit ? "Save Changes" : "Create Account"}
                  </Button>

                  <Button
                    type="button"
                    onClick={cancel}
                    variant="outline"
                    className="w-full h-12 text-white bg-[#FF3838] hover:bg-[#DC0000] hover:text-[white] transition-all duration-200 cursor-pointer font-medium"
                  >
                    Cancel
                  </Button>

                  {!isEdit && (
                    <>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-400">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSignup}
                          onError={handleGoogleError}
                          useOneTap
                          theme="outline"
                          size="large"
                          text="signup_with"
                          shape="rectangular"
                          width="100%"
                        />
                      </div>
                      {googleError && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs text-center">
                          {googleError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </GoogleOAuthProvider>
  );
}

export default AdminModal;
