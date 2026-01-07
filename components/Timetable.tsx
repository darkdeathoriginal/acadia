"use client";

import { delCookie, fetchWithCache, interpolateColor } from "@/utils/helpers";
import cookie from "js-cookie";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HorizontalScroll from "./HorizontalScroll";
import TableCardLoader from "./Loaders/tablecardLoader";
import Spinner from "./spinner";
import Tablecard from "./Tablecard";

const DownloadTimetable = dynamic(() => import("./DownloadTimetable"));

const TOTAL_DAYS = 5;
const BUTTON_STEP = 25;
const LOADER_COUNT = 5;
const INITIAL_LOADING_TEXT = "Updating day order..";

const TimetableButtons = ({ percentage, setPosition }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
        const buttonStart = i * BUTTON_STEP;
        const clampedButtonPercentage = Math.min(
          1,
          Math.abs(buttonStart - percentage) / BUTTON_STEP
        );

        return (
          <button
            key={`button-${i}`}
            className="px-3 py-1 rounded-md"
            onClick={() => setPosition(i)}
            style={{
              background: interpolateColor(
                "#ef4444",
                "#64748b",
                clampedButtonPercentage
              ),
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col gap-5 text-lg">
    {Array.from({ length: LOADER_COUNT }).map((_, index) => (
      <TableCardLoader key={`loader-${index}`} />
    ))}
  </div>
);

export default function Timetable({ tm = false, section }) {
  const [dayOrder, setDayOrder] = useState("1");
  const [loading, setLoading] = useState(INITIAL_LOADING_TEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(tm);
  const [position, setPosition] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const fetchDayOrder = useCallback(async () => {
    try {
      //change to cached fetch
      const today = new Date().toDateString();
      await fetchWithCache(
        `/api/dayorder?date=${today}`,
        { cache: "no-store", next: { revalidate: 1 } },
        "cache_do_" + today,
        {
          setState: (response) => {
            const data = response;
            if (!data || !data.do) {
              setLoading("No day order available");
              setDayOrder("No day order available");
              return;
            }
            setLoading("");
            if (data.do === "N") {
              setDayOrder("No day order");
              return;
            }
            const newPosition = Number(data.do) - 1;
            setPosition(newPosition);
            setDayOrder(data.do);
          },
        }
      );
    } catch (error) {
      console.error("Error fetching day order:", error);
      setLoading("Error loading day order");
    }
  }, []);

  const initializeCookies = useCallback(() => {
    try {
      const userDataString = localStorage.getItem("cache_user");
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);

      if (!cookie.get("regno")) {
        cookie.set("regno", userData.roll);
      }

      if (!cookie.get("section")) {
        cookie.set("section", userData.section);
      }
    } catch (error) {
      console.error("Error initializing cookies:", error);
    }
  }, []);

  const fetchTimetableData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check local cache first
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
            setIsLoading(false);
            setData(response.data || []);
          },
        }
      );
    } catch (error) {
      if (error?.error === "Invalid cookie") {
        delCookie();
      }
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
    clearOldDayOrder();
  }, [tm, initializeCookies, fetchDayOrder, fetchTimetableData]);

  const timetableContent = useMemo(() => {
    if (!data) return null;
    const formattedData = formatData(data);
    return Object.keys(formattedData).map((elem, index) => (
      <div className="h-[80vh] overflow-auto" key={`tableid-${index}`}>
        <div className="flex flex-col gap-5 text-lg mx-5 lg:mx-10 lg:mb-28 mb-20">
          {Object.keys(formattedData[elem])?.map((timeSlot, i) => {
            const { title, type, room } = formattedData[elem][timeSlot];
            return (
              <Tablecard
                key={`${index}-${i}`}
                time={timeSlot}
                name={`${title} (${type}) ${room}`}
                isDay={Number(dayOrder) === index + 1}
              />
            );
          })}
        </div>
      </div>
    ));
  }, [data, dayOrder]);

  return (
    <div className="h-[90vh] overflow-hidden">
      <div className="flex gap-3 flex-col px-5 lg:px-10 mb-5">
        {loading && !tm ? (
          <Spinner text={loading} />
        ) : tm ? (
          "Day Order not available"
        ) : (
          `Day Order - ${dayOrder}`
        )}

        <div className="flex justify-between">
          <TimetableButtons percentage={percentage} setPosition={setPosition} />
          {<DownloadTimetable timetable={data} section={section} />}
        </div>
      </div>

      {data && (
        <HorizontalScroll
          position={position}
          setPosition={setPosition}
          setPercentage={setPercentage}
          elements={timetableContent}
        />
      )}

      <div className="flex flex-col gap-5 text-lg mx-5 lg:mx-10">
        {!data && isLoading && <LoadingState />}
      </div>
    </div>
  );
}

function formatData(data) {
  if (!data) return data;
  const formattedData = {};
  for (const key in data) {
    const formattedDay = {};
    const day = data[key];
    let prevTime = null;
    for (const time in day) {
      const timeData = day[time];
      const [startTime, endTime] = time?.split(" - ");
      const prevEndTime = prevTime?.split(" - ")[1];
      const prevStartTime = prevTime?.split(" - ")[0];
      const prevTimeData = prevTime ? day[prevTime] : {};
      if (startTime === prevEndTime && timeData.code === prevTimeData.code) {
        delete formattedDay[prevTime];
        formattedDay[`${prevStartTime} - ${endTime}`] = timeData;
      } else {
        formattedDay[time] = timeData;
      }
      prevTime = time;
    }
    formattedData[key] = formattedDay;
  }
  return formattedData;
}

function clearOldDayOrder() {
  const today = new Date().toDateString();
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (key.startsWith("cache_do_") && !key.includes(today)) {
      localStorage.removeItem(key);
    }
  });
}
