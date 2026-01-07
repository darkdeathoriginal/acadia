import React from "react";

// src/components/PlannerSkeleton.js
const PlannerSkeleton = () => {
  return (
    <div>
      {/* Header Skeleton - Mimics Header component */}
      <div className="bg-gray-800 text-white text-xl p-4 text-center h-[60px] flex items-center justify-center">
        <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></div>
      </div>

      <div className="flex flex-col mx-4 mb-20 mt-3 text-white">
        {/* Academic Year Dropdown Skeleton */}
        <div className="mb-6 relative">
          <h2 className="text-lg font-medium mb-3 flex items-center">
            <div className="mr-2 h-5 w-5 bg-gray-600 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-600 rounded w-32 animate-pulse"></div>
          </h2>

          <div className="w-full flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div className="h-5 bg-gray-600 rounded w-48 animate-pulse"></div>
            <div className="h-5 w-5 bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Month Tabs Skeleton */}
        <div className="flex justify-between rounded-t-md bg-slate-500">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-grow p-1 justify-center rounded-t-md cursor-pointer bg-slate-500"
            >
              <div className="p-1">
                <div className="h-4 bg-slate-400 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="flex flex-col gap-1 mt-5">
          <table className="text-center bg-gray-600">
            <thead>
              <tr className="bg-gray-800 rounded-md">
                <th className="p-1 border-b-[1px] rounded-tl-[10px] w-1">
                  <div className="h-4 bg-gray-600 rounded w-8 animate-pulse mx-auto"></div>
                </th>
                <th className="p-1 border-l-[1px] border-b-[1px] w-1">
                  <div className="h-4 bg-gray-600 rounded w-8 animate-pulse mx-auto"></div>
                </th>
                <th className="p-1 border-b-[1px] border-l-[1px]">
                  <div className="h-4 bg-gray-600 rounded w-16 animate-pulse mx-auto"></div>
                </th>
                <th className="p-1 border-b-[1px] border-l-[1px] rounded-tr-[10px] w-1">
                  <div className="h-4 bg-gray-600 rounded w-12 animate-pulse mx-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(15)].map((_, i) => {
                const isLastRow = i === 14;
                return (
                  <tr key={i} className={i === 5 ? "bg-red-500/20" : ""}>
                    <td className={`p-1 ${!isLastRow ? "border-b-[1px]" : ""}`}>
                      <div className="h-4 bg-gray-500 rounded w-6 animate-pulse mx-auto"></div>
                    </td>
                    <td
                      className={`p-1 border-l-[1px] ${
                        !isLastRow ? "border-b-[1px]" : ""
                      }`}
                    >
                      <div className="h-4 bg-gray-500 rounded w-8 animate-pulse mx-auto"></div>
                    </td>
                    <td
                      className={`p-1 border-l-[1px] ${
                        !isLastRow ? "border-b-[1px]" : ""
                      }`}
                    >
                      <div
                        className={`h-4 bg-gray-500 rounded animate-pulse mx-auto ${
                          i % 3 === 0 ? "w-32" : i % 3 === 1 ? "w-24" : "w-40"
                        }`}
                      ></div>
                    </td>
                    <td
                      className={`p-1 border-l-[1px] ${
                        !isLastRow ? "border-b-[1px]" : ""
                      }`}
                    >
                      <div className="h-4 bg-gray-500 rounded w-4 animate-pulse mx-auto"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlannerSkeleton;
