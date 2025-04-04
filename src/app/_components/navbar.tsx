"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { CheckCircle2Icon } from "lucide-react";

type Props = {
  visitedPages: string[];
};

export function Navbar({ visitedPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const pages = [
    { path: "/", label: "Upload" },
    { path: "/transcription", label: "Refined Output" },
    { path: "/entities", label: "Output" },
    { path: "/patient-info", label: "Patient Info" },
    { path: "/final-prescription", label: "Final Prescription" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex h-[80px] items-center justify-center gap-2.5 border-b-2 border-amber-500 bg-gray-900 py-4">
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => {
              if (visitedPages.includes(page.path)) router.push(page.path);
            }}
            className={`flex flex-row items-center justify-center gap-2 rounded-[5px] border-none bg-[#333] px-[15px] py-[10px] text-base text-white transition-all duration-300 ease-in-out hover:scale-[1.05] hover:bg-[#ff9800] ${pathname === page.path ? "scale-[1.1] bg-blue-700 font-bold" : ""} ${!visitedPages.includes(page.path) ? "cursor-not-allowed bg-[#555] opacity-60" : "cursor-pointer bg-green-500/70"} `}
            disabled={!visitedPages.includes(page.path)}
          >
            {page.label}
            {visitedPages.includes(page.path) && pathname !== page.path && (
              <CheckCircle2Icon size={"20px"} />
            )}
          </button>
          {index < pages.length - 1 && (
            <span className="px-[5px] text-xl text-white">→</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
