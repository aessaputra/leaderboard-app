"use client";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import TailAdminSidebar from "@/layout/TailAdminSidebar";
import Backdrop from "@/layout/Backdrop";
import TailAdminHeader from "@/layout/TailAdminHeader";
import { useSidebar } from "@/context/SidebarContext";
import React from "react";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen xl:flex bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <TailAdminSidebar />
          <Backdrop />
          <ContentFrame>{children}</ContentFrame>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function ContentFrame({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";
  return (
    <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
      <TailAdminHeader />
      <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</div>
    </div>
  );
}
