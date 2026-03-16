import { fetchWithCache, delCookie } from "@/utils/helpers";
import { generateTimetable } from "@/utils/timetable";
import { Download } from "lucide-react";
import React, { useState } from "react";
import Spinner from "./spinner";
import TimetableImage, { exportAsImage } from "./TimetableImage";

export default function DownloadTimetable({ timetable, section = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localUser, setLocalUser] = useState({ section: "" });
  const [room, setRoom] = useState("");

  const activeSection = section || localUser.section;

  const handleClick = async () => {
    if (isLoading) return; // Prevent overlapping clicks
    setIsLoading(true);
    
    // Fetch user section only if it's missing from BOTH the parent props and local state
    if (!activeSection) {
      await new Promise<void>((resolve) => {
        fetchWithCache(
          "/api/user",
          { cache: "no-store", next: { revalidate: 1 } },
          "cache_user",
          { setState: setLocalUser }
        )
        .then(() => resolve())
        .catch((error: any) => {
          if (error?.error === "Invalid cookie") {
            delCookie();
          }
          resolve();
        });
      });
    }
    
    const resolvedRoom = getMostCommonRoom(timetable);
    setRoom(resolvedRoom);
    
    // Allow React 300ms to fully build and layout the 1920x1200 grid DOM physically before serialization
    setTimeout(async () => {
      try {
        const targetEl = document.getElementById("react-timetable-acadia");
        if (targetEl) {
          // Safeguard: Ensure html-to-image never hangs indefinitely
          const success = await Promise.race([
            exportAsImage(targetEl, `acadia-timetable.png`),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 8000))
          ]);
          
          if (!success) {
            console.warn("React to Image export failed or timed out. Falling back to legacy Canvas method.");
            generateTimetable(timetable, activeSection || localUser.section, "v1", true, resolvedRoom);
          }
        } else {
          console.warn("DOM node for React Timetable missing. Falling back to legacy Canvas method.");
          generateTimetable(timetable, activeSection || localUser.section, "v1", true, resolvedRoom);
        }
      } catch (err) {
        console.error("Critical download error: ", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="cursor-pointer flex items-center justify-center p-1" title="download timetable">
      <div onClick={handleClick} className="hover:text-white transition-colors">
        {isLoading ? <Spinner text={""} /> : <Download className="w-5 h-5" />}
      </div>
      
      {/* Hidden container for rendering the React image blueprint off-screen */}
      <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        {timetable && (
          <div id="react-timetable-acadia">
            <TimetableImage 
              timetable={timetable} 
              section={activeSection} 
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
