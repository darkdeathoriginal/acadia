"use client";
import UserLoader from "@/components/Loaders/userLoader";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie } from "@/utils/helpers";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Download,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Percent,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import TopBar from "../TopBar";

export default function User() {
  const { data, loading, error } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const { data: attendanceData, loading: attLoading } = useFetchWithCache(
    "/api/attendance",
    "cache_at",
    1000 * 60 * 60,
  );
  const { data: marksData, loading: marksLoading } = useFetchWithCache(
    "/api/mark",
    "cache_mk",
    1000 * 60 * 60,
  );
  const { data: dayorderData, loading: doLoading } = useFetchWithCache(
    "/api/dayorder",
    "cache_do",
    1000 * 60 * 60,
  );
  const { data: timetableData, loading: ttLoading } = useFetchWithCache(
    "/api/timetable",
    "cache_tt",
    1000 * 60 * 60,
  );

  const [activeTab, setActiveTab] = useState("Overview");

  const sidebarLinks = [
    { name: "Overview", icon: Home, href: "/user" },
    { name: "Attendance", icon: CalendarCheck, href: "/attendance" },
    { name: "Marks & Grades", icon: GraduationCap, href: "/mark" },
    { name: "Timetable", icon: BarChart3, href: "/timetable" },
    { name: "Courses", icon: Activity, href: "#" },
    { name: "Calendar", icon: CalendarDays, href: "/planner" },
    { name: "GPA Calculator", icon: Percent, href: "/cgpacalculator" },
    { name: "Course Feedback", icon: MessageSquare, href: "/feedback" },
    { name: "Report Issue", icon: MessageSquare, href: "#" },
  ];

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const averageAttendance = useMemo(() => {
    if (
      !attendanceData ||
      !Array.isArray(attendanceData) ||
      attendanceData.length === 0
    )
      return "--";
    let totalPercent = 0;
    attendanceData.forEach((course: any) => {
      const conducted = Number(course.conducted) || 0;
      const absent = Number(course.absent) || 0;
      const present = conducted - absent;
      const percent =
        conducted === 0 ? 100 : Math.round((present / conducted) * 100);
      totalPercent += percent;
    });
    return Math.round(totalPercent / attendanceData.length) + "%";
  }, [attendanceData]);

  const totalCourses = useMemo(() => {
    if (!attendanceData || !Array.isArray(attendanceData)) return "--";
    return attendanceData.length;
  }, [attendanceData]);

  const globalPercentage = useMemo(() => {
    if (!marksData || !Array.isArray(marksData) || marksData.length === 0)
      return "--";
    let overallTotal = 0;
    let maxPossibleTotal = 0;
    let subjectsWithMarks = 0;

    marksData.forEach((subject: any) => {
      let localTotal = 0;
      let localMax = 0;
      let hasMarks = false;

      if (subject.marks && Array.isArray(subject.marks)) {
        subject.marks.forEach((m: any) => {
          if (
            m.mark !== undefined &&
            m.mark !== "N/A" &&
            m.mark !== "Ab" &&
            m.mark !== "-"
          ) {
            localTotal += Number(m.mark);
            if (m.total) {
              localMax += Number(m.total);
            }
            hasMarks = true;
          }
        });
      }

      let subjectTotal = Number(subject.total) || localTotal;
      let subjectMax = localMax > 0 ? localMax : 100;

      if (hasMarks || subject.total) {
        subjectsWithMarks++;
        overallTotal += subjectTotal;
        maxPossibleTotal += subjectMax;
      }
    });

    return maxPossibleTotal > 0
      ? Math.round((overallTotal / maxPossibleTotal) * 100) + "%"
      : "--";
  }, [marksData]);

  const dayOrderString = useMemo(() => {
    if (
      dayorderData?.error ||
      !dayorderData?.do ||
      dayorderData?.do === "Holiday" ||
      dayorderData?.do === "N"
    )
      return "Holiday";
    return dayorderData.do;
  }, [dayorderData]);

  const currentSchedule = useMemo(() => {
    if (
      !timetableData ||
      !timetableData.data ||
      !dayorderData ||
      !dayorderData.do ||
      dayorderData.do === "Holiday" ||
      dayorderData.do === "N"
    )
      return [];
    // Timetable data is keyed by day order index (0-4)
    const doKey = dayorderData.do as string;
    const dayIndex = parseInt(doKey) - 1;
    if (
      isNaN(dayIndex) ||
      dayIndex < 0 ||
      dayIndex > 4 ||
      !timetableData.data[dayIndex]
    )
      return [];
    const daySchedule = timetableData.data[dayIndex];
    // Convert the day schedule object to an array of items
    const items = Object.entries(daySchedule).map(
      ([time, course]: [string, any]) => ({
        time,
        courseName: course.title,
        courseCode: course.code,
        facultyName: course.faculty || "",
        roomNo: course.room || "",
        slot: course.type || "",
      }),
    );
    items.sort((a, b) => a.time.localeCompare(b.time));
    return items;
  }, [timetableData, dayorderData]);

  if (
    (!data && loading) ||
    (!attendanceData && attLoading) ||
    (!marksData && marksLoading) ||
    (!dayorderData && doLoading)
  ) {
    return <UserLoader />;
  }

  return (
    <div className="flex h-screen bg-[#060608] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a24] bg-[#0A0A0A] flex flex-col justify-between hidden md:flex h-full flex-shrink-0">
        <div className="overflow-y-auto">
          <div className="p-6">
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
              {data?.name ? data.name.charAt(0).toUpperCase() : "N"}
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
        <TopBar user={data} />

        {/* User Content */}
        <div className="px-6 md:px-10 pb-20 pt-6 max-w-6xl w-full">
          {/* Welcome Header */}
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl md:text-[34px] font-bold mb-2 tracking-tight text-white">
              Welcome back, {data?.name ? data.name.split(" ")[0] : "Student"}!
            </h1>
            <p className="text-gray-400 text-sm">
              Here&apos;s your academic overview for today - {todayDate}
            </p>
          </div>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 animate-fade-in-up delay-100"
            style={{ animationDelay: "100ms" }}
          >
            {/* Attendance Card */}
            <div className="p-5 rounded-2xl bg-[#0d0d12] border border-[#112a20] relative overflow-hidden group hover:border-[#1a4031] transition-colors">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="w-10 h-10 rounded-lg bg-[#092218] flex items-center justify-center border border-[#112a20]">
                  <TrendingUp className="text-[#22c55e] w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-[#22c55e]">
                  {averageAttendance}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium z-10 relative">
                Attendance
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            </div>

            {/* Overall Marks Card */}
            <div className="p-5 rounded-2xl bg-[#0d0d12] border border-[#10203a] relative overflow-hidden group hover:border-[#183057] transition-colors">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="w-10 h-10 rounded-lg bg-[#0a1835] flex items-center justify-center border border-[#10203a]">
                  <GraduationCap className="text-[#3b82f6] w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-[#3b82f6]">
                  {globalPercentage}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium z-10 relative">
                Overall Marks
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            </div>

            {/* Total Subjects Card */}
            <div className="p-5 rounded-2xl bg-[#0d0d12] border border-[#281535] relative overflow-hidden group hover:border-[#3c2050] transition-colors">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="w-10 h-10 rounded-lg bg-[#1d0d2b] flex items-center justify-center border border-[#281535]">
                  <BookOpen className="text-[#a855f7] w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-[#a855f7]">
                  {totalCourses}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium z-10 relative">
                Total Subjects
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            </div>

            {/* Day Order Card */}
            <div className="p-5 rounded-2xl bg-[#0d0d12] border border-[#352010] relative overflow-hidden group hover:border-[#503018] transition-colors">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="w-10 h-10 rounded-lg bg-[#2b1509] flex items-center justify-center border border-[#352010]">
                  <CalendarIcon className="text-[#f97316] w-5 h-5" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#f97316]">
                  {dayOrderString}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium z-10 relative">
                Day Order
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            </div>
          </div>

          {/* Today's Schedule Section */}
          <div
            className="animate-fade-in-up delay-200"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="text-gray-400 w-5 h-5" />
                <h2 className="text-lg font-bold text-white">
                  Today&apos;s Schedule
                </h2>
                <button className="ml-2 text-gray-500 hover:text-white transition-colors">
                  <Download className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
              <div
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${dayOrderString === "Holiday" ? "border-[#22c55e]/30 text-[#22c55e]" : "border-blue-500/30 text-blue-500"}`}
              >
                {dayOrderString}
              </div>
            </div>

            {dayOrderString === "Holiday" ? (
              <>
                <p className="text-gray-400 text-sm mb-20 pb-4 border-b border-white/5">
                  No classes scheduled for today - enjoy your break!
                </p>

                {/* Holiday Illustration */}
                <div className="flex flex-col items-center justify-center py-12 mt-4">
                  <div className="w-20 h-20 rounded-full bg-[#0a1b14] border border-[#112a20] flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-[#22c55e]/10 blur-xl rounded-full"></div>
                    <CalendarIcon className="text-[#22c55e] w-8 h-8 relative z-10" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white">
                    Holiday Today!
                  </h3>
                  <p className="text-gray-400 text-center max-w-sm text-sm leading-relaxed">
                    Take this time to relax, recharge, and prepare for upcoming
                    classes. Enjoy your day off!
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mb-20">
                {currentSchedule.length > 0 ? (
                  currentSchedule.map((course: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-white">
                            {course.courseName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/20">
                            {course.courseCode}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                          <span>{course.facultyName}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span>{course.roomNo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-white/10 text-sm font-medium text-gray-300">
                          {course.slot}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-white/10 text-sm font-medium text-gray-300">
                          {course.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-8 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                    No schedule available for today.
                  </p>
                )}
              </div>
            )}
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
            const isActive = "Overview" === link.name;
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
