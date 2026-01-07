import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import Progress from "./Progress";

export default function Card({ data }) {
  return (
    <div className="flex gap-3 flex-col p-3 rounded-md bg-gradient-to-r from-blue-800 to-slate-800 text-white">
      <div>
        <h2 className="font-bold text-lg">{data.title}</h2>
        <h3 className="text-sm font-medium">
          <Link
            href={
              "https://www.srmist.edu.in/?s=" + data.faculty.split(".").at(-1)
            }
            target="_blank"
            className="hover:underline"
          >
            {data.faculty}
            <ExternalLink className="inline ml-1 h-4 w-4 -mt-1" />
          </Link>
        </h3>
      </div>
      <p className="text-sm -mt-2 font-medium text-orange-300">{data.code}</p>
      <div className="flex justify-between">
        <div className="flex flex-col gap-3">
          {data.margin < 0 ? (
            <p className="text-sm -mt-1 font-medium text-red-400">
              Required: {Number(data.margin) * -1}
            </p>
          ) : (
            <p className="text-sm -mt-1 font-medium text-green-400">
              Margin: {data.margin}
            </p>
          )}
          <div className="flex gap-3">
            <div className="flex items-center flex-col">
              <p className="text-xs font-medium">Total</p>
              <p className="text-xs font-medium">{data.conducted}</p>
            </div>
            <div className="flex items-center flex-col text-red-400">
              <p className="text-xs font-medium">Abs</p>
              <p className="text-xs font-medium">{data.absent}</p>
            </div>
            <div className="flex items-center flex-col text-green-400">
              <p className="text-xs font-medium">Present</p>
              <p className="text-xs font-medium">
                {Number(data.conducted) - Number(data.absent)}
              </p>
            </div>
          </div>
        </div>
        <div>
          <Progress percentage={Number(data.percetage)} width={70} />
        </div>
      </div>
    </div>
  );
}
