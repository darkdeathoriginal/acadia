"use client";
import Header from "@/components/Header";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Planner() {
  const {
    data: codeData,
    loading: codeLoading,
    error: codeError,
  } = useFetchWithCache("/api/code", "cache_code", 1000 * 60 * 60);

  const formattedCodes = getPageData(codeData);

  // State management fixes
  const [path, setPath] = useState("Academic_Planner_2025_26_EVEN");

  const [changed, setChanged] = useState(false); // Moved to state instead of global variable

  const { data, loading, error } = useFetchWithCache(
    `/api/planner?code=${path}`,
    `cache_pl_${path}`,
    1000 * 60 * 60
  );

  const [month, setMonth] = useState(null); // Changed from false to null for clarity
  const lastElementRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fixed async function - made it synchronous since it doesn't need to be async
  const setCurrentMonth = (data) => {
    if (!data) return;

    const currentMonth = getCurrentMonth();
    if (data[currentMonth]) {
      setMonth(currentMonth);
      return;
    }

    // Set to first available month if current month not found
    const firstMonth = Object.keys(data)[0];
    if (firstMonth) {
      setMonth(firstMonth);
    }
  };

  // Effects with proper dependencies
  useEffect(() => {
    setCurrentMonth(data);
  }, [data]);

  useLayoutEffect(() => {
    if (lastElementRef.current && !changed) {
      setChanged(true);
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [month, changed]);

  // Reset changed state when path changes
  useEffect(() => {
    setChanged(false);
  }, [path]);

  // Helper function with proper error handling
  const getSelectedCourseName = () => {
    if (!formattedCodes || formattedCodes.length === 0) return "";

    const selected = formattedCodes.find((course) => course.path === path);
    return selected ? selected.name : formattedCodes[0]?.name || "";
  };

  // Error handling
  if (error || codeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Planner</h2>
        <p>
          {error?.message ||
            codeError?.message ||
            "Failed to load planner data. Please try again later."}
        </p>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Loading planner data...</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Academic Planner" />
      <div className="flex flex-col mx-4 mb-20 mt-3 text-white">
        {/* Course Selection Dropdown */}
        {/* {formattedCodes && formattedCodes.length > 1 && (
          <div className="mb-6 relative" ref={dropdownRef}>
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Academic Year
            </h2>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-all"
            >
              <span className="font-medium truncate">
                {getSelectedCourseName()}
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {formattedCodes.map((course, i) => (
                  <button
                    key={`course-${i}`}
                    onClick={() => {
                      setPath(course.path);
                      setChanged(false);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-700 transition-colors ${
                      i !== formattedCodes.length - 1
                        ? "border-b border-gray-700"
                        : ""
                    } ${path === course.path ? "bg-indigo-600" : ""}`}
                  >
                    <p className="font-medium">{course.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )} */}

        {/* Month Selection Tabs */}
        {data && Object.keys(data).length > 0 && (
          <div className="flex justify-between rounded-t-md bg-slate-500">
            {Object.keys(data).map((monthKey, i) => (
              <div
                key={`month-${i}`}
                className={`flex flex-grow p-1 justify-center rounded-t-md cursor-pointer transition-colors ${
                  month === monthKey
                    ? "bg-red-500"
                    : "bg-slate-500 hover:bg-slate-400"
                }`}
                onClick={() => setMonth(monthKey)}
              >
                <span className="p-1">{monthKey}</span>
              </div>
            ))}
          </div>
        )}

        {/* Planner Table */}
        {month && data[month] && (
          <div className="flex flex-col gap-1 mt-5">
            <table className="text-center bg-gray-600">
              <thead>
                <tr className="bg-gray-800 rounded-md">
                  <th className="p-1 border-b-[1px] rounded-tl-[10px] w-1">
                    Date
                  </th>
                  <th className="p-1 border-l-[1px] border-b-[1px] w-1">Day</th>
                  <th className="p-1 border-b-[1px] border-l-[1px]">Details</th>
                  <th className="p-1 border-b-[1px] border-l-[1px] rounded-tr-[10px] w-1">
                    Dayorder
                  </th>
                </tr>
              </thead>
              <tbody>
                {data[month]?.map((entry, i) => {
                  if (!entry.date) return null;

                  const isCurrentDate =
                    i + 1 === getCurrentDate() && month === getCurrentMonth();
                  const isLastRow = data[month].length === i + 1;

                  return (
                    <tr
                      key={`entry-${i}`}
                      ref={isCurrentDate ? lastElementRef : null}
                      className={isCurrentDate ? "bg-red-500" : ""}
                    >
                      <td
                        className={`p-1 ${!isLastRow ? "border-b-[1px]" : ""}`}
                      >
                        {entry.date}
                      </td>
                      <td
                        className={`p-1 border-l-[1px] ${
                          !isLastRow ? "border-b-[1px]" : ""
                        }`}
                      >
                        {entry.day}
                      </td>
                      <td
                        className={`p-1 border-l-[1px] ${
                          !isLastRow ? "border-b-[1px]" : ""
                        }`}
                        style={{
                          wordBreak:
                            month === Object.keys(data)[0]
                              ? "break-all"
                              : "normal",
                        }}
                      >
                        {entry.sp}
                      </td>
                      <td
                        className={`p-1 border-l-[1px] ${
                          !isLastRow ? "border-b-[1px]" : ""
                        }`}
                      >
                        {entry.dayo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
  const year = now.getFullYear().toString().substr(-2); // Get the last two digits of the year
  return `${month} '${year}`;
}
function getCurrentDate() {
  const now = new Date();
  return now.getDate();
}

function getPageData(data) {
  return data?.APPPAGES?.["Academic_Reports"]?.COMPONENTS?.map((e) => {
    return {
      name: e?.COMPLINKNAME.split("Academic_Planner_")[1].replace(/_/g, " "),
      path: e?.COMPLINKNAME,
    };
  });
}
