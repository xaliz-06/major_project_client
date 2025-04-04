"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "../_components/navbar";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [visitedPages, setVisitedPages] = useState(["/"]);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !visitedPages.includes(pathname)) {
      setVisitedPages((prev) => [...prev, pathname]);
    }
  }, [pathname, visitedPages]);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar visitedPages={visitedPages} />
      <div className="flex-1">{children}</div>
    </main>
  );
}
