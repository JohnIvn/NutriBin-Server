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
import { 
  User, Mail, Phone, MapPin, Calendar, Lock, 
  CheckCircle2, XCircle, Loader2, KeyRound, Eye, EyeOff, ShieldCheck
} from "lucide-react";

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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const birthday = form.watch("birthday");
  const email = form.watch("email");
  const password = form.watch("password");
  const contact = form.watch("contact");
  const emailVerificationCode = form.watch("emailVerificationCode");
  const emailChanged = isEdit && email !== originalEmail;

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
    if (!email || email.length < 3) { setEmailAvailable(null); return; }
    if (isEdit && email === originalEmail) { setEmailAvailable(null); return; }

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
      } catch (error) { console.error(error); } finally { setEmailChecking(false); }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [email, mode, originalEmail, isEdit, form]);

  useEffect(() => {
    if (!contact || contact.length < 11) { setPhoneAvailable(null); return; }
    if (isEdit && contact === originalPhone) { setPhoneAvailable(null); return; }

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
            form.setError("contact", { type: "manual", message: "Number taken" });
          } else {
            form.clearErrors("contact");
          }
        }
      } catch (error) { console.error(error); } finally { setPhoneChecking(false); }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [contact, mode, originalPhone, isEdit, form]);

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
    try {
      const formData = { ...values };
      if (emailChanged) {
        if (!values.emailVerificationCode?.trim()) { toast.error("Enter verification code"); return; }
        formData.emailVerificationCode = values.emailVerificationCode.trim();
      } else {
        delete formData.emailVerificationCode;
      }

      if (isEdit && staff) {
        const response = await Requests({ url: `/management/staff/${staff.staff_id}`, method: "PUT", data: formData, credentials: true });
        if (response.data.ok) { toast.success("Updated successfully"); if (onSuccess) onSuccess(); cancel(); }
      } else {
        const response = await Requests({ url: "/management/staff", method: "POST", data: formData, credentials: true });
        if (response.data.ok) { toast.success("Created successfully"); if (onSuccess) onSuccess(); cancel(); }
      }
    } catch (error) { toast.error(error.response?.data?.message || "Action failed"); }
  }

  const handleSendCode = async () => {
    if (!emailChanged && isEdit) { toast.info("Email unchanged"); return; }
    try {
      setSendingCode(true);
      const response = await Requests({
        url: staff?.staff_id ? `/management/staff/${staff.staff_id}/email-verification` : `/management/staff/email-verification`,
        method: "POST", data: { newEmail: email }, credentials: true
      });
      if (response.data?.ok) { toast.success("Code sent!"); setCodeSent(true); }
    } catch (error) { toast.error("Failed to send code"); } finally { setSendingCode(false); }
  };

  useEffect(() => {
    if (isEdit && staff) {
        const formattedBirthday = staff.birthday ? new Date(staff.birthday).toISOString().split("T")[0] : "";
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

  const InputIcon = ({ icon: Icon, active }) => (
    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${active ? "text-[#CD5C08]" : "text-gray-400 group-focus-within:text-[#CD5C08]"}`} />
  );

  return (
    <Dialog open={true} onOpenChange={cancel}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white">
        
        <div className="bg-[#CD5C08] p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isEdit ? "Edit Staff Profile" : "New Staff Registration"}
            </DialogTitle>
            <DialogDescription className="text-orange-100/90">
              {isEdit 
                ? `Currently editing: ${user.firstname || 'user'}` 
                : "Fill in the details below to create a new administrative account."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* personal information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                  <FormField control={form.control} name="firstname" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative group"><InputIcon icon={User} /><Input placeholder="Barry" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} /></div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastname" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <div className="relative group"><InputIcon icon={User} /><Input placeholder="Allen" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} /></div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                  <FormField control={form.control} name="birthday" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <div className="relative group"><InputIcon icon={Calendar} /><Input type="date" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} /></div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative group"><InputIcon icon={MapPin} /><Input placeholder="City, Country" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} /></div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* contact information */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Contact Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <InputIcon icon={Mail} active={emailAvailable} />
                          <Input placeholder="user@example.com" className={`pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08] ${emailAvailable === false ? "border-red-500 bg-red-50" : "border-gray-200"}`} {...field} />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailChecking && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                            {!emailChecking && emailAvailable === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </div>
                        </div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contact" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <InputIcon icon={Phone} active={phoneAvailable} />
                          <Input placeholder="09..." className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} />
                        </div>
                      </FormControl>
                      <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                    </FormItem>
                  )} />
                </div>

                {/* verification */}
                {(!isEdit || emailChanged) && (
                  <div className="p-4 border border-[#CD5C08]/30 bg-[#CD5C08]/5 rounded-lg mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#CD5C08] font-bold">Verify Email</Label>
                      <Button type="button" size="sm" onClick={handleSendCode} disabled={sendingCode || emailAvailable === false || !email} className="bg-[#CD5C08] text-white cursor-pointer hover:bg-[#A34906]">
                        {sendingCode ? "Sending..." : "Send Code"}
                      </Button>
                    </div>
                    <FormField control={form.control} name="emailVerificationCode" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative">
                          <InputIcon icon={KeyRound} active={codeFormatValid} />
                          <Input placeholder="6-digit code" maxLength={6} className="pl-10 h-10 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ""))} />
                        </div>
                        <div className="min-h-[1rem]">{codeError && <p className="text-[11px] text-red-500">{codeError}</p>}</div>
                      </FormItem>
                    )} />
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
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Password</FormLabel>
                        <div className="relative group">
                          <InputIcon icon={Lock} />
                          <Input type={showPass ? "text" : "password"} placeholder="••••••••" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Eye size={16} /></button>
                        </div>
                        <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Confirm</FormLabel>
                        <div className="relative group">
                          <InputIcon icon={Lock} /><Input type={showPass ? "text" : "password"} placeholder="••••••••" className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-[#CD5C08]" {...field} />
                        </div>
                        <div className="min-h-[1.25rem]"><FormMessage className="text-[11px]" /></div>
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* footer */}
              <div className="pt-6 flex flex-col gap-3">
                <Button type="submit" className="w-full h-12 bg-[#CD5C08] hover:bg-[#A34906] text-white font-bold text-lg cursor-pointer transition-all active:scale-95 shadow-md">
                  {isEdit ? "Save Changes" : "Create Account"}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={cancel} 
                  variant="outline" 
                  className="w-full h-12 border-gray-300 text-gray-500 hover:border-[#CD5C08] hover:text-[#CD5C08] hover:bg-orange-50 transition-all duration-200 cursor-pointer font-medium"
                >
                  Cancel
                </Button>

                {!isEdit && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google Workspace
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminModal;