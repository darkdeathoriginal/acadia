import { Clock, Menu, Moon, RefreshCw } from "lucide-react";

export default function TopBar({ user }: { user: any }) {
  return (
    <header className="flex justify-between md:justify-end items-center px-5 md:px-8 py-4 md:py-6 sticky top-0 bg-[#060608]/80 backdrop-blur-md z-30 border-b border-white/5 md:border-none">
      <div className="flex items-center gap-4 md:hidden">
        <div className="flex flex-col gap-[5px] justify-center items-start w-6 h-6 cursor-pointer">
          <div className="w-5 h-[2px] bg-white rounded-full"></div>
          <div className="w-5 h-[2px] bg-white rounded-full"></div>
        </div>
        <span className="text-[22px] font-bold text-white tracking-tight">PortalX</span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <Moon className="text-gray-400 hover:text-white w-[18px] h-[18px] transition-colors cursor-pointer" />
        <RefreshCw className="text-gray-400 hover:text-white w-[18px] h-[18px] transition-colors cursor-pointer md:hidden" />
        
        <div className="w-[1px] h-5 bg-white/10 md:hidden ml-[-4px] mr-[-4px]"></div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-900/30 bg-blue-900/10 text-blue-500 text-[11px] md:text-xs font-semibold tracking-wide">
          <Clock className="w-3.5 h-3.5" /> <span className="hidden md:inline">Trial: </span>3d left
        </div>
        
        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex justify-center items-center font-semibold text-sm cursor-pointer border border-[#333] text-gray-200">
          {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
        </div>
      </div>
    </header>
  );
}
