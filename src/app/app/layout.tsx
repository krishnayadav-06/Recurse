"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "../../components/UserDropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/app/dashboard" },
    { name: "Queue", href: "/app/queue" },
    { name: "Problems", href: "/app/problems" },
    { name: "Mastered", href: "/app/mastered" },
  ];

  const isReviewRoute = pathname?.startsWith("/app/review");

  if (isReviewRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-[60] h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-gray-900 cursor-pointer">
            Recurse
          </Link>
          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm cursor-pointer transition-colors ${
                    isActive ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserDropdown />
      </header>
      {children}
    </div>
  );
}
