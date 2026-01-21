import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";

export function VerifyMFASMS() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const staffId = searchParams.get("staffId");
  const adminId = searchParams.get("adminId");

  useEffect(() => {
    if (!staffId && !adminId) {
      setError("Missing staffId or adminId");
    }
  }, [staffId, adminId]);

  const handleSubmit = async () => {
    if (!code || !/^\d{6}$/.test(code.trim())) {
      setError("Enter a 6-digit code");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        code: code.trim(),
        ...(staffId && { staffId }),
        ...(adminId && { adminId }),
      };
      const res = await Requests({
        url: "/authentication/verify-mfa-sms",
        method: "POST",
        data: payload,
      });
      if (res.data?.ok) {
        toast.success("MFA verification successful!");
        login(res.data.staff);
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(res.data?.message || "Verification failed");
      }
    } catch (err) {
      console.error("verify sms error", err);
      setError(
        err.response?.data?.message || err.message || "Verification error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Enter SMS Code
          </h1>
          <p className="text-gray-600 mb-4">
            We sent a 6-digit code to your phone. Enter it below to complete
            login.
          </p>

          <div className="mb-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="mt-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyMFASMS;
