"use client";

import DashboardLayout from "@/components/DashboardLayout";
import UserLoader from "@/components/Loaders/userLoader";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Download,
  GraduationCap,
  MapPin,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const parseTimeRange = (timeStr: string) => {
  if (!timeStr) return null;
  const parts = timeStr.split("-").map((s) => s.trim());
  if (parts.length !== 2) return null;

  const parseTime = (str: string) => {
    const match = str.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (str.toLowerCase().includes("pm") && hours < 12) hours += 12;
    if (str.toLowerCase().includes("am") && hours === 12) hours = 0;

    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);

  if (!start || !end) return null;
  return { start, end };
};

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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const { currentClass, nextClass, remainingClasses } = useMemo(() => {
    if (!currentSchedule || currentSchedule.length === 0)
      return { currentClass: null, nextClass: null, remainingClasses: [] };

    let current = null;
    let next = null;
    let nextIdx = -1;

    for (let i = 0; i < currentSchedule.length; i++) {
      const cls = currentSchedule[i];
      const timeRange = parseTimeRange(cls.time);
      if (timeRange) {
        if (currentTime >= timeRange.start && currentTime <= timeRange.end) {
          current = cls;
        } else if (currentTime < timeRange.start && !next) {
          next = cls;
          nextIdx = i;
        }
      }
    }

    // If we couldn't find a next class based on time, but no current class either,
    // maybe all classes are in the future or past.
    // Let's refine the next logic:
    if (!next) {
      for (let i = 0; i < currentSchedule.length; i++) {
        const timeRange = parseTimeRange(currentSchedule[i].time);
        if (timeRange && currentTime < timeRange.start) {
          next = currentSchedule[i];
          nextIdx = i;
          break;
        }
      }
    }

    return {
      currentClass: current,
      nextClass: next,
      remainingClasses: currentSchedule,
    };
  }, [currentSchedule, currentTime]);

  const getStartsIn = (timeStr: string) => {
    const timeRange = parseTimeRange(timeStr);
    if (!timeRange) return "";
    const diffMs = timeRange.start.getTime() - currentTime.getTime();
    if (diffMs <= 0) return "Starting soon";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Starts in ${hours} hrs ${minutes} mins`;
    return `Starts in ${minutes} mins`;
  };

  if (
    (!data && loading) ||
    (!attendanceData && attLoading) ||
    (!marksData && marksLoading) ||
    (!dayorderData && doLoading)
  ) {
    return <UserLoader />;
  }

  return (
    <DashboardLayout user={data} activeTab="Overview">
      {/* User Content */}
      <div className="px-6 md:px-10 pb-20 pt-6 max-w-6xl w-full">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-[34px] font-bold mb-2 tracking-tight text-white">
            Welcome back, {data?.name ? data.name.split(" ")[0] : "Student"}!
          </h1>
          <p className="text-gray-400 text-sm">
            Here&apos;s your academic overview for today - {todayDate}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
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

        {/* Schedule Section */}
        <div style={{ animationDelay: "200ms" }}>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
              {/* Highlight Cards (Current & Next) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {currentClass ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#092218] to-[#04120c] border border-[#112a20] relative overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                      <span className="text-xs font-bold text-[#22c55e] tracking-wider uppercase">
                        Current Class
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                      {currentClass.courseName}
                    </h3>
                    <div className="text-[#22c55e] font-medium text-sm mb-5">
                      {currentClass.time}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{currentClass.roomNo}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate">
                          {currentClass.facultyName}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                      <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                        Current Status
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">
                      No active class right now
                    </h3>
                  </div>
                )}

                {nextClass ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a1835] to-[#050c1f] border border-[#10203a] relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                        <span className="text-xs font-bold text-[#3b82f6] tracking-wider uppercase">
                          Next Up
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-[#3b82f6]/10 text-[#3b82f6]">
                        {getStartsIn(nextClass.time)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                      {nextClass.courseName}
                    </h3>
                    <div className="text-[#3b82f6] font-medium text-sm mb-5">
                      {nextClass.time}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{nextClass.roomNo}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate">
                          {nextClass.facultyName}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                        Next Up
                      </span>
                    </div>
                    <h3 className="text-gray-400 text-sm">
                      No more classes scheduled today.
                    </h3>
                  </div>
                )}
              </div>

              {/* Full Day Schedule List */}
              <div className="lg:col-span-2">
                <div className="p-5 rounded-2xl bg-[#0d0d12] border border-white/5 h-full">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                    Full Schedule
                  </h3>
                  <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {remainingClasses.length > 0 ? (
                      remainingClasses.map((course: any, idx: number) => {
                        const isCurrent = currentClass === course;
                        const isNext = nextClass === course;

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                              isCurrent
                                ? "bg-[#092218] border-[#112a20] shadow-[0_0_10px_rgba(34,197,94,0.05)]"
                                : isNext
                                  ? "bg-[#0a1835] border-[#10203a]"
                                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex gap-4 items-center">
                              <div
                                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                                  isCurrent
                                    ? "bg-[#0c3022] text-[#22c55e]"
                                    : isNext
                                      ? "bg-[#0d224d] text-[#3b82f6]"
                                      : "bg-white/5 text-gray-400"
                                }`}
                              >
                                <span className="text-xs font-semibold">
                                  {course.time.split("-")[0]}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span
                                    className={`font-bold ${isCurrent ? "text-white" : isNext ? "text-white" : "text-gray-200"}`}
                                  >
                                    {course.courseName}
                                  </span>
                                </div>
                                <div className="text-gray-400 text-xs flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                    {course.courseCode}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                  <span>{course.roomNo}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                                  isCurrent
                                    ? "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]"
                                    : isNext
                                      ? "bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]"
                                      : "bg-[#0d0d12] border-white/10 text-gray-400"
                                }`}
                              >
                                {course.slot}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm py-8 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                        No schedule available for today.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
