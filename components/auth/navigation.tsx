"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ListChecks, Users, Package, ClipboardList } from "lucide-react";
import { ReactNode } from "react";

const routes = [
  {
    name: "Props",
    href: "/props",
    icon: ListChecks,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Parlays",
    href: "/parlays",
    icon: ClipboardList,
  },
];

export default function Navigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener("resize", checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="px-4 py-5 flex items-center justify-center">
            <h1 className="text-xl font-bold">Parlays</h1>
          </div>
          <div className="flex-grow flex flex-col">
            <ScrollArea className="flex-1">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === route.href
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <route.icon className="mr-3 h-5 w-5" />
                    {route.name}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full md:pl-64">
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center py-3 px-2 flex-1",
                pathname === route.href
                  ? "text-gray-900 dark:text-gray-50"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <route.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{route.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Adjust main content padding for mobile bottom nav */}
      <style jsx global>{`
        @media (max-width: 767px) {
          main {
            padding-bottom: 70px !important;
          }
        }
      `}</style>
    </div>
  );
} 