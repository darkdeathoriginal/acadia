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
  Mail,
  MessageSquare,
  Moon,
  Percent,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { useMemo, useState } from "react";

export default function CgpaCalculator() {
  const { data: user } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const { data: attendanceData } = useFetchWithCache(
    "/api/attendance",
    "cache_at",
  );

  const [courses, setCourses] = useState<
    {
      id: number;
      name: string;
      included: boolean;
      currentScore: string;
      totalScore: string;
      expectedRemaining: string;
      credits: number;
      targetGrade: number;
    }[]
  >([]);

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

  const handleAddCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now(),
        name: `Course ${courses.length + 1}`,
        included: true,
        currentScore: "",
        totalScore: "10",
        expectedRemaining: "50",
        credits: 3,
        targetGrade: 5,
      },
    ]);
  };

  const handleImportCourses = () => {
    if (attendanceData && Array.isArray(attendanceData)) {
      const imported = attendanceData.map((c, i) => ({
        id: Date.now() + i,
        name: c.title || c.code || `Course ${i + 1}`,
        included: true,
        currentScore: "",
        totalScore: "10",
        expectedRemaining: "50",
        credits: c.slot === "LAB" ? 2 : 3, // basic assumption depending on lab
        targetGrade: 5,
      }));
      setCourses(imported);
    } else {
      handleAddCourse();
    }
  };

  const handleClearAll = () => {
    setCourses([]);
  };

  const updateCourse = (id: number, field: string, value: any) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const grades = [
    { label: "C", value: 0, pts: 5 },
    { label: "B", value: 1, pts: 6 },
    { label: "B+", value: 2, pts: 7 },
    { label: "A", value: 3, pts: 8 },
    { label: "A+", value: 4, pts: 9 },
    { label: "O", value: 5, pts: 10 },
  ];

  const { cgpa, calculatedCredits, subjectsCount } = useMemo(() => {
    let totalPoints = 0;
    let totalCreds = 0;
    let subjects = 0;
    courses.forEach((c) => {
      if (c.included && c.credits > 0) {
        // mock logic using targetGrade mapping
        const pts = grades.find((g) => g.value === c.targetGrade)?.pts || 0;
        totalPoints += pts * c.credits;
        totalCreds += c.credits;
        subjects++;
      }
    });

    return {
      cgpa: totalCreds > 0 ? (totalPoints / totalCreds).toFixed(2) : "0.00",
      calculatedCredits: totalCreds,
      subjectsCount: subjects,
    };
  }, [courses]);

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
              const isActive = "GPA Calculator" === link.name;
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
          {/* Header Card / Stats */}
          <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] p-6 lg:p-8 flex flex-col shadow-lg animate-fade-in-up">
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-3">
                <Percent className="text-white w-6 h-6" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  SGPA Calculator
                </h2>
              </div>
              <p className="text-gray-400 text-sm font-medium mt-1">
                Calculate your semester grade point average
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#14141a] border border-white/5">
                <span className="text-4xl font-bold text-white mb-2">
                  {cgpa}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  Current SGPA
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#14141a] border border-white/5">
                <span className="text-4xl font-bold text-white mb-2">
                  {calculatedCredits}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  Total Credits
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#14141a] border border-white/5">
                <span className="text-4xl font-bold text-white mb-2">
                  {subjectsCount}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  Subjects
                </span>
              </div>
            </div>
          </div>

          {/* Courses List Section */}
          <div className="mb-10 w-full animate-fade-in-up delay-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Courses
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleImportCourses}
                  className="hidden md:flex px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-[#1a1a24] hover:bg-white/10 transition-colors border border-white/5"
                >
                  Import Courses
                </button>
                <button
                  onClick={handleAddCourse}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} /> Add Course
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-red-500 bg-[#1a0f12] border border-red-900/30 hover:bg-[#251216] transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="w-full flex justify-center py-10 rounded-2xl border border-white/5 bg-[#0d0d12] flex-col items-center gap-4">
                <p className="text-gray-500 font-medium">
                  No courses added yet.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleImportCourses}
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-[#1a1a24] hover:bg-white/10 transition-colors border border-white/5"
                  >
                    Import Courses
                  </button>
                  <button
                    onClick={handleAddCourse}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} /> Add Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const pts =
                    grades.find((g) => g.value === course.targetGrade)?.pts ||
                    0;
                  const gradeLabel =
                    grades.find((g) => g.value === course.targetGrade)?.label ||
                    "C";

                  return (
                    <div
                      key={course.id}
                      className="border border-white/5 rounded-2xl bg-[#0d0d12] shadow-lg flex flex-col overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-5 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={course.included}
                              onChange={(e) =>
                                updateCourse(
                                  course.id,
                                  "included",
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="w-10 h-5.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                          </label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(course.id, "name", e.target.value)
                            }
                            className="bg-transparent text-white font-bold text-lg outline-none w-full"
                          />
                        </div>
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="text-red-500/70 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Inputs */}
                      <div className="px-5 pb-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs font-medium block mb-1">
                            Current
                          </label>
                          <input
                            type="text"
                            value={course.currentScore}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "currentScore",
                                e.target.value,
                              )
                            }
                            className="w-full bg-[#14141a] border border-white/5 rounded-lg px-3 py-2 text-white outline-none focus:border-white/20 text-sm"
                            placeholder="7.8"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs font-medium block mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            value={course.totalScore}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "totalScore",
                                e.target.value,
                              )
                            }
                            className="w-full bg-[#14141a] border border-white/5 rounded-lg px-3 py-2 text-white outline-none focus:border-white/20 text-sm"
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div className="px-5 pb-4">
                        <div className="flex items-center justify-between bg-[#14141a] border border-white/5 rounded-lg pl-3 pr-1 py-1">
                          <span className="text-gray-400 text-sm">
                            Expected remaining from 50:
                          </span>
                          <input
                            type="text"
                            value={course.expectedRemaining}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "expectedRemaining",
                                e.target.value,
                              )
                            }
                            className="w-16 bg-[#1a1a24] text-white font-bold text-center rounded px-2 py-1 outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Slider & Finals info */}
                      <div className="px-5 pb-5">
                        <div className="bg-[#14141a] border border-white/5. rounded-xl p-4">
                          {/* Slider area */}
                          <div className="mb-6 relative">
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="1"
                              value={course.targetGrade}
                              onChange={(e) =>
                                updateCourse(
                                  course.id,
                                  "targetGrade",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                              style={{
                                accentColor: "white",
                              }}
                            />
                            <div className="flex justify-between mt-2 px-1">
                              {grades.map((g, i) => (
                                <span
                                  key={i}
                                  className={`text-xs font-bold ${
                                    course.targetGrade === g.value
                                      ? "text-white"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {g.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm font-medium">
                              Finals needed
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Static mockup for now */}
                              <span className="text-[#22c55e] font-bold text-sm">
                                63/75
                              </span>
                              <span className="text-[10px] font-bold text-yellow-600 bg-yellow-900/30 px-2 py-0.5 rounded uppercase">
                                Hard
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Section */}
                      <div className="mt-auto px-5 py-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-extrabold text-white text-base">
                            {gradeLabel}
                          </span>
                          <span className="text-gray-400">
                            {pts} pts •{" "}
                            <input
                              type="number"
                              value={course.credits}
                              onChange={(e) =>
                                updateCourse(
                                  course.id,
                                  "credits",
                                  Number(e.target.value),
                                )
                              }
                              className="w-8 bg-transparent underline decoration-dashed outline-none text-center p-0 m-0 text-gray-400 hover:text-white"
                            />{" "}
                            Credits
                          </span>
                        </div>
                        {/* Static Percentage Mockup */}
                        <div className="text-sm text-gray-400 font-medium">
                          78.0%
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            const isActive = "GPA Calculator" === link.name;
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


