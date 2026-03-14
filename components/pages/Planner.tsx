"use client";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie } from "@/utils/helpers";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Percent,
  Zap,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { useEffect, useState } from "react";

export default function Planner() {
  const { data: user } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const {
    data: codeData,
    loading: codeLoading,
    error: codeError,
  } = useFetchWithCache("/api/code", "cache_code", 1000 * 60 * 60);

  const [path, setPath] = useState("Academic_Planner_2025_26_EVEN");
  const { data, loading, error } = useFetchWithCache(
    `/api/planner?code=${path}`,
    `cache_pl_${path}`,
    1000 * 60 * 60,
  );

  const [month, setMonth] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"Calendar" | "List">("Calendar");

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

  useEffect(() => {
    if (data && Object.keys(data).length > 0 && !month) {
      const currentMonth = getCurrentMonth();
      if (data[currentMonth]) {
        setMonth(currentMonth);
      } else {
        setMonth(Object.keys(data)[0]);
      }
    }
  }, [data, month]);

  const handleNextMonth = () => {
    if (!data || !month) return;
    const keys = Object.keys(data);
    const idx = keys.indexOf(month);
    if (idx < keys.length - 1) setMonth(keys[idx + 1]);
  };

  const handlePrevMonth = () => {
    if (!data || !month) return;
    const keys = Object.keys(data);
    const idx = keys.indexOf(month);
    if (idx > 0) setMonth(keys[idx - 1]);
  };

  const handleToday = () => {
    if (!data) return;
    const currentMonth = getCurrentMonth();
    if (data[currentMonth]) setMonth(currentMonth);
  };

  // Calendar logic
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const dayIndexMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  let calendarGrid: any[] = [];
  let eventsInMonth: any[] = [];
  if (data && month && data[month]) {
    const monthData = data[month];
    const firstDayStr = monthData[0]?.day?.slice(0, 3);
    const startIndex = dayIndexMap[firstDayStr] || 0;

    // Pad beginning
    for (let i = 0; i < startIndex; i++) {
      calendarGrid.push(null);
    }
    // Add real days
    monthData.forEach((entry: any) => {
      calendarGrid.push(entry);
      if (entry.sp && entry.sp !== "-" && entry.sp !== "Regular") {
        eventsInMonth.push(entry);
      }
    });

    // Pad end to make full rows
    const remain = calendarGrid.length % 7;
    if (remain !== 0) {
      for (let i = 0; i < 7 - remain; i++) {
        calendarGrid.push(null);
      }
    }
  }

  const currentDateObj = new Date();
  const currentD = currentDateObj.getDate().toString();
  const currentM = getCurrentMonth();

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
              const isActive = "Calendar" === link.name;
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
          <TopBar user={user} />

        {/* Content */}
        <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
          {loading && !data ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin"></div>
            </div>
          ) : error || codeError ? (
            <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p>Failed to load planner data.</p>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] p-5 flex flex-col md:flex-row justify-between items-center shadow-lg animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <CalendarIcon className="text-white w-5 h-5" />
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Academic Calendar
                  </h2>
                </div>
                <div className="flex rounded-lg bg-[#14141a] p-1 border border-white/5">
                  <button
                    onClick={() => setViewMode("Calendar")}
                    className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "Calendar"
                        ? "bg-white text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode("List")}
                    className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "List"
                        ? "bg-white text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Main Calendar Card */}
              <div className="border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg animate-fade-in-up delay-100">
                {/* Month navigation */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handlePrevMonth}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-2xl font-bold w-40 text-center">
                      {month}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <button
                    onClick={handleToday}
                    className="px-4 py-1.5 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Today
                  </button>
                </div>

                {viewMode === "Calendar" && (
                  <div className="border-t border-white/5">
                    {/* Grid Header */}
                    <div className="grid grid-cols-7 border-b border-white/5 bg-[#09090b]/50 hidden md:grid">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day, idx) => (
                          <div
                            key={idx}
                            className="py-3 text-center text-xs font-semibold text-gray-500"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>
                    {/* Mobile Grid Header */}
                    <div className="grid grid-cols-7 border-b border-white/5 bg-[#09090b]/50 md:hidden">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div
                          key={idx}
                          className="py-3 text-center text-xs font-semibold text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grid Days */}
                    <div className="grid grid-cols-7">
                      {calendarGrid.map((cell, idx) => {
                        const isColStart = idx % 7 !== 0;
                        const isRowStart = idx >= 7;

                        const isToday =
                          cell && cell.date === currentD && month === currentM;

                        return (
                          <div
                            key={idx}
                            className={`min-h-[100px] md:min-h-[140px] p-2 md:p-3 relative ${
                              isColStart ? "border-l border-white/5 " : ""
                            } ${isRowStart ? "border-t border-white/5 " : ""} ${cell ? "hover:bg-white/[0.02]" : ""} transition-colors`}
                          >
                            {cell ? (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <span
                                    className={`font-bold flex items-center justify-center w-8 h-8 rounded-full ${isToday ? "bg-white text-black" : "text-white"}`}
                                  >
                                    {cell.date}
                                  </span>
                                  {cell.dayo && cell.dayo !== "-" && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                                      {cell.dayo}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  {cell.sp &&
                                    cell.sp !== "-" &&
                                    cell.sp !== "Regular" && (
                                      <p className="text-[10px] md:text-xs text-[#22c55e] leading-tight line-clamp-3">
                                        {cell.sp}
                                      </p>
                                    )}
                                </div>
                              </>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {viewMode === "List" && (
                  <div className="border-t border-white/5 p-6 flex flex-col gap-4">
                    <p className="text-gray-400 mb-2">
                      {month} • {data[month]?.length || 0} days •{" "}
                      {eventsInMonth.length} events
                    </p>
                    {data[month]?.map((cell: any, idx: number) => {
                      if (!cell) return null;
                      const isToday =
                        cell.date === currentD && month === currentM;

                      const isHolidayOrEvent =
                        cell.sp && cell.sp !== "-" && cell.sp !== "Regular";

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border border-white/5 flex gap-6 items-center ${isToday ? "bg-white/5" : "bg-[#14141a]"}`}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[3rem]">
                            <span className="text-xl font-bold text-white">
                              {cell.date}
                            </span>
                            <span className="text-[10px] uppercase text-gray-500 font-bold">
                              {cell.day?.slice(0, 3)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`text-sm md:text-base font-medium ${isHolidayOrEvent ? "text-white" : "text-gray-400"}`}
                            >
                              {isHolidayOrEvent ? cell.sp : "Regular day"}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            {cell.dayo && cell.dayo !== "-" && (
                              <span className="bg-white/10 text-xs px-2 py-1 rounded-md text-gray-300">
                                {cell.dayo}
                              </span>
                            )}
                            {isHolidayOrEvent && (
                              <span className="border border-[#22c55e]/30 text-[#22c55e] text-xs px-3 py-1 rounded-full bg-[#22c55e]/10">
                                Event
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Events in month section (visible only in calendar view) */}
              {viewMode === "Calendar" && eventsInMonth.length > 0 && (
                <div className="mt-8 mb-10 pb-10">
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-6 pl-2">
                    EVENTS IN {month?.split(" ")[0]?.toUpperCase()}
                  </h3>
                  <div className="flex flex-col gap-5">
                    {eventsInMonth.map((event, idx) => (
                      <div key={idx} className="flex gap-6 items-start pl-2">
                        <div className="flex flex-col items-center justify-start min-w-[3rem]">
                          <span className="text-xl font-bold text-white leading-none">
                            {event.date}
                          </span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold mt-1">
                            {event.day?.slice(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-5">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-bold mb-1">
                              {event.sp}
                            </h4>
                            <span className="border border-[#22c55e]/30 text-[#22c55e] text-xs px-3 py-1 rounded-full bg-[#22c55e]/10 whitespace-nowrap ml-4">
                              {event.sp?.toLowerCase().includes("holiday")
                                ? "Holiday"
                                : "Event"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Nav Header overlay */}
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
            const isActive = "Calendar" === link.name;
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

function getCurrentMonth() {
  const now = new Date();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear().toString().substr(-2);
  return `${month} '${year}`;
}

