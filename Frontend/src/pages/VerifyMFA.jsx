import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

export function VerifyMFA() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const { login } = useUser();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Prevent duplicate verification attempts
    if (verified) return;

    const verifyMFA = async () => {
      try {
        const token = searchParams.get("token");
        const staffId = searchParams.get("staffId");
        const adminId = searchParams.get("adminId");

        console.log("[MFA Page] Token:", token);
        console.log("[MFA Page] StaffId:", staffId);
        console.log("[MFA Page] AdminId:", adminId);

        if (!token || (!staffId && !adminId)) {
          setError("Invalid verification link - missing token or user ID");
          setVerifying(false);
          return;
        }

        const payload = {
          token,
          ...(staffId && { staffId }),
          ...(adminId && { adminId }),
        };

        console.log("[MFA Page] Sending payload:", payload);

        const response = await axios.post(
          "nutribin-server.railway.internalauthentication/verify-mfa",
          payload
        );

        console.log("[MFA Page] Response:", response.data);

        if (response.data.ok) {
          setVerified(true);
          toast.success("MFA verification successful!");
          // Log in the user with the returned staff data
          login(response.data.staff);
          // Redirect to dashboard after login
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          setError(response.data.message || "Verification failed");
          setVerifying(false);
        }
      } catch (err) {
        console.error("MFA verification error:", err);
        console.error("Error response:", err.response?.data);
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred during verification"
        );
        setVerifying(false);
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      verifyMFA();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams, navigate, login, verified]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {verifying ? (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Login
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email...
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Back to Login
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verified Successfully!
              </h1>
              <p className="text-gray-600">Redirecting you to login...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
