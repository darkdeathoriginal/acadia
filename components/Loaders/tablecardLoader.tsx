import React from "react";

export default function TableCardLoader() {
  return (
    <div role="status" className="max-w animate-pulse">
      <div className="flex justify-between outline outline-slate-500 w-full rounded-md p-2 gap-3">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-4"></div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
        </div>
        <div className="flex outline outline-slate-500 px-10 items-center rounded-md flex-grow ml-5">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 flex-grow"></div>
        </div>
      </div>
    </div>
  );
}
