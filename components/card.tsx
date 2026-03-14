import { ExternalLink, User } from "lucide-react";
import Link from "next/link";

export default function Card({ data }) {
  const marginColor = data.margin < 0 ? "text-red-400" : "text-green-400";
  const marginLabel = data.margin < 0 ? "Required" : "Margin";
  const marginValue = data.margin < 0 ? Number(data.margin) * -1 : data.margin;

  return (
    <div className="flex gap-4 flex-col p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <h2 className="font-semibold text-lg text-white leading-tight">
            {data.title}
          </h2>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <User size={14} />
            <Link
              href={
                "https://www.srmist.edu.in/?s=" + data.faculty.split(".").at(-1)
              }
              target="_blank"
              className="hover:text-blue-400 hover:underline transition-colors line-clamp-1"
            >
              {data.faculty}
              <ExternalLink className="inline ml-1 h-3 w-3 -mt-0.5 opacity-50" />
            </Link>
          </div>
          <p className="text-xs font-mono text-zinc-500">{data.code}</p>
        </div>

        {/* Progress Circle Placeholder - assuming passed or handled elsewhere, 
            but adding a small visual indicator for margin if needed */}
        <div
          className={`text-right ${marginColor} bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800`}
        >
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {marginLabel}
          </p>
          <p className="text-lg font-bold">{marginValue}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/50">
        <StatBox label="Total" value={data.conducted} />
        <StatBox label="Absent" value={data.absent} color="text-red-400" />
        <StatBox
          label="Present"
          value={Number(data.conducted) - Number(data.absent)}
          color="text-green-400"
        />
      </div>

      {/* Original structure for Progress component if it was intended to be passed as children or used differently */}
      {/* <Progress ... /> currently not in props, but likely handled by parent if needed */}
    </div>
  );
}

function StatBox({ label, value, color = "text-zinc-200" }) {
  return (
    <div className="flex flex-col items-center bg-zinc-950/30 rounded-lg py-2">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
        {label}
      </span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
