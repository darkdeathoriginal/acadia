"use client";

import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Home,
  MessageSquare,
  Percent,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TopBar from "./TopBar";

const sidebarLinks = [
  { name: "Overview", icon: Home, href: "/user" },
  { name: "Attendance", icon: CalendarCheck, href: "/attendance" },
  { name: "Marks & Grades", icon: GraduationCap, href: "/mark" },
  { name: "Timetable", icon: BarChart3, href: "/timetable" },
  { name: "Calendar", icon: CalendarDays, href: "/planner" },
  { name: "Skip Pro", icon: Zap, href: "/skipcalculator" },
  { name: "GPA Calculator", icon: Percent, href: "/cgpacalculator" },
  { name: "Course Feedback", icon: MessageSquare, href: "/feedback" },
];

const mobileNavItems = [
  "Overview",
  "Attendance",
  "Timetable",
  "Marks & Grades",
  "Calendar",
];

export default function DashboardLayout({
  children,
  user,
  activeTab,
}: {
  children: React.ReactNode;
  user: any;
  activeTab: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#060608] text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[#1a1a24] bg-[#0A0A0A] flex flex-col justify-between hidden md:flex h-full flex-shrink-0">
        <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="p-6 pb-2">
            <div className="text-2xl font-bold tracking-tight">Acadia</div>
          </div>
          <nav className="px-4 space-y-1 mt-4 pb-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-black" : "text-gray-400"}
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-[#0A0A0A] border-r border-[#1a1a24] z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="p-6 pb-2 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight">Acadia</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="px-4 space-y-1 mt-4 pb-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-black" : "text-gray-400"}
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full relative bg-[#09090b]">
        <TopBar user={user} onMenuToggle={() => setMobileMenuOpen(true)} />
        {children}
      </main>

      {/* Mobile Nav Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 flex justify-around items-center bg-[#09090b]/80 backdrop-blur-md z-50 border-t border-white/5">
        {sidebarLinks
          .filter((l) => mobileNavItems.includes(l.name))
          .map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.name;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex flex-col items-center gap-1 p-2"
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-white mt-1"></div>
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
