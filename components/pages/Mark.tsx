"use client";
import DashboardLayout from "@/components/DashboardLayout";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { GraduationCap } from "lucide-react";

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

  // Logic Calculations
  let overallObtained = 0;
  let overallMax = 0;
  let subjectsWithMarks = 0;
  let globalPercentage = 0;

  if (marksData && !(marksData as any).error && Array.isArray(marksData)) {
    marksData.forEach((subject) => {
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
          if (m.total) {
            localMax += Number(m.total);
          }
          hasMarks = true;
        }
      });

      // course.total is a string like "25.50/50" from the API
      let subjObtained = localTotal;
      let subjMax = localMax;
      if (
        subject.total &&
        typeof subject.total === "string" &&
        subject.total.includes("/")
      ) {
        const parts = subject.total.split("/");
        subjObtained = parseFloat(parts[0]) || localTotal;
        subjMax = parseFloat(parts[1]) || localMax;
      }
      if (subjMax === 0) subjMax = 100;

      if (hasMarks || subject.total) {
        subjectsWithMarks++;
        overallObtained += subjObtained;
        overallMax += subjMax;
      }
    });

    if (overallMax > 0) {
      globalPercentage = Math.round((overallObtained / overallMax) * 100);
    }
  }

  return (
    <DashboardLayout user={user} activeTab="Marks & Grades">
      {/* Marks Content */}
      <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
        {/* Academic Performance Overview Section */}
        <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg">
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
                {overallObtained.toFixed(1)}
                <span className="text-gray-500 text-2xl">/{overallMax}</span>
              </h3>
              <p className="text-gray-400 text-sm font-medium">Total Marks</p>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        <div className="flex flex-col gap-6" style={{ minHeight: "150px" }}>
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
            !(marksData as any).error &&
            Array.isArray(marksData) &&
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

              // course.total is a string like "25.50/50" from the API
              if (
                course.total &&
                typeof course.total === "string" &&
                course.total.includes("/")
              ) {
                const parts = course.total.split("/");
                subjObtained = parseFloat(parts[0]) || subjObtained;
                subjMax = parseFloat(parts[1]) || subjMax;
              }

              if (subjMax === 0) subjMax = 100;

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
            !(marksData as any).error &&
            Array.isArray(marksData) &&
            marksData.length === 0 && (
              <div className="text-center py-10 text-gray-500 border border-white/5 rounded-2xl bg-[#0d0d12]">
                No marks found
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
