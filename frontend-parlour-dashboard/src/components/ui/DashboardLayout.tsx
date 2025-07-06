"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  Clock,
  LogOut,
  ChevronDown,
  Menu
} from "lucide-react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin", "superadmin"],
  },
  {
    href: "/dashboard/employees",
    label: "Employees",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin", "superadmin"],
  },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    icon: <ListTodo className="h-5 w-5" />,
    roles: ["admin", "superadmin"],
  },
  {
    href: "/dashboard/attendance",
    label: "Attendance",
    icon: <Clock className="h-5 w-5" />,
    roles: ["admin", "superadmin"],
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        pathname === item.href &&
          "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-gray-50/50 dark:bg-gray-800/50 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">Parlour Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-2">
              {filteredNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-gray-50/50 px-4 dark:bg-gray-800/50 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-lg">Parlour Admin</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 p-2">
                {filteredNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>
              <div className="border-t p-4">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">Parlour Admin</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
} 