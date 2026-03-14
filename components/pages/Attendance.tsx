"use client";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie } from "@/utils/helpers";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  GraduationCap,
  History,
  Home,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Percent,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Attendance() {
  const { data: user, loading: userLoading } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const {
    data: attendanceData,
    loading: attendanceLoading,
    error,
  } = useFetchWithCache("/api/attendance", "cache_at");

  const [activeTab, setActiveTab] = useState("Attendance");

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
    { name: "Contact Us", icon: Mail, href: "#" },
  ];

  // Logic Calculations
  let totalCourses = 0;
  let averageAttendance = 0;
  let below75Count = 0;

  if (attendanceData && Array.isArray(attendanceData)) {
    totalCourses = attendanceData.length;
    let totalPercent = 0;
    attendanceData.forEach((course) => {
      const conducted = Number(course.conducted) || 0;
      const absent = Number(course.absent) || 0;
      const present = conducted - absent;
      const percent =
        course.percent !== undefined
          ? course.percent
          : conducted === 0
            ? 100
            : Math.round((present / conducted) * 100);
      totalPercent += percent;
      if (percent < 75) below75Count++;
    });
    averageAttendance =
      totalCourses > 0 ? Math.round(totalPercent / totalCourses) : 0;
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
        {/* Top bar (for desktop layout consistency matching image) */}
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

        {/* Attendance Content */}
        <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
          {/* Attendance Overview Section */}
          <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-gray-300 w-5 h-5" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Attendance Overview
                </h2>
                <Info className="text-gray-500 w-4 h-4 ml-1" />
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/10 bg-[#121217] cursor-pointer hover:bg-white/5 transition-colors">
                <History className="text-gray-400 w-4 h-4" />
                <div className="w-px h-4 bg-white/10"></div>
                <ChevronDown className="text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Stats Grid Inside Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-[#0d0d12]">
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3 className="text-4xl font-bold text-white mb-1">
                  {averageAttendance}%
                </h3>
                <p className="text-gray-400 text-sm font-medium">Average</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3 className="text-4xl font-bold text-white mb-1">
                  {totalCourses}
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  Total Courses
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                <h3
                  className={`text-4xl font-bold mb-1 ${below75Count > 0 ? "text-red-500" : "text-[#22c55e]"}`}
                >
                  {below75Count}
                </h3>
                <p className="text-gray-400 text-sm font-medium">Below 75%</p>
              </div>
            </div>
          </div>

          {/* Attendance Prediction Section */}
          <div
            className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] p-5 flex justify-between items-center shadow-lg animate-fade-in-up delay-100"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-gray-300 w-5 h-5" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Attendance Prediction
              </h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors bg-[#14141a]">
              <CalendarIcon className="w-4 h-4" />
              Select dates
            </button>
          </div>

          {/* Courses List */}
          <div
            className="flex flex-col gap-4 mb-6 animate-fade-in-up delay-200"
            style={{ minHeight: "150px", animationDelay: "200ms" }}
          >
            {attendanceLoading && !attendanceData && (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin"></div>
              </div>
            )}

            {error && (
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl text-center">
                Failed to load attendance. Please try again.
              </div>
            )}

            {attendanceData &&
              Array.isArray(attendanceData) &&
              attendanceData.map((course, i) => {
                const conducted = Number(course.conducted) || 0;
                const absent = Number(course.absent) || 0;
                const present = conducted - absent;
                const percent =
                  course.percent !== undefined
                    ? course.percent
                    : conducted === 0
                      ? 100
                      : Math.round((present / conducted) * 100);

                return (
                  <div
                    key={i + course.code}
                    className="border border-white/5 rounded-2xl bg-[#0d0d12] p-6 pr-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-lg group hover:border-white/10 transition-colors"
                  >
                    <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <div className="space-y-4 relative z-10 w-full md:w-auto mb-4 md:mb-0">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1.5">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium">
                          {course.faculty} •{" "}
                          {course.slot === "LAB" ? "Practical" : "Theory"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-[#0e1d17] border border-[#163024] text-[#22c55e] rounded-full text-sm font-bold shadow-sm">
                          {present}
                        </div>
                        <div className="px-4 py-1.5 bg-[#251010] border border-[#3a1616] text-[#ef4444] rounded-full text-sm font-bold shadow-sm">
                          {absent}
                        </div>
                        <div className="px-4 py-1.5 bg-[#18181c] border border-white/10 text-white rounded-full text-sm font-bold shadow-sm">
                          {conducted}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
                      <div className="text-3xl font-bold text-white tracking-tight">
                        {percent}%
                      </div>
                      <div className="text-gray-400 text-sm font-medium mt-1">
                        Margin:{" "}
                        <span className="text-[#3b82f6] font-semibold">
                          {course.margin}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {attendanceData && attendanceData.length === 0 && (
              <div className="text-center py-10 text-gray-500 border border-white/5 rounded-2xl bg-[#0d0d12]">
                No courses found
              </div>
            )}
          </div>

          {/* Skip Calculator Section */}
          <div
            className="mb-10 border border-white/5 rounded-2xl bg-[#0d0d12] p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg animate-fade-in-up delay-300"
            style={{ animationDelay: "300ms" }}
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                Skip Calculator
              </h3>
              <p className="text-gray-400 text-sm font-medium max-w-md">
                Calculate how many classes you can skip while maintaining 75%
                until semester end
              </p>
            </div>
            <button className="mt-5 md:mt-0 px-6 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors whitespace-nowrap shadow-md">
              Enable Calculator
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Nav Bottom overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 flex justify-around items-center bg-[#09090b]/80 backdrop-blur-md z-50 border-t border-white/5">
        {sidebarLinks
          .filter((l) =>
            [
              "Overview",
              "Attendance",
              "Timetable",
              "Marks & Grades",
              "Calendar",
            ].includes(l.name),
          )
          .map((link) => {
            const Icon = link.icon;
            const isActive = "Attendance" === link.name;
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
