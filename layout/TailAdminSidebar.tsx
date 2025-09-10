"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LayoutDashboard, ChevronDown, Users, Trophy, Clock } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

type SubItem = { name: string; path: string };
type NavItem = {
  name: string;
  icon: ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
  { name: "Aktivitas", icon: <Clock size={18} />, path: "/admin/activity" },
  {
    name: "Users",
    icon: <Users size={18} />,
    subItems: [
      { name: "Approve", path: "/admin/users" },
      { name: "Manage", path: "/admin/users/manage" },
    ],
  },
  {
    name: "Trophies",
    icon: <Trophy size={18} />,
    subItems: [
      { name: "Request", path: "/admin/trophies/requests" },
      { name: "Manage", path: "/admin/trophies/manage" },
    ],
  },
];

export default function TailAdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // auto-open submenu if any subItem matches current path
    let found: number | null = null;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((s) => {
        if (isActive(s.path)) found = index;
      });
    });
    setOpenSubmenu(found);
  }, [isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `sub-${openSubmenu}`;
      const el = subMenuRefs.current[key];
      setSubMenuHeight((prev) => ({ ...prev, [key]: el?.scrollHeight || 0 }));
    }
  }, [openSubmenu]);

  // Close the mobile sidebar after navigation
  const closeOnNavigate = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  // Also close automatically when the route changes (e.g., via browser back)
  useEffect(() => {
    if (isMobileOpen) toggleMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900
      ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 px-5`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-5 ${!isExpanded && !isHovered ? "lg:flex lg:justify-center" : ""}`}>
        <Link href="/admin" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          {isExpanded || isHovered || isMobileOpen ? "Admin Panel" : "LB"}
        </Link>
      </div>
      <nav className="no-scrollbar flex flex-col gap-2 overflow-y-auto pb-10">
        <h2 className={`mb-2 text-xs uppercase text-gray-400 ${!isExpanded && !isHovered ? "lg:text-center" : ""}`}>Menu</h2>
        <ul className="flex flex-col gap-2">
          {navItems.map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => setOpenSubmenu((p) => (p === index ? null : index))}
                  className={`menu-item ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"} ${
                    !isExpanded && !isHovered ? "lg:justify-center" : ""
                  }`}
                >
                  <span className={openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDown
                      size={18}
                      className={`ml-auto transition-transform ${openSubmenu === index ? "rotate-180 text-brand-500" : ""}`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    onClick={closeOnNavigate}
                    className={`menu-item ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                  >
                    <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  </Link>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`sub-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: openSubmenu === index ? `${subMenuHeight[`sub-${index}`] || 0}px` : "0px" }}
                >
                  <ul className="ml-9 mt-2 space-y-1">
                    {nav.subItems.map((s) => (
                      <li key={s.name}>
                        <Link
                          href={s.path}
                          onClick={closeOnNavigate}
                          className={`menu-dropdown-item ${isActive(s.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
