import React from "react";

export default function MarkCard({ data }) {
  return (
    <div className="flex gap-3 flex-col p-3 rounded-md bg-gradient-to-r from-blue-800 to-slate-800 text-white">
      <h2 className="font-bold text-lg">{data.name}</h2>
      <p className="text-sm -mt-2 font-medium text-orange-300">{data.code}</p>
      <p className="text-sm -mt-2 font-medium text-green-400">
        Credit : {data.credit}
      </p>
      <div className="flex gap-3 flex-wrap">
        {data.marks.map((e, i) => {
          return (
            <div
              className="flex flex-col items-center font-medium text-xs"
              key={i}
            >
              <span className="text-yellow-400">{e.name}</span>
              <span>{e.mark + "/" + e.total}</span>
            </div>
          );
        })}
      </div>
      {data.total && (
        <p className="text-sm -mt-2 font-medium text-green-400">
          Total : {data.total}
        </p>
      )}
    </div>
  );
}
