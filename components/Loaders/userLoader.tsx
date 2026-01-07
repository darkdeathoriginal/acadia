import React from "react";

export default function UserLoader() {
  return (
    <div role="status" className="max-w animate-pulse">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col  mt-20 gap-3 p-4 border rounded-md xl:w-1/2 w-10/12">
          <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 "></div>

          <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 "></div>

          <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 "></div>
        </div>
        <div className="mx-5 my-5">
          <div className="flex p-44 justify-center px-10 py-2 border rounded-lg">
            <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
