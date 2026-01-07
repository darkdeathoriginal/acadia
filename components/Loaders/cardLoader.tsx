import React from "react";

export default function CardLoader() {
  return (
    <div role="status" className="max-w animate-pulse">
      <div className="flex gap-3 flex-col p-3 rounded-md outline outline-slate-500 w-full">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-auto"></div>
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-16"></div>
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="flex gap-3">
              <div className="flex items-center flex-col">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-7"></div>
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-4 mt-2"></div>
              </div>
              <div className="flex items-center flex-col text-red-400">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-7"></div>
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-4 mt-2"></div>
              </div>
              <div className="flex items-center flex-col text-green-400">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-7"></div>
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-4 mt-2"></div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
