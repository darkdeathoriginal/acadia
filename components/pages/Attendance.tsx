"use client";
import Header from "@/components/Header";
import HorizontalScroll from "@/components/HorizontalScroll";
import CardLoader from "@/components/Loaders/cardLoader";
import MiddleSection from "@/components/MiddleSection";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { interpolateColor } from "@/utils/helpers";
import React, { useEffect, useRef, useState } from "react";
import Card from "../card";

const colors = {
  theory: "#3B82F6",
  practical: "#607d8b",
};

export default function Attendance() {
  const { data, loading, error } = useFetchWithCache(
    "/api/attendance",
    "cache_at"
  );
  const [position, setPosition] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    sliderRef.current.style.transform = `translateX(${percentage}%)`;
    sliderRef.current.style.background = `linear-gradient(to right, ${
      colors.theory
    } 0%, ${colors.theory} ${100 - percentage}%, ${colors.practical} ${
      50 - percentage
    }%, ${colors.practical} 100%)`;
  }, [percentage]);

  return (
    <div className={"overflow-hidden h-[100vh]"}>
      <Header title={"📈Attendance"} />
      <div className="flex justify-center">
        <div
          onClick={() => {
            setPosition(0);
          }}
          className={`flex flex-col grow justify-center pb-1 font-semibold cursor-pointer`}
          style={{
            color: interpolateColor("#3F83F8", "#9CA3AF", percentage / 100),
          }}
        >
          <span className="text-center">Theory</span>
        </div>
        <div
          onClick={() => {
            setPosition(1);
          }}
          className={`flex flex-col grow justify-center pb-1 font-semibold cursor-pointer`}
          style={{
            color: interpolateColor("#9CA3AF", "#607d8b", percentage / 100),
          }}
        >
          <span className="text-center">Practical</span>
        </div>
      </div>
      {/* slider (not clickable) */}
      <div className="h-[2px] bg-gray-400 flex flex-col">
        <span
          className={` h-full w-1/2 `}
          ref={sliderRef}
          style={{
            background: `linear-gradient(to right, ${colors.theory} 0%, ${colors.theory} 100%, ${colors.practical} 50%, ${colors.practical} 100%)`,
          }}
        ></span>
      </div>

      {data && (
        <HorizontalScroll
          position={position}
          setPosition={setPosition}
          setPercentage={setPercentage}
          elements={[
            <MiddleSection key={"theory-at"}>
              <div
                className="flex xl:mx-20 gap-4 flex-col mt-5 md:mx-10 mx-5"
                style={{ scrollbarWidth: "none" }}
              >
                {data
                  .filter((e, i) => e.slot !== "LAB")
                  .map((e, i) => {
                    return <Card data={e} key={i + e.code + e.slot} />;
                  })}
              </div>
            </MiddleSection>,
            <MiddleSection key={"practical-at"}>
              <div className="flex xl:mx-20 gap-4 flex-col mt-5 md:mx-10 mx-5">
                {data
                  .filter((e, i) => e.slot === "LAB")
                  .map((e, i) => {
                    return <Card data={e} key={i + e.code + e.slot} />;
                  })}
              </div>
            </MiddleSection>,
          ]}
        />
      )}

      {!data && loading && (
        <div className="flex xl:mx-20 gap-4 flex-col mb-20 mt-5 md:mx-10 mx-5">
          <CardLoader />
          <CardLoader />
          <CardLoader />
          <CardLoader />
        </div>
      )}
    </div>
  );
}
