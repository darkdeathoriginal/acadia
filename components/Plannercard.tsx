import React from "react";

export default function PlannerCard({ data, refs }) {
  return (
    <div
      className={
        "flex gap-5 bg-slate-700 p-2 rounded-md" +
        (refs ? "border-solid border-red-500 border-2" : "")
      }
      ref={refs}
    >
      <div className="flex w-5">
        <span>{data.date}</span>
      </div>
      <div className="flex w-10">
        <span>{data.day}</span>
      </div>
      <div className="flex flex-grow">
        <span>{data.sp}</span>
      </div>
      <div className="flex w-5">
        <span>{data.dayo}</span>
      </div>
    </div>
  );
}
