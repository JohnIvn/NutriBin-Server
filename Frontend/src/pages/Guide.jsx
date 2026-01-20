import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Guide() {
  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4D39]">
              Help &amp; Support
            </h1>
            <p className="text-sm text-[#6B6F68] italic">
              Account help and support resources
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">Account Access</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-[#4F6F52] mb-3">
                Sign in using your corporate email and password at the login
                page. Employees should use credentials issued by their
                administrator.
              </p>
              <ul className="list-disc pl-5 text-sm text-[#4F6F52] space-y-1">
                <li>
                  Open <strong>Login</strong> from the top-right of the site.
                </li>
                <li>
                  If prompted, complete multi-factor authentication (MFA).
                </li>
                <li>
                  To change your password, use the{" "}
                  <strong>Forgot Password</strong> flow.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Lost Access / Recovery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-[#4F6F52] mb-3">
                If you cannot sign in, follow these steps:
              </p>
              <ol className="list-decimal pl-5 text-sm text-[#4F6F52] space-y-1">
                <li>
                  Click <strong>Login</strong> → <em>Forgot Password</em> and
                  follow the email reset instructions.
                </li>
                <li>
                  Check spam/junk folders if you don't receive the reset email.
                </li>
                <li>
                  If you lost MFA device, use backup codes or contact support to
                  re-provision MFA.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Employee Help (Heko)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-[#4F6F52] mb-3">
                For employee onboarding, access, or deprovisioning, contact your
                local Heko or administrator.
              </p>
              <p className="text-sm text-[#4F6F52]">
                When requesting help provide: full name, corporate email,
                account affected, and a short problem description.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#3A4D39]">
                Contact Support
              </h2>
              <p className="text-sm text-[#4F6F52]">
                For issues that cannot be resolved by your administrator,
                contact platform support.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="mailto:support@nutribin.com"
                className="px-4 py-2 bg-[#3A4D39] text-[#ECE3CE] rounded-md font-semibold"
              >
                Email Support
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
