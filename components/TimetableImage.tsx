import React, { forwardRef } from "react";
import * as htmlToImage from "html-to-image";

const timing = [
  "08:00 - 08:50",
  "08:50 - 09:40",
  "09:45 - 10:35",
  "10:40 - 11:30",
  "11:35 - 12:25",
  "12:30 - 01:20",
  "01:25 - 02:15",
  "02:20 - 03:10",
  "03:10 - 04:00",
  "04:00 - 04:50",
  "04:50 - 05:30",
  "05:30 - 06:10",
];

function checkTimetable(data: any) {
  let hasAbove450 = false;
  let hasAbove530 = false;
  Object.values(data || {}).forEach((day: any) => {
    Object.keys(day || {}).forEach((slot: string) => {
      const endTime = slot.split(" - ")[1];
      if (endTime === "05:30") hasAbove450 = true;
      if (endTime === "06:10") hasAbove530 = true;
    });
  });
  if (hasAbove530) return 12;
  else if (hasAbove450) return 11;
  else return 10;
}

export interface TimetableImageProps {
  timetable: any;
  section: string;
  room: string;
}

const TimetableImage = forwardRef<HTMLDivElement, TimetableImageProps>(
  ({ timetable, section, room }, ref) => {
    const timeSlotsCount = checkTimetable(timetable);
    const activeTimes = timing.slice(0, timeSlotsCount);

    // Exact Nano Banana colors
    const bgBase = "bg-[#141416]";
    const bgCard = "bg-[#1C1C21]";
    const bgTag = "bg-[#2A2A2F]";
    const borderCard = "border-[#2A2A2F]";
    
    return (
      <div 
        ref={ref} 
        style={{ width: "1920px", height: "1200px", fontFamily: 'Inter, system-ui, sans-serif' }} 
        className={`${bgBase} relative overflow-hidden flex-shrink-0 flex flex-col p-14`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-4 shrink-0 px-2 border-b border-[#2A2A2F]">
          <div className="flex flex-col">
            <h1 className="text-[52px] font-black text-white tracking-tight leading-tight mb-1">Class Schedule</h1>
            <p className="text-[22px] text-gray-500 font-medium">Acadia • Official Timetable Export</p>
          </div>
          
          <div className="flex gap-6">
            <div className="flex flex-col items-end justify-center px-10 py-5 bg-[#1C1C21] rounded-2xl border border-[#2A2A2F] shadow-sm">
              <span className="text-[14px] text-gray-500 font-bold mb-1 tracking-widest uppercase">SECTION</span>
              <span className="text-[38px] font-black text-white leading-none tracking-tight">{section}</span>
            </div>
            <div className="flex flex-col items-end justify-center px-10 py-5 bg-[#1C1C21] rounded-2xl border border-[#2A2A2F] shadow-sm">
              <span className="text-[14px] text-gray-500 font-bold mb-1 tracking-widest uppercase">ROOM</span>
              <span className="text-[38px] font-black text-white leading-none tracking-tight">{room || "N/A"}</span>
            </div>
          </div>
        </div>
        
        {/* Core Grid Container */}
        <div className="flex-1 flex flex-col gap-[14px] min-h-0 pl-2">
          {/* Times Header */}
          <div className="grid gap-[14px] shrink-0" style={{ gridTemplateColumns: `110px repeat(${activeTimes.length}, minmax(0, 1fr))` }}>
            <div className="bg-transparent" style={{ width: `110px` }}></div>
            {activeTimes.map((t, i) => (
              <div key={i} className={`flex flex-col items-start justify-center p-3 px-5 rounded-2xl ${bgCard} border ${borderCard}`}>
                <span className="text-white font-bold text-[18px] leading-tight mb-1 tracking-wide">{t.split(" - ")[0]}</span>
                <span className="text-gray-500 font-semibold text-[13px] leading-tight">{t.split(" - ")[1]}</span>
              </div>
            ))}
          </div>

          {/* Days */}
          {[1, 2, 3, 4, 5].map((dayIdx) => {
            const dayData = timetable[String(dayIdx - 1)] || timetable[String(dayIdx)] || {};
            
            return (
              <div key={dayIdx} className="grid gap-[14px] min-h-0" style={{ gridTemplateColumns: `110px repeat(${activeTimes.length}, minmax(0, 1fr))` }}>
                {/* Day Side Card */}
                <div 
                  className={`flex flex-col items-center justify-center rounded-2xl ${bgCard} border ${borderCard}`} 
                  style={{ width: `110px` }}
                >
                  <span className="text-gray-500 font-bold text-[15px] tracking-[0.2em] uppercase mb-1">DAY</span>
                  <span className="text-white font-black text-[42px] leading-none">{dayIdx}</span>
                </div>
                
                {/* Slots */}
                {activeTimes.map((t, i) => {
                  const slot = dayData[t];
                  const rawTitle = String(slot?.title || "").trim();
                  const isEmpty = !rawTitle || rawTitle.toLowerCase() === "na" || rawTitle.toLowerCase() === "n/a" || rawTitle.toLowerCase() === "no class" || rawTitle === "-";
                  
                  if (isEmpty) {
                    return (
                      <div key={i} className="rounded-2xl border border-[#2A2A2F] border-dashed flex items-center justify-center bg-transparent min-w-0 min-h-0">
                         <div className="w-[6px] h-[6px] rounded-full bg-gray-700/50" />
                      </div>
                    );
                  }

                  const rawType = String(slot?.type || "").toLowerCase();
                  const isLab = rawType.includes("lab") || rawType.includes("practical") || rawType.includes("p");
                  
                  // Unified text coloring to avoid visual clutter
                  const titleColor = "text-white";
                  const tagColor = isLab ? "text-[#F97316]" : "text-[#3B82F6]";
                  
                  let displayTitle = rawTitle;
                  if (displayTitle.includes(":")) {
                    displayTitle = displayTitle.split(":")[0].trim();
                  }

                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col justify-between pt-5 pb-4 px-5 rounded-2xl border ${borderCard} ${bgCard} min-w-0 min-h-0`} 
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[19px] font-bold leading-[1.2] mb-[6px] line-clamp-3 break-words ${titleColor}`}>{displayTitle}</span>
                        <span className="text-[13px] font-semibold text-gray-400 opacity-80 truncate">{slot?.code || ""}</span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-1 min-w-0">
                         <span className={`px-[10px] py-[3px] shrink-0 rounded-md text-[11px] font-bold uppercase tracking-widest ${bgTag} ${tagColor}`}>
                            {isLab ? "LAB" : "THRY"}
                         </span>
                         <span className="text-[13px] text-gray-400 font-bold truncate ml-2">{slot?.room ? slot.room.split('-')[0] : "NA"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

TimetableImage.displayName = "TimetableImage";
export default TimetableImage;

export const exportAsImage = async (element: HTMLElement, filename: string): Promise<boolean> => {
  if (!element) return false;
  try {
    const dataUrl = await htmlToImage.toPng(element, { 
      quality: 1.0, 
      pixelRatio: 2, // High resolution
      skipFonts: true
    });
    
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error("Failed to export timetable image:", err);
    return false;
  }
};
