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

    // Using exact app native colors
    const bgMain = "bg-[#0d0d12]";
    const borderSubtle = "border-white/5";
    const textMuted = "text-gray-400";
    const textHighlight = "text-white";

    return (
      <div 
        ref={ref} 
        style={{ width: "1920px", height: "1200px", fontFamily: 'Inter, system-ui, sans-serif' }} 
        className={`${bgMain} relative overflow-hidden flex-shrink-0 flex flex-col p-12`}
      >
        {/* Modern App Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-[54px] font-bold text-white tracking-tight leading-tight">Class Schedule</h1>
            <p className="text-[24px] text-gray-500 font-medium">Acadia • Official Timetable Export</p>
          </div>
          
          <div className="flex gap-6">
            <div className="flex flex-col items-end justify-center px-8 py-4 bg-[#181C25] rounded-2xl border border-white/5 shadow-md">
              <span className="text-[18px] text-gray-400 font-semibold mb-1 tracking-wider uppercase">Section</span>
              <span className="text-[36px] font-bold text-white leading-none">{section}</span>
            </div>
            <div className="flex flex-col items-end justify-center px-8 py-4 bg-[#181C25] rounded-2xl border border-white/5 shadow-md">
              <span className="text-[18px] text-gray-400 font-semibold mb-1 tracking-wider uppercase">Room</span>
              <span className="text-[36px] font-bold text-white leading-none">{room || "N/A"}</span>
            </div>
          </div>
        </div>
        
        {/* Timetable Grid */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Header Row (Times) */}
          <div className="flex gap-4 shrink-0">
            <div className="bg-transparent flex items-center justify-center" style={{ flex: `0 0 120px` }}></div>
            {activeTimes.map((t, i) => (
              <div key={i} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 ${borderSubtle} border`}>
                <span className="text-gray-300 font-bold text-[22px] leading-tight">{t.split(" - ")[0]}</span>
                <span className="text-gray-500 font-semibold text-[16px] leading-tight">{t.split(" - ")[1]}</span>
              </div>
            ))}
          </div>

          {/* Body Rows (Days) */}
          {[1, 2, 3, 4, 5].map((dayIdx) => {
            const dayData = timetable[String(dayIdx - 1)] || timetable[String(dayIdx)] || {};
            
            return (
              <div key={dayIdx} className="flex flex-1 gap-4 min-h-0">
                {/* Day Label */}
                <div 
                  className={`flex flex-col items-center justify-center rounded-2xl bg-[#121214] border border-white/5 shadow-sm`} 
                  style={{ flex: `0 0 120px` }}
                >
                  <span className="text-gray-500 font-bold text-[20px] tracking-widest uppercase mb-1">Day</span>
                  <span className="text-white font-black text-[42px] leading-none">{dayIdx}</span>
                </div>
                
                {/* Slots */}
                {activeTimes.map((t, i) => {
                  const slot = dayData[t];
                  const rawTitle = String(slot?.title || "").trim();
                  
                  const isEmpty = !rawTitle || rawTitle.toLowerCase() === "na" || rawTitle.toLowerCase() === "n/a" || rawTitle.toLowerCase() === "no class";
                  
                  if (isEmpty) {
                    return (
                      <div key={i} className="flex-1 rounded-2xl bg-[#0d0d12] border border-white/5 border-dashed flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-white/10" />
                      </div>
                    );
                  }

                  const rawType = String(slot?.type || "").toLowerCase();
                  const isLab = rawType.includes("lab") || rawType.includes("practical") || rawType.includes("p");
                  
                  // App exact colors for cells
                  // Generate an elegant vibrant color hash mapped from the class code or title to sprinkle life in the darkness
                  const colorMatchString = slot?.code || rawTitle;
                  const colors = [
                    { bg: "bg-[#1A233A]", text: "text-[#60A5FA]", border: "border-[#3B82F6]/30", badgeBg: "bg-[#3B82F6]/20", badgeText: "text-[#93A5F5]" },     // Blue
                    { bg: "bg-[#1E293B]", text: "text-[#818CF8]", border: "border-[#6366F1]/30", badgeBg: "bg-[#4F46E5]/20", badgeText: "text-[#A5B4FC]" },     // Indigo
                    { bg: "bg-[#291A3A]", text: "text-[#C084FC]", border: "border-[#A855F7]/30", badgeBg: "bg-[#9333EA]/20", badgeText: "text-[#D8B4FE]" },     // Purple
                    { bg: "bg-[#3A1838]", text: "text-[#F472B6]", border: "border-[#EC4899]/30", badgeBg: "bg-[#DB2777]/20", badgeText: "text-[#FBCFE8]" },     // Pink
                    { bg: "bg-[#183A2E]", text: "text-[#34D399]", border: "border-[#10B981]/30", badgeBg: "bg-[#059669]/20", badgeText: "text-[#6EE7B7]" },     // Emerald
                    { bg: "bg-[#332A1C]", text: "text-[#FBBF24]", border: "border-[#F59E0B]/30", badgeBg: "bg-[#D97706]/20", badgeText: "text-[#FCD34D]" },     // Amber
                  ];
                  
                  let colorIdx = 0;
                  for (let c = 0; c < colorMatchString.length; c++) {
                     colorIdx += colorMatchString.charCodeAt(c);
                  }
                  const themeColors = isLab 
                      ? { bg: "bg-[#2A1612]", text: "text-[#FB923C]", border: "border-[#F97316]/40", badgeBg: "bg-[#EA580C]/20", badgeText: "text-[#FDBA74]" } // Deep Orange for Labs
                      : colors[colorIdx % colors.length];

                  // Extract meaningful title length for grid
                  let displayTitle = rawTitle;
                  if (displayTitle.includes(":")) {
                    displayTitle = displayTitle.split(":")[0].trim();
                  }

                  return (
                    <div 
                      key={i} 
                      className={`flex-1 flex flex-col justify-between p-4 rounded-2xl border shadow-md transition-all ${themeColors.bg} ${themeColors.border}`} 
                    >
                      <div className="flex flex-col">
                        <span className={`text-[20px] font-bold leading-tight mb-2 line-clamp-3 ${themeColors.text}`}>{displayTitle}</span>
                        <span className="text-[15px] font-medium text-gray-300 truncate opacity-90">{slot?.code || ""}</span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                         <span className={`px-2 py-1 rounded text-[13px] font-bold uppercase tracking-wider ${themeColors.badgeBg} ${themeColors.badgeText}`}>
                            {isLab ? "LAB" : "THRY"}
                         </span>
                         <span className="text-[14px] text-gray-400 font-bold">{slot?.room ? slot.room.split('-')[0] : "NA"}</span>
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

export const exportAsImage = async (element: HTMLElement, filename: string) => {
  if (!element) return;
  try {
    const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 1 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Failed to export timetable image:", err);
  }
};
