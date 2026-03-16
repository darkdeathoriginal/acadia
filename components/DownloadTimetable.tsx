import { fetchWithCache, delCookie } from "@/utils/helpers";
import { generateTimetable } from "@/utils/timetable";
import { Download } from "lucide-react";
import React, { useState } from "react";
import Spinner from "./spinner";
import TimetableImage, { exportAsImage } from "./TimetableImage";

export default function DownloadTimetable({ timetable, section = "" }) {
  const icon = <Download className="w-5 h-5" />;
  const [status, setStatus] = useState<React.ReactNode>(icon);
  const [user, setUser] = useState({ section });
  const [room, setRoom] = useState("");

  const handleClick = async () => {
    setStatus(<Spinner text={""} />);
    
    // Fetch user section if missing
    if (!user.section) {
      await new Promise(async (resolve) => {
        try {
          await fetchWithCache(
            "/api/user",
            { cache: "no-store", next: { revalidate: 1 } },
            "cache_user",
            { setState: setUser }
          );
        } catch (error: any) {
          if (error?.error === "Invalid cookie") {
            delCookie();
          }
        } finally {
          resolve(0);
        }
      });
    }
    
    const resolvedRoom = getMostCommonRoom(timetable);
    setRoom(resolvedRoom);
    
    // Allow React a tick to render the hidden component with new state
    setTimeout(async () => {
      const targetEl = document.getElementById("react-timetable-acadia");
      if (targetEl) {
        await exportAsImage(targetEl, `acadia-timetable.png`);
      } else {
        console.warn("DOM node for React Timetable missing. Falling back to legacy Canvas method.");
        generateTimetable(timetable, user.section, "v1", true, resolvedRoom);
      }
      setStatus(icon);
    }, 100);
  };

  return (
    <div className="cursor-pointer flex items-center justify-center p-1" title="download timetable">
      <div onClick={handleClick} className="hover:text-white transition-colors">
        {status}
      </div>
      
      {/* Hidden container for rendering the React image blueprint off-screen */}
      <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        {timetable && (
          <div id="react-timetable-acadia">
            <TimetableImage 
              timetable={timetable} 
              section={user.section || section} 
              room={room} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getMostCommonRoom(data: any) {
  const roomCounts: Record<string, number> = {};

  Object.values(data || {}).forEach((day: any) => {
    Object.values(day || {}).forEach((slot: any) => {
      const room = slot.room;
      if (!room) return;
      roomCounts[room] = (roomCounts[room] || 0) + 1;
    });
  });

  let mostCommonRoom = "";
  let maxCount = 0;
  Object.entries(roomCounts).forEach(([r, count]) => {
    if (count > maxCount) {
      mostCommonRoom = r;
      maxCount = count;
    }
  });

  return mostCommonRoom;
}
