"use client";

import DashboardLayout from "@/components/DashboardLayout";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { Percent, Plus, Trash2 } from "lucide-react";
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

  const { data: marksData } = useFetchWithCache("/api/mark", "cache_mk");

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
    // Favor Marks Data because it has exactly everything: name, code, Marks (total "X/Y"), and Credit.
    if (marksData && Array.isArray(marksData) && marksData.length > 0) {
      const imported = marksData.map((m: any, i) => {
        let obtained = 0;
        let assessed = 0;
        if (m.total && typeof m.total === "string" && m.total.includes("/")) {
          const parts = m.total.split("/");
          obtained = parseFloat(parts[0]) || 0;
          assessed = parseFloat(parts[1]) || 0;
        }

        const credits = Number(m.credit) || (m.type === "Practical" ? 2 : 3);

        const expectedRemainingStr =
          assessed < 100 ? String(100 - assessed) : "0";

        // Guess target grade based on performance so far or default to A
        let predictedPercent = assessed > 0 ? (obtained / assessed) * 100 : 80;
        let targetG = 3; // "A"
        if (predictedPercent >= 90)
          targetG = 5; // "O"
        else if (predictedPercent >= 85)
          targetG = 4; // "A+"
        else if (predictedPercent >= 80)
          targetG = 3; // "A"
        else if (predictedPercent >= 75)
          targetG = 2; // "B+"
        else if (predictedPercent >= 70)
          targetG = 1; // "B"
        else targetG = 0; // "C"

        return {
          id: Date.now() + i,
          name: m.name || m.code || `Course ${i + 1}`,
          included: true,
          currentScore: obtained > 0 ? obtained.toFixed(1) : "",
          totalScore: assessed > 0 ? String(assessed) : "10",
          expectedRemaining: expectedRemainingStr,
          credits,
          targetGrade: targetG, // Dynamically guessed point
        };
      });
      setCourses(imported);
    } else if (attendanceData && Array.isArray(attendanceData)) {
      // Fallback
      const imported = attendanceData.map((c, i) => {
        return {
          id: Date.now() + i,
          name: c.title || c.code || `Course ${i + 1}`,
          included: true,
          currentScore: "",
          totalScore: "10",
          expectedRemaining: "50",
          credits: c.slot === "LAB" ? 2 : 3,
          targetGrade: 5,
        };
      });
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
    { label: "C", value: 0, pts: 5, threshold: 45 },
    { label: "B", value: 1, pts: 6, threshold: 50 },
    { label: "B+", value: 2, pts: 7, threshold: 60 },
    { label: "A", value: 3, pts: 8, threshold: 70 },
    { label: "A+", value: 4, pts: 9, threshold: 80 },
    { label: "O", value: 5, pts: 10, threshold: 90 },
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
    <DashboardLayout user={user} activeTab="GPA Calculator">
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
              <span className="text-4xl font-bold text-white mb-2">{cgpa}</span>
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
              <p className="text-gray-500 font-medium">No courses added yet.</p>
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
                const gradeObj = grades.find(
                  (g) => g.value === course.targetGrade,
                );
                const pts = gradeObj?.pts || 0;
                const gradeLabel = gradeObj?.label || "C";
                const threshold = gradeObj?.threshold || 0;

                const currentSc = Number(course.currentScore) || 0;
                const expectedRem = Number(course.expectedRemaining) || 0;
                const totalInternals = currentSc + expectedRem;

                // Max weight for finals in SRM is typically 50.
                const finalsNeededRaw = threshold - totalInternals;
                const finalsNeeded = Math.max(0, finalsNeededRaw); // minimum 0

                let diffLabel = "Easy";
                let diffColor =
                  "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20";

                if (finalsNeededRaw > 50) {
                  diffLabel = "Impossible";
                  diffColor =
                    "text-purple-500 bg-purple-500/10 border-purple-500/20";
                } else if (finalsNeeded > 45) {
                  diffLabel = "Hard";
                  diffColor = "text-red-500 bg-red-500/10 border-red-500/20";
                } else if (finalsNeeded > 35) {
                  diffLabel = "Medium";
                  diffColor =
                    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
                }

                const currentPercent =
                  Number(course.totalScore) > 0
                    ? ((currentSc / Number(course.totalScore)) * 100).toFixed(1)
                    : "0.0";

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
                            <span
                              className={`font-bold text-sm ${finalsNeededRaw > 50 ? "text-red-500" : "text-white"}`}
                            >
                              {finalsNeeded}/50
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${diffColor}`}
                            >
                              {diffLabel}
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
                      <div className="text-sm text-gray-400 font-medium">
                        {currentPercent}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
