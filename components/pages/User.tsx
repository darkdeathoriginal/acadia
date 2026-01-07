"use client";
import Header from "@/components/Header";
import UserLoader from "@/components/Loaders/userLoader";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie } from "@/utils/helpers";
import React from "react";

export default function User() {
  const { data, loading, error } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60
  );

  return (
    <>
      <Header title={"User"} />
      {data && (
        <div className="flex flex-col justify-center items-center text-white">
          <div className="flex flex-col  mt-20 gap-3 p-4 border rounded-md xl:w-1/2 w-10/12">
            <div className="bg-slate-600 rounded-md p-1">
              <h2 className="w-auto">{data.name}</h2>
            </div>
            <div className="bg-slate-600 rounded-md p-1">
              <h2>{data.roll}</h2>
            </div>
            <div className="bg-slate-600 rounded-md p-1">
              <h1>{data.program + " " + data.department}</h1>
            </div>
          </div>
          <div className="mx-5 my-5">
            <div className="flex p-44 justify-center px-10 py-2 border rounded-lg">
              <button
                className="bg-red-600 px-6 py-1 rounded-md"
                onClick={() => delCookie()}
              >
                {" "}
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {!data && loading && <UserLoader />}
    </>
  );
}
