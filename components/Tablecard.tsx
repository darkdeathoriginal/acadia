import React from "react";

export default function Tablecard({ time, name, isDay }) {
  return (
    <div
      className={
        "flex text-white justify-between bg-slate-700 rounded-md p-2 gap-3" +
        (isDay && isTimeInRange(time)
          ? "border-solid border-red-500 border-2"
          : "")
      }
    >
      <div className="flex flex-col items-center">
        <p>{time.split("-")[0]}</p>
        <p>⬇️</p>
        <p>{time.split("-")[1]}</p>
      </div>
      <div className="flex bg-slate-900 px-10 items-center rounded-md">
        <p>{name}</p>
      </div>
    </div>
  );
}

function isTimeInRange(rangeString) {
  const [start, end] = rangeString.split(" - ");
  let currentTime = Number(getIndianTime().replace(":", ""));
  const startNumber = Number(start.replace(":", ""));
  const endNumber = Number(end.replace(":", ""));

  if (startNumber > endNumber) {
    currentTime += 1200;
    return (
      currentTime >= startNumber &&
      currentTime <= endNumber + 1200 &&
      isBetween()
    );
  } else {
    return (
      currentTime >= startNumber && currentTime <= endNumber && isBetween()
    );
  }
}

function getIndianTime() {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  const indianTime = new Intl.DateTimeFormat("en-IN", options).format(now);
  return indianTime.split(" ")[0];
}
function isBetween() {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };

  let indianTime = new Intl.DateTimeFormat("en-IN", options).format(now);
  const iTime = Number(indianTime.replace(":", ""));
  return iTime > 700 && iTime < 1900;
}
