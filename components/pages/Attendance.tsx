"use client";
import Header from "@/components/Header";
import HorizontalScroll from "@/components/HorizontalScroll";
import MiddleSection from "@/components/MiddleSection";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { useState } from "react";
import Card from "../card";

export default function Attendance() {
  const { data, loading, error } = useFetchWithCache(
    "/api/attendance",
    "cache_at",
  );

  const [position, setPosition] = useState(0);
  const [percentage, setPercentage] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md pt-4 pb-2 border-b border-zinc-800">
        <Header title={"Attendance"} />

        {/* Simple Tab Navigation */}
        <div className="flex justify-center mt-4 px-4 gap-2">
          <button
            onClick={() => setPosition(0)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              position === 0
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Theory
          </button>
          <button
            onClick={() => setPosition(1)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              position === 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Practical
          </button>
        </div>

        {/* Animated Indicator Line (optional, based on percentage if desired, but sticking to solid tabs for cleanliness) */}
        {/* <div className="h-0.5 bg-zinc-800 mt-2 relative overflow-hidden">
            <div 
                className="absolute top-0 bottom-0 w-1/2 bg-blue-500 transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${percentage}%)` }} // Simplified percentage tracking if needed
            />
        </div> */}
      </div>

      <div className="pt-4 h-[calc(100vh-140px)]">
        {data && (
          <HorizontalScroll
            position={position}
            setPosition={setPosition}
            setPercentage={setPercentage}
            elements={[
              <MiddleSection key={"theory-at"}>
                <div
                  className="flex flex-col gap-4 px-4 pb-20 max-w-3xl mx-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {data
                    .filter((e, i) => e.slot !== "LAB")
                    .map((e, i) => {
                      return <Card data={e} key={i + e.code + e.slot} />;
                    })}
                  {data.filter((e) => e.slot !== "LAB").length === 0 && (
                    <div className="text-center text-zinc-500 py-10">
                      No theory classes found
                    </div>
                  )}
                </div>
              </MiddleSection>,
              <MiddleSection key={"practical-at"}>
                <div className="flex flex-col gap-4 px-4 pb-20 max-w-3xl mx-auto">
                  {data
                    .filter((e, i) => e.slot === "LAB")
                    .map((e, i) => {
                      return <Card data={e} key={i + e.code + e.slot} />;
                    })}
                  {data.filter((e) => e.slot === "LAB").length === 0 && (
                    <div className="text-center text-zinc-500 py-10">
                      No practical classes found
                    </div>
                  )}
                </div>
              </MiddleSection>,
            ]}
          />
        )}

        {!data && loading && (
          <div className="flex flex-col gap-4 px-4 mt-4 max-w-3xl mx-auto animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-zinc-900/50 rounded-xl border border-zinc-800"
              ></div>
            ))}
          </div>
        )}

        {!data && !loading && error && (
          <div className="flex justify-center items-center h-64 text-red-400">
            Failed to load attendance data
          </div>
        )}
      </div>
    </div>
  );
}
