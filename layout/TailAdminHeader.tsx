"use client";
import Link from "next/link";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import LogoutButton from "@/components/auth/LogoutButton";

export default function TailAdminHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isMobileOpen ? (
              // X icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M6.22 7.28a1 1 0 0 1 1.06-1.06L12 10.94l4.72-4.72a1 1 0 1 1 1.41 1.41L13.41 12l4.72 4.72a1 1 0 0 1-1.41 1.41L12 13.41l-4.72 4.72a1 1 0 0 1-1.41-1.41L10.59 12 6.22 7.28Z"/></svg>
            ) : (
              // Menu icon
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.5h16v1.5H2zM2 9.25h12v1.5H2zM2 14h16v1.5H2z"/></svg>
            )}
          </button>
          <Link href="/admin" className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Admin Panel
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

