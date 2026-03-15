"use client";

import { delCookie } from "@/utils/helpers";
import { LogOut, Moon, RefreshCw, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function TopBar({
  user,
  onMenuToggle,
}: {
  user: any;
  onMenuToggle?: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <header className="flex justify-between md:justify-end items-center px-5 md:px-8 py-4 md:py-6 sticky top-0 bg-[#060608]/80 backdrop-blur-md z-30 border-b border-white/5 md:border-none">
      <div className="flex items-center gap-4 md:hidden">
        <button
          onClick={onMenuToggle}
          className="flex flex-col gap-[5px] justify-center items-start w-6 h-6 cursor-pointer"
        >
          <div className="w-5 h-[2px] bg-white rounded-full"></div>
          <div className="w-5 h-[2px] bg-white rounded-full"></div>
        </button>
        <span className="text-[22px] font-bold text-white tracking-tight">
          Acadia
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <Moon className="text-gray-400 hover:text-white w-[18px] h-[18px] transition-colors cursor-pointer" />
        <RefreshCw className="text-gray-400 hover:text-white w-[18px] h-[18px] transition-colors cursor-pointer md:hidden" />

        <div className="w-[1px] h-5 bg-white/10 md:hidden ml-[-4px] mr-[-4px]"></div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-8 h-8 rounded-full bg-[#1a1a1a] flex justify-center items-center font-semibold text-sm cursor-pointer border border-[#333] text-gray-200 hover:border-[#555] transition-colors focus:outline-none"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#131320]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
              style={{ animation: "fadeIn 0.15s ease-out" }}
            >
              {/* User Info */}
              <div className="px-5 pt-5 pb-4">
                <div className="text-[15px] font-semibold text-white leading-tight">
                  {user?.name || "Student"}
                </div>
                <div className="text-[13px] text-gray-400 mt-1 font-mono tracking-wide">
                  {user?.roll || ""}
                </div>
              </div>

              <div className="h-px bg-white/[0.06] mx-4"></div>

              {/* Menu Items */}
              <div className="py-2 px-2">
                <Link
                  href="/user"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <User size={16} className="text-gray-500" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    delCookie();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all w-full text-left"
                >
                  <LogOut size={16} className="text-red-500/70" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
