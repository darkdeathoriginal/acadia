"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  {
    icon: "📈",
    title: "Attendance",
    link: "/attendance",
  },
  {
    icon: "📊",
    title: "Mark",
    link: "/mark",
  },
  {
    icon: "🗓️",
    title: "Timetable",
    link: "/timetable",
  },
  {
    icon: "👾",
    title: "User",
    link: "/user",
  },
];
export default function Footer() {
  const notInclude = ["/login", "/cgpacalculator"];
  const path = usePathname();
  return (
    <div className="fixed -bottom-1 left-0 right-0 bg-black/70 backdrop-blur-md text-white py-4 rounded-md">
      <div className="flex justify-between px-4">
        {items.map((e, i) => {
          return (
            <Link
              key={i}
              className="flex items-center flex-col cursor-pointer hover:scale-110 transition-all ease-in duration-100"
              href={e.link}
              prefetch={false}
            >
              <p className="text-sm font-medium">{e.icon}</p>
              <p className="text-sm font-medium">{e.title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
