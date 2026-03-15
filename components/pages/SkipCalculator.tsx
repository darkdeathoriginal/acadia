"use client";
import DashboardLayout from "@/components/DashboardLayout";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { AlertCircle, Zap } from "lucide-react";
import { useMemo } from "react";

export default function SkipCalculator() {
  const { data: user } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const { data: attendanceData, loading: attLoading } = useFetchWithCache(
    "/api/attendance",
    "cache_at",
    1000 * 60 * 60,
  );

  const { data: timetableData, loading: ttLoading } = useFetchWithCache(
    "/api/timetable",
    "cache_tt",
    1000 * 60 * 60,
  );

  const { data: plannerData, loading: plLoading } = useFetchWithCache(
    "/api/planner?code=Academic_Planner_2025_26_EVEN",
    "cache_pl_Academic_Planner_2025_26_EVEN",
    1000 * 60 * 60,
  );

  // Calculate remaining day orders from planner (future working days)
  const remainingDayOrders = useMemo(() => {
    if (!plannerData || plannerData.error) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOrderCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };
    let lastDate = today;

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

    for (const monthKey of Object.keys(plannerData)) {
      if (plannerData[monthKey]?.error) continue;
      const monthData = plannerData[monthKey];
      if (!Array.isArray(monthData)) continue;

      // Parse month key like "Mar '26"
      const parts = monthKey.split(" '");
      if (parts.length < 2) continue;
      const monthIdx = monthNames.indexOf(parts[0]);
      const year = 2000 + parseInt(parts[1]);
      if (monthIdx === -1 || isNaN(year)) continue;

      for (const day of monthData) {
        const dateNum = parseInt(day.date);
        if (isNaN(dateNum)) continue;

        const date = new Date(year, monthIdx, dateNum);
        if (date <= today) continue;

        // Track last date in planner
        if (date > lastDate) lastDate = date;

        // Only count days with a numeric day order (1-5)
        const dayOrder = parseInt(day.dayo);
        if (!isNaN(dayOrder) && dayOrder >= 1 && dayOrder <= 5) {
          dayOrderCounts[dayOrder - 1] =
            (dayOrderCounts[dayOrder - 1] || 0) + 1;
        }
      }
    }

    return { counts: dayOrderCounts, lastDate };
  }, [plannerData]);

  // Count how many slots each course has per day order from timetable
  const courseSlotsPerDayOrder = useMemo(() => {
    if (!timetableData?.data) return null;

    // timetableData.data is { 0: { time: { code, title, ... } }, 1: ..., 4: ... }
    const slotsMap: Record<string, Record<number, number>> = {};

    for (let dayOrder = 0; dayOrder < 5; dayOrder++) {
      const daySchedule = timetableData.data[dayOrder];
      if (!daySchedule) continue;

      for (const [time, course] of Object.entries(daySchedule) as [
        string,
        any,
      ][]) {
        const code = course.code;
        if (!code) continue;
        if (!slotsMap[code]) {
          slotsMap[code] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        }
        slotsMap[code][dayOrder]++;
      }
    }
    return slotsMap;
  }, [timetableData]);

  // Calculate skip data for each course
  const skipData = useMemo(() => {
    if (!attendanceData || !Array.isArray(attendanceData)) return null;
    if (!remainingDayOrders || !courseSlotsPerDayOrder) return null;

    return attendanceData.map((course: any) => {
      const code = course.code;
      const conducted = Number(course.conducted) || 0;
      const absent = Number(course.absent) || 0;
      const attended = conducted - absent;
      const currentPercent =
        conducted === 0 ? 100 : Math.round((attended / conducted) * 100);

      // Calculate remaining classes for this course
      let remaining = 0;
      const slots = courseSlotsPerDayOrder[code];
      if (slots) {
        for (let do_ = 0; do_ < 5; do_++) {
          remaining +=
            (slots[do_] || 0) * (remainingDayOrders.counts[do_] || 0);
        }
      }

      // Calculate max skippable classes while staying ≥ 75%
      // Need: (attended + attendedFromRemaining) / (conducted + remaining) >= 0.75
      // attendedFromRemaining = remaining - skippable
      // attended + remaining - skippable >= 0.75 * (conducted + remaining)
      // skippable <= attended + remaining - 0.75 * (conducted + remaining)
      const totalFuture = conducted + remaining;
      const minNeeded = Math.ceil(0.75 * totalFuture);
      const skippable = Math.max(0, attended + remaining - minNeeded);

      let status: "safe" | "caution" | "risk";
      if (skippable >= 8) status = "safe";
      else if (skippable >= 4) status = "caution";
      else status = "risk";

      return {
        code,
        title: course.title,
        category: course.category,
        slot: course.slot,
        conducted,
        absent,
        attended,
        currentPercent,
        remaining,
        skippable,
        status,
      };
    });
  }, [attendanceData, remainingDayOrders, courseSlotsPerDayOrder]);

  const loading =
    (attLoading && !attendanceData) ||
    (ttLoading && !timetableData) ||
    (plLoading && !plannerData);

  const summary = useMemo(() => {
    if (!skipData) return { safe: 0, caution: 0, risk: 0 };
    return {
      safe: skipData.filter((c) => c.status === "safe").length,
      caution: skipData.filter((c) => c.status === "caution").length,
      risk: skipData.filter((c) => c.status === "risk").length,
    };
  }, [skipData]);

  const analyzingTill = useMemo(() => {
    if (!remainingDayOrders?.lastDate) return "";
    return remainingDayOrders.lastDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [remainingDayOrders]);

  const statusColors = {
    safe: {
      text: "text-[#22c55e]",
      bg: "bg-[#0e1d17]",
      border: "border-[#163024]",
      glow: "from-[#22c55e]/5",
    },
    caution: {
      text: "text-[#eab308]",
      bg: "bg-[#1d1a0e]",
      border: "border-[#302816]",
      glow: "from-[#eab308]/5",
    },
    risk: {
      text: "text-[#ef4444]",
      bg: "bg-[#1d0e0e]",
      border: "border-[#301616]",
      glow: "from-[#ef4444]/5",
    },
  };

  return (
    <DashboardLayout user={user} activeTab="Skip Pro">
      <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin"></div>
          </div>
        ) : !skipData ? (
          <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p>Failed to load data. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg animate-fade-in-up">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="text-gray-300 w-5 h-5" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Skip Pro Calculator
                  </h2>
                </div>
                {analyzingTill && (
                  <span className="text-gray-500 text-sm">
                    Analyzing till {analyzingTill}
                  </span>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-5 p-5">
                <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                  <h3 className="text-4xl font-bold text-[#22c55e] mb-1">
                    {summary.safe}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">Safe</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                  <h3 className="text-4xl font-bold text-[#eab308] mb-1">
                    {summary.caution}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">Caution</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#14141a] p-6 text-center shadow-md">
                  <h3 className="text-4xl font-bold text-[#ef4444] mb-1">
                    {summary.risk}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">At Risk</p>
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div
              className="flex flex-col gap-4 mb-6 animate-fade-in-up delay-100"
              style={{ animationDelay: "100ms" }}
            >
              {skipData.map((course, i) => {
                const colors = statusColors[course.status];
                return (
                  <div
                    key={course.code + i}
                    className={`border border-white/5 rounded-2xl bg-[#0d0d12] p-6 relative overflow-hidden shadow-lg group hover:border-white/10 transition-colors`}
                  >
                    <div
                      className={`absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l ${colors.glow} to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`}
                    ></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                      {/* Course Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg md:text-xl font-bold text-white">
                            {course.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-gray-400 text-xs font-medium border border-white/5 uppercase">
                            {course.slot === "LAB" ? "LAB" : "Theory"}
                          </span>
                        </div>
                        <div className={`text-lg font-bold ${colors.text}`}>
                          {course.skippable > 0
                            ? `Can skip ${course.skippable}`
                            : course.currentPercent < 75
                              ? "Attendance below 75%"
                              : "No safe skips"}
                        </div>
                        <p className="text-gray-500 text-sm">
                          {course.remaining} classes remaining •{" "}
                          {course.currentPercent}% current
                        </p>
                      </div>

                      {/* Skip Count Badge */}
                      <div className="flex flex-col items-center md:items-end gap-1">
                        <div
                          className={`text-4xl font-bold tabular-nums ${colors.text}`}
                        >
                          {course.skippable}
                        </div>
                        <div className="text-gray-500 text-xs font-medium">
                          skippable
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              className="border border-white/5 rounded-2xl bg-[#0d0d12] p-5 flex flex-wrap justify-center gap-6 md:gap-10 shadow-lg animate-fade-in-up delay-200"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                <span className="text-gray-400 text-sm">Safe (8+ skips)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                <span className="text-gray-400 text-sm">
                  Caution (4–7 skips)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                <span className="text-gray-400 text-sm">
                  At Risk (&lt;4 skips)
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
