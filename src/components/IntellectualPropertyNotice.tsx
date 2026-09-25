import React from "react";

export function IntellectualPropertyNotice() {
  return (
    <footer className="border-t border-white/10 bg-black/80 px-4 py-6 text-center text-[11px] leading-relaxed text-white/50 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold text-white/70">
          © 2026 LUXEPRIZEDRAW LIMITED. All rights reserved.
        </p>
        <p className="mt-2">
          The software, source code, visual assets, content and documentation are proprietary and must not be copied,
          reproduced, modified or distributed without written permission.
        </p>
        <p className="mt-2 text-white/35">
          Copyright protection arises automatically; trade marks and patents are separate registrations. See the UK
          Government guidance on{" "}
          <a className="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://www.gov.uk/copyright">
            copyright
          </a>
          ,{" "}
          <a className="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://www.gov.uk/how-to-register-a-trade-mark">
            trade marks
          </a>
          {" "}and{" "}
          <a className="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://www.gov.uk/patent-your-invention">
            patents
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
