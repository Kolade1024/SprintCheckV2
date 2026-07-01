"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CodeBrackets,
  History,
  LayoutGrid,
  LogOut,
  Receipt,
  ShieldCheck,
  Tag,
  User,
  type IconProps,
} from "@/components/icons";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const PRIMARY: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "History", href: "/history", icon: History },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Developers", href: "/developers", icon: CodeBrackets },
  { label: "Pricing", href: "/pricing", icon: Tag },
];

const STORAGE_KEY = "sc-sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Restore persisted state without animating on first paint.
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function NavLink({ label, href, icon: Icon }: NavItem) {
    const active = isActive(href);
    return (
      <a
        href={href}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-btn py-2.5 text-base font-medium transition-colors ${
          collapsed ? "justify-center px-0" : "px-3"
        } ${
          active
            ? "bg-brand text-offwhite shadow-glow"
            : "text-body hover:bg-subtle hover:text-ink"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && active && <ChevronRight className="h-4 w-4 shrink-0" />}
      </a>
    );
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white p-5 lg:flex ${
        collapsed ? "w-[84px]" : "w-[272px]"
      } ${animate ? "transition-[width] duration-300 ease-smooth" : ""}`}
    >
      {/* Collapse toggle on the sidebar edge */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-pill border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Logo */}
      <a
        href="/"
        className={`mb-8 flex items-center gap-2.5 ${collapsed ? "justify-center px-0" : "px-2"}`}
        aria-label="SprintCheck home"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-brand shadow-glow">
          <ShieldCheck className="h-5 w-5 text-offwhite" />
        </span>
        {!collapsed && (
          <span className="text-card-title font-extrabold tracking-[-0.5px] text-ink">
            SprintCheck
          </span>
        )}
      </a>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1">
        {PRIMARY.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}

        <div className="my-3 h-px bg-line" />

        <NavLink label="Profile" href="/profile" icon={User} />
      </nav>

      {/* Logout pinned to bottom */}
      <a
        href="/signin"
        title={collapsed ? "Logout" : undefined}
        className={`mt-auto flex items-center gap-3 rounded-btn py-2.5 text-base font-medium text-body transition-colors hover:bg-subtle hover:text-ink ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {!collapsed && "Logout"}
      </a>
    </aside>
  );
}
