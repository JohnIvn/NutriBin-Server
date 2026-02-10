import React from "react";
import { Cookie, Info, Settings, Shield } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen pb-12 font-sans text-[#3A4D39] overflow-x-hidden">
      {/* header */}
      <header className="pt-30 pb-32 px-10 text-center text-white relative">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-[#3A4D39]/10 p-4 rounded-full backdrop-blur-sm shadow-inner border border-white/20">
              <Cookie className="w-10 h-10 text-[#3A4D39]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm text-[#4F6F52]">
            Cookie Policy
          </h1>
          <p className=" text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed text-[#4F6F52]/60">
            How NutriBin Uses Cookies to Improve Your Experience
          </p>
        </div>
      </header>

      {/* main container */}
      <main className="max-w-6xl mx-auto -mt-24 px-4 sm:px-6 relative z-10">
        <div className="bg-white shadow-2xl border-none overflow-hidden rounded-2xl">
          <div className="p-8 md:p-16 space-y-16">
            {/* intro */}
            <div className="space-y-6 border-b pb-10 border-[#ECE3CE]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm font-bold tracking-wide text-[#4F6F52] uppercase bg-[#4F6F52]/10 px-3 py-1 rounded-full">
                  Effective Date: January 2026
                </p>
                <div className="text-xs text-[#739072] font-mono">
                  REF: NB-CP-V1
                </div>
              </div>
              <p className="text-lg leading-relaxed text-[#4F6F52]">
                This Cookie Policy explains what cookies are, how we use them,
                and your choices regarding our use of cookies in the NutriBin
                application.
              </p>
            </div>

            {/* timeline section */}
            <div className="relative">
              {/* timeline vertical line */}
              <div className="hidden md:block absolute left-9.75 top-4 bottom-4 w-0.5 bg-[#ECE3CE] -z-10" />

              <div className="space-y-16">
                {/* section 1 */}
                <CookieSection number="1" title="What are Cookies?">
                  <p>
                    Cookies are small text files that are stored on your device
                    when you visit a website. They are widely used to make
                    websites work more efficiently and to provide information to
                    the owners of the site.
                  </p>
                </CookieSection>

                {/* section 2 */}
                <CookieSection number="2" title="How We Use Cookies">
                  <p className="mb-4">
                    NutriBin uses cookies for the following purposes:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#ECE3CE]">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-[#3A4D39]" />
                        <strong className="text-[#3A4D39]">
                          Essential Cookies
                        </strong>
                      </div>
                      <span className="text-sm text-[#739072]">
                        Required for the operation of the system, such as
                        maintaining your login session and security features.
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#ECE3CE]">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="w-5 h-5 text-[#3A4D39]" />
                        <strong className="text-[#3A4D39]">
                          Preference Cookies
                        </strong>
                      </div>
                      <span className="text-sm text-[#739072]">
                        Used to remember your settings and preferences (e.g.,
                        dashboard layout or language).
                      </span>
                    </div>
                  </div>
                </CookieSection>

                {/* section 3 */}
                <CookieSection number="3" title="Types of Cookies We Use">
                  <ul className="space-y-4">
                    {[
                      {
                        title: "Session Cookies",
                        desc: "Temporary cookies that expire once you close your browser or session.",
                      },
                      {
                        title: "Persistent Cookies",
                        desc: "Cookies that remain on your device for a set period or until you delete them.",
                      },
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="bg-[#FAF9F6] p-4 rounded-lg border border-[#ECE3CE]"
                      >
                        <strong className="text-[#3A4D39]">
                          {item.title}:
                        </strong>{" "}
                        <span className="text-[#739072] text-sm">
                          {item.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CookieSection>

                {/* section 4 */}
                <CookieSection number="4" title="Managing Cookies">
                  <p>
                    Most web browsers allow you to control cookies through their
                    settings. You can set your browser to block or alert you
                    about these cookies, but some parts of the system may not
                    work.
                  </p>
                  <div className="mt-4 p-4 bg-[#ECE3CE]/30 rounded-lg border-l-4 border-[#3A4D39] text-[#4F6F52]">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4" />
                      <strong>Pro Tip:</strong>
                    </div>
                    Deleting cookies will sign you out of NutriBin and may reset
                    some of your visual preferences.
                  </div>
                </CookieSection>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* copyright footer */}
      <footer className="text-center text-[#739072] text-sm mt-12 pb-8 font-medium">
        &copy; 2026 NutriBin System. All rights reserved.
      </footer>
    </div>
  );
}

// --- Helper Component for Timeline Sections ---
function CookieSection({ number, title, children }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 group">
      {/* number bubble */}
      <div className="shrink-0">
        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#3A4D39] group-hover:bg-[#4F6F52] transition-colors duration-300 text-[#ECE3CE] text-2xl md:text-3xl font-black shadow-lg ring-8 ring-white z-10 relative">
          {number}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 pt-2 md:pt-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#3A4D39] group-hover:text-[#4F6F52] transition-colors">
          {title}
        </h2>
        <div className="text-[#4F6F52] leading-relaxed text-lg space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
