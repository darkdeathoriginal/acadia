"use client";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie } from "@/utils/helpers";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Percent,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Mark() {
  const { data: user, loading: userLoading } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const {
    data: marksData,
    loading: marksLoading,
    error,
  } = useFetchWithCache("/api/mark", "cache_mk");

  const [activeTab, setActiveTab] = useState("Marks & Grades");

  const sidebarLinks = [
    { name: "Overview", icon: Home, href: "/user" },
    { name: "Attendance", icon: CalendarCheck, href: "/attendance" },
    { name: "Marks & Grades", icon: GraduationCap, href: "/mark" },
    { name: "Timetable", icon: BarChart3, href: "/timetable" },
    { name: "Courses", icon: Activity, href: "#" },
    { name: "Calendar", icon: CalendarDays, href: "/planner" },
    { name: "GPA Calculator", icon: Percent, href: "/cgpacalculator" },
    { name: "Skip Pro", icon: Zap, href: "#" },
    { name: "Course Feedback", icon: MessageSquare, href: "/feedback" },
    { name: "Report Issue", icon: MessageSquare, href: "#" },
  ];

  // Logic Calculations
  let overallTotal = 0;
  let maxPossibleTotal = 0;
  let subjectsWithMarks = 0;
  let globalPercentage = 0;

  if (marksData && Array.isArray(marksData) && !marksData.error) {
    marksData.forEach((subject) => {
      // Collect local total
      let localTotal = 0;
      let localMax = 0;
      let hasMarks = false;

      subject.marks.forEach((m) => {
        if (
          m.mark !== undefined &&
          m.mark !== "N/A" &&
          m.mark !== "Ab" &&
          m.mark !== "-"
        ) {
          localTotal += Number(m.mark);
          const maxValMatch = m.total;
          if (maxValMatch) {
            localMax += Number(maxValMatch);
          }
          hasMarks = true;
        }
      });

      // Use the API's total sum if given and local total failed, simplified for robustness
      let subjectTotal = Number(subject.total) || localTotal;
      let subjectMax = localMax > 0 ? localMax : 100; // default assumption if unknown

      if (hasMarks || subject.total) {
        subjectsWithMarks++;
        overallTotal += subjectTotal;
        maxPossibleTotal += subjectMax;
      }
    });

    if (maxPossibleTotal > 0) {
      globalPercentage = Math.round((overallTotal / maxPossibleTotal) * 100);
    }
  }

  return (
    <div className="flex h-screen bg-[#060608] text-white font-sans overflow-hidden">
      {/* Sidebar */}
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
                  onClick={() => setActiveTab(link.name)}
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

        {/* Sidebar Footer Component */}
        <div className="p-6 pb-8 border-t border-[#1a1a24] bg-[#0A0A0A]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-yellow-600 flex justify-center items-center font-bold text-lg text-white shadow-lg shadow-green-900/20 relative cursor-pointer ring-2 ring-[#0A0A0A]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "N"}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></div>
            </div>
            <button
              onClick={() => delCookie()}
              className="p-2 aspect-square rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full relative bg-[#09090b]">
        {/* Top bar */}
        <header className="flex justify-end items-center px-8 py-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-20 hidden md:flex">
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Moon size={20} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-900/30 bg-blue-900/10 text-blue-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> Trial: 3d left
            </div>
            <div className="w-8 h-8 rounded-md bg-[#252525] flex justify-center items-center font-bold text-sm cursor-pointer border border-white/10 text-gray-200 ml-2">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* Marks Content */}
        <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
          {/* Academic Performance Overview Section */}
          <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-gray-300 w-5 h-5" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Academic Performance
                </h2>
              </div>
            </div>

            {/* Stats Grid Inside Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-[#0d0d12]">
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3 className="text-4xl font-bold text-white mb-2">
                  {globalPercentage}%
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  Overall Average
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3 className="text-4xl font-bold text-white mb-2">
                  {subjectsWithMarks}
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  Subjects with Marks
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3 className="text-4xl font-bold text-white mb-2">
                  {(overallTotal / 10).toFixed(2)}/10
                </h3>
                <p className="text-gray-400 text-sm font-medium">Total Marks</p>
              </div>
            </div>
          </div>

          {/* Subjects List */}
          <div
            className="flex flex-col gap-6 animate-fade-in-up delay-100"
            style={{ minHeight: "150px", animationDelay: "100ms" }}
          >
            {marksLoading && !marksData && (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin"></div>
              </div>
            )}

            {(error || (marksData && marksData.error)) && (
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl text-center">
                Failed to load marks. Please try again or refresh the page.
              </div>
            )}

            {marksData &&
              Array.isArray(marksData) &&
              !marksData.error &&
              marksData.map((course, i) => {
                // Process sum logic for this subject
                let subjObtained = 0;
                let subjMax = 0;
                let validMarks = false;

                course.marks.forEach((m) => {
                  if (
                    m.mark !== undefined &&
                    m.mark !== "N/A" &&
                    m.mark !== "Ab" &&
                    m.mark !== "-"
                  ) {
                    subjObtained += Number(m.mark);
                    subjMax += Number(m.total || 0);
                    validMarks = true;
                  }
                });

                if (Number(course.total) > 0) {
                  subjObtained = Number(course.total);
                }

                if (subjMax === 0) subjMax = 10; // Default assumption for the UI

                const subjPercent =
                  subjMax > 0 ? Math.round((subjObtained / subjMax) * 100) : 0;

                return (
                  <div
                    key={i + course.code}
                    className="border border-white/5 rounded-2xl bg-[#0d0d12] p-6 flex flex-col relative overflow-hidden shadow-lg group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1.5">
                          {course.name}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium">
                          {course.code} • {course.type || "Theory"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {subjObtained.toFixed(2)}
                          <span className="text-gray-500 text-lg">
                            /{subjMax}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm font-medium mt-1">
                          {subjPercent}%
                        </div>
                      </div>
                    </div>

                    {/* Detail Cards Area */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      {course.marks &&
                        course.marks.map((m, idx) => (
                          <div
                            key={idx}
                            className="bg-[#14141a] border border-white/5 rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px]"
                          >
                            <h4 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-2 line-clamp-1">
                              {m.name}
                            </h4>
                            <div className="flex justify-between items-end">
                              <span className="text-lg font-bold text-white">
                                {m.mark}
                              </span>
                              <span className="text-xs text-gray-500">
                                /{m.total}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Subject Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-auto">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${subjPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

            {marksData &&
              Array.isArray(marksData) &&
              !marksData.error &&
              marksData.length === 0 && (
                <div className="text-center py-10 text-gray-500 border border-white/5 rounded-2xl bg-[#0d0d12]">
                  No marks found
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Mobile Nav Header overlay - only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-[#09090b]/80 backdrop-blur-md z-50 border-b border-white/5 mt-14">
        <div className="text-xl font-bold">Acadia</div>
        <div className="w-8 h-8 rounded-md bg-[#252525] flex justify-center items-center font-bold text-sm border border-white/10 text-gray-200">
          {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
        </div>
      </div>
    </div>
  );
}
