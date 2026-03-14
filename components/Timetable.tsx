"use client";

import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie, fetchWithCache } from "@/utils/helpers";
import cookie from "js-cookie";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Percent,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_TIME_SLOTS = [
  "08:00 - 08:50",
  "08:50 - 09:40",
  "09:45 - 10:35",
  "10:40 - 11:30",
  "11:35 - 12:25",
  "12:30 - 01:20",
  "01:25 - 02:15",
  "02:20 - 03:10",
  "03:10 - 04:00",
  "04:00 - 04:50",
  "04:50 - 05:30",
  "05:30 - 06:10",
];

const DAY_NAME_TO_NUMBER = {
  monday: "1",
  tuesday: "2",
  wednesday: "3",
  thursday: "4",
  friday: "5",
};

function normalizeDayKey(dayKey: string) {
  const raw = String(dayKey).trim();
  const asNumber = Number(raw);

  if (!Number.isNaN(asNumber)) {
    if (asNumber >= 0 && asNumber <= 4) return String(asNumber + 1);
    if (asNumber >= 1 && asNumber <= 5) return String(asNumber);
  }

  const fromName =
    DAY_NAME_TO_NUMBER[raw.toLowerCase() as keyof typeof DAY_NAME_TO_NUMBER];
  return fromName || raw;
}

function normalizeTimeKey(timeKey: string) {
  return String(timeKey)
    .replaceAll("–", "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSortableTimeValue(timeRange: string) {
  const [start] = String(timeRange).split(" - ");
  if (!start) return Number.MAX_SAFE_INTEGER;
  const [hourRaw, minuteRaw] = start.split(":");
  let hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute))
    return Number.MAX_SAFE_INTEGER;

  // Assuming hours 1 to 7 are PM (13:00 to 19:00) for sorting
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }

  return hour * 60 + minute;
}

function isSlotEmpty(slot: any) {
  const title = String(slot?.title || "")
    .trim()
    .toLowerCase();
  return (
    !title ||
    title === "na" ||
    title === "n/a" ||
    title === "no class" ||
    title === "-"
  );
}

function formatTimeTo12Hour(value: string) {
  const [hourPart, minutePart] = value.split(":");
  let hour = Number(hourPart);
  const minute = Number(minutePart);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  let period = "AM";
  if (hour >= 12) {
    period = "PM";
  } else if (hour >= 1 && hour <= 7) {
    period = "PM";
  }

  if (hour === 0) {
    hour = 12;
  }

  const normalizedHour = hour > 12 ? hour - 12 : hour;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatRangeForUi(timeRange: string) {
  const [start, end] = String(timeRange).split(" - ");
  if (!start || !end) return timeRange;
  return `${formatTimeTo12Hour(start)} - ${formatTimeTo12Hour(end)}`;
}

function normalizeAndMergeTimetable(rawData: any) {
  if (!rawData || typeof rawData !== "object") return {};

  const normalized: Record<string, Record<string, any>> = {};

  Object.entries(rawData).forEach(([dayKey, dayValue]) => {
    if (!dayValue || typeof dayValue !== "object") return;

    const normalizedDayKey = normalizeDayKey(dayKey);
    if (!normalized[normalizedDayKey]) normalized[normalizedDayKey] = {};

    Object.entries(dayValue as Record<string, any>).forEach(
      ([timeKey, slot]) => {
        if (!slot || typeof slot !== "object") return;

        // Skip invalid time keys like registration numbers leaking from corrupted API cache
        if (
          !timeKey ||
          (!String(timeKey).includes(":") &&
            !String(timeKey).includes("-") &&
            timeKey.length > 10)
        )
          return;

        const cleanTime = normalizeTimeKey(timeKey);
        if (!cleanTime) return;

        normalized[normalizedDayKey][cleanTime] = {
          ...slot,
          title: slot.title || slot.name || "No Class",
          type: slot.type || slot.slot || "Theory",
          room: slot.room || "",
          code: slot.code || "",
          faculty: slot.faculty || slot.teacher || "",
        };
      },
    );
  });

  const merged: Record<string, Record<string, any>> = {};

  Object.entries(normalized).forEach(([dayKey, dayData]) => {
    const withDefaults: Record<string, any> = {};

    DEFAULT_TIME_SLOTS.forEach((slot) => {
      const normalizedSlot = normalizeTimeKey(slot);
      withDefaults[normalizedSlot] = dayData[normalizedSlot] || {
        title: "No Class",
        type: "",
        room: "",
        code: "",
        faculty: "",
      };
    });

    Object.entries(dayData).forEach(([slot, value]) => {
      if (!withDefaults[slot]) withDefaults[slot] = value;
    });

    const orderedSlots = Object.entries(withDefaults).sort(
      (a, b) => toSortableTimeValue(a[0]) - toSortableTimeValue(b[0]),
    );

    const formattedDay: Record<string, any> = {};
    let previousRange: string | null = null;

    orderedSlots.forEach(([currentRange, currentSlot]) => {
      if (!previousRange) {
        formattedDay[currentRange] = currentSlot;
        previousRange = currentRange;
        return;
      }

      const [currentStart, currentEnd] = currentRange.split(" - ");
      const [previousStart, previousEnd] = previousRange.split(" - ");

      const previousSlot = formattedDay[previousRange];
      const previousCode = String(previousSlot?.code || "").trim();
      const currentCode = String(currentSlot?.code || "").trim();

      const shouldMerge =
        currentStart === previousEnd &&
        previousCode &&
        currentCode &&
        previousCode === currentCode &&
        !isSlotEmpty(previousSlot) &&
        !isSlotEmpty(currentSlot);

      if (shouldMerge) {
        delete formattedDay[previousRange];
        const mergedRange = `${previousStart} - ${currentEnd}`;
        formattedDay[mergedRange] = currentSlot;
        previousRange = mergedRange;
      } else {
        formattedDay[currentRange] = currentSlot;
        previousRange = currentRange;
      }
    });

    merged[dayKey] = formattedDay;
  });

  return merged;
}

export default function Timetable({ tm = false, section }) {
  const { data: user } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );
  const [activeTab, setActiveTab] = useState("Timetable");

  const [dayOrder, setDayOrder] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("Updating day order..");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(tm || null);
  const [selectedDay, setSelectedDay] = useState("1");

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

  const fetchDayOrder = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      await fetchWithCache(
        `/api/dayorder?date=${today}`,
        { cache: "no-store", next: { revalidate: 1 } },
        `cache_do_${today}`,
        {
          setState: (response) => {
            const value = response?.do;
            setLoadingText("");

            if (!value || value === "N") {
              setDayOrder(null);
              return;
            }

            const normalizedDayOrder = normalizeDayKey(String(value));
            setDayOrder(normalizedDayOrder);
            setSelectedDay(normalizedDayOrder);
          },
        },
      );
    } catch (error) {
      console.error("Error fetching day order:", error);
      setLoadingText("Error loading day order");
    }
  }, []);

  const initializeCookies = useCallback(() => {
    try {
      const userDataString = localStorage.getItem("cache_user");
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      if (!cookie.get("regno")) cookie.set("regno", userData.roll);
      if (!cookie.get("section")) cookie.set("section", userData.section);
    } catch (error) {
      console.error("Error initializing cookies:", error);
    }
  }, []);

  const fetchTimetableData = useCallback(async () => {
    try {
      setIsLoading(true);

      const cachedData = localStorage.getItem("cache_tm");
      if (cachedData && cachedData !== "undefined") {
        setData(JSON.parse(cachedData));
      }

      await fetchWithCache(
        "/api/timetable",
        { cache: "no-store", next: { revalidate: 1 } },
        "cache_tm",
        {
          setState: (response) => {
            setData(response?.data || null);
          },
        },
      );
    } catch (error: any) {
      if (error?.error === "Invalid cookie") delCookie();
      console.error("Error fetching timetable:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tm) {
      setData(tm);
      return;
    }

    initializeCookies();
    fetchDayOrder();
    fetchTimetableData();

    const today = new Date().toDateString();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cache_do_") && !key.includes(today)) {
        localStorage.removeItem(key);
      }
    });
  }, [tm, initializeCookies, fetchDayOrder, fetchTimetableData]);

  const formattedData = useMemo(() => normalizeAndMergeTimetable(data), [data]);

  const dayKeys = useMemo(() => {
    const keys = Object.keys(formattedData || {});
    return keys.sort((a, b) => Number(a) - Number(b));
  }, [formattedData]);

  useEffect(() => {
    if (!dayKeys.length) return;

    if (dayOrder && dayKeys.includes(dayOrder)) {
      setSelectedDay(dayOrder);
      return;
    }

    if (!dayKeys.includes(selectedDay)) {
      setSelectedDay(dayKeys[0]);
    }
  }, [dayKeys, dayOrder, selectedDay]);

  const currentSlots = useMemo(() => {
    if (!formattedData || !selectedDay || !formattedData[selectedDay])
      return [];
    return Object.keys(formattedData[selectedDay]);
  }, [formattedData, selectedDay]);

  return (
    <div className="flex h-screen bg-[#060608] text-white font-sans overflow-hidden">
      <aside className="w-64 border-r border-[#1a1a24] bg-[#0A0A0A] hidden md:flex md:flex-col justify-between h-full flex-shrink-0">
        <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="p-6 pb-2">
            <div className="text-2xl font-bold tracking-tight">PortalX</div>
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

        <div className="p-6 pb-8 border-t border-[#1a1a24] bg-[#0A0A0A]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-yellow-600 flex justify-center items-center font-bold text-lg text-white shadow-lg shadow-green-900/20 relative cursor-pointer ring-2 ring-[#0A0A0A]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "N"}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
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

      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full relative bg-[#09090b]">
        <header className="justify-end items-center px-8 py-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-20 hidden md:flex">
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Moon size={20} />
            </button>
            <div className="w-8 h-8 rounded-md bg-[#252525] flex justify-center items-center font-bold text-sm cursor-pointer border border-white/10 text-gray-200 ml-2">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-4xl w-full mx-auto md:mx-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Day Order {selectedDay}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {dayKeys.map((dayKey) => {
                const isActive = dayKey === selectedDay;
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDay(dayKey)}
                    className={`nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Day {dayKey}
                  </button>
                );
              })}

              {data && (
                <div className="ml-2 h-7 px-3 rounded-md bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center text-xs font-semibold">
                  <DownloadTimetable timetable={data} section={section} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading && !currentSlots.length && (
              <div className="flex justify-center items-center h-28">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
              </div>
            )}

            {!isLoading && currentSlots.length === 0 && (
              <div className="text-center py-10 text-gray-500 border border-white/5 rounded-2xl bg-[#0d0d12]">
                No timetable data available
              </div>
            )}

            {currentSlots.map((timeSlot) => {
              const classData = formattedData[selectedDay][timeSlot];
              const title = classData?.title || "No Class";
              const code = classData?.code || "";
              const room = classData?.room || "";
              const type = classData?.type || "";
              const emptySlot = isSlotEmpty(classData);
              const faculty =
                classData?.faculty ||
                (typeof classData?.name === "string" &&
                  classData.name.includes("("))
                  ? classData.name
                  : "";

              if (emptySlot) {
                return (
                  <div
                    key={`${selectedDay}-${timeSlot}`}
                    className="flex justify-between items-center p-4 rounded-xl bg-[#121214] border border-white/5 shadow-sm"
                  >
                    <span className="text-gray-400 text-sm font-medium">
                      {formatRangeForUi(timeSlot)}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                      No Class
                    </span>
                  </div>
                );
              }

              const isLab =
                String(type).toLowerCase().includes("lab") ||
                String(type).toLowerCase().includes("practical") ||
                String(type).toLowerCase().includes("p");

              return (
                <div
                  key={`${selectedDay}-${timeSlot}`}
                  className={`flex flex-col sm:flex-row sm:justify-between p-5 rounded-xl border border-white/5 shadow-md gap-4 ${
                    isLab ? "bg-[#2A1612]" : "bg-[#181C25]"
                  }`}
                >
                  <div className="flex flex-col justify-between">
                    <h3 className="text-base font-bold text-white mb-2">
                      {title}
                    </h3>
                    <div className="text-sm text-gray-400 font-medium mb-2 flex items-center gap-2">
                      <span>
                        {code}
                        {faculty ? ` • ${faculty}` : ""}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {room || "NA"}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center sm:gap-0 mt-2 sm:mt-0">
                    <span className="text-gray-300 text-sm font-semibold sm:mb-4">
                      {formatRangeForUi(timeSlot)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        isLab
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {isLab ? "Practical/Lab" : type || "Theory"}
                    </span>
                  </div>
                </div>
              );
            })}
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
            const isActive = "Timetable" === link.name;
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

const DownloadTimetable = dynamic(() => import("./DownloadTimetable"));
