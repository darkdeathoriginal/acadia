import { Activity, ArrowRight, Calendar, FileText, Moon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b19] font-sans relative overflow-hidden text-white">
      {/* Background Grid & Gradient */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      <div className="absolute top-0 inset-x-0 h-96 bg-blue-500/10 blur-[100px] z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-24 md:mb-32">
          <div className="text-2xl font-bold flex items-center gap-1 tracking-tight pr-8">
            Acadia
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              What&apos;s New
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <button className="text-gray-400 hover:text-white transition-colors p-2 hidden sm:block">
              <Moon size={20} />
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-semibold text-sm flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-32 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-300">
              Acadia 2.0 is Here
            </span>
            <ArrowRight size={14} className="text-gray-400" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white pb-6 max-w-4xl leading-tight">
            Access Your SRM <br />
            <span className="text-blue-500">Academic Portal</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Get instant access to your attendance, marks, timetable, and more. A
            beautiful, fast, and reliable way to stay on top of your academic
            journey at SRM Institute.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              href="#learn-more"
              className="px-8 py-3.5 bg-[#141416] border border-white/10 text-white rounded-xl font-semibold hover:bg-white/5 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div
          id="learn-more"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24"
          style={{ animationDelay: "200ms" }}
        >
          <div className="space-y-6 flex flex-col">
            <div className="p-8 md:p-12 rounded-3xl bg-[#0a0a0a] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-inset ring-gradient-to-br from-blue-500/30 to-red-500/30 rounded-3xl"></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight z-10 relative mt-8 mb-4">
                Powerful Tools. <br />
                <span className="text-blue-500">Zero Complexity.</span>
              </h2>
            </div>

            <div className="p-8 md:p-12 rounded-3xl bg-[#0a0a0a] border border-white/5 flex-grow">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                <span className="text-blue-400">Better Timetable</span>
                <br />
                Export, share, never miss a class
              </h3>
              <p className="text-gray-400 mb-8 max-w-sm text-sm md:text-base">
                Beautiful timetables that adapt to day orders automatically.
                Export as PNG or PDF in dark or light mode. Holiday detection
                built-in.
              </p>

              {/* Mock UI component */}
              <div className="border border-white/10 rounded-xl bg-[#0f0f0f] p-4 text-xs shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-300">
                    Today&apos;s Schedule
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded-md text-gray-400 border border-white/5">
                    Day Order 3
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-blue-100">
                        Compiler Design
                      </p>
                      <p className="text-blue-400/80">08:00 AM - 09:40 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-300">
                        Computer Networks
                      </p>
                      <p className="text-gray-500">09:50 AM - 11:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-[#06080d] border border-white/5 flex flex-col h-full relative overflow-hidden">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 z-10">
              <span className="text-blue-400">Works Offline</span>
              <br />
              Your data, always available
            </h3>
            <p className="text-gray-400 max-w-md z-10 mb-12 text-sm md:text-base">
              Full offline support with intelligent caching. Access attendance,
              marks, and timetable even without internet. Auto-syncs when
              you&apos;re back online.
            </p>

            <div className="mt-auto border border-white/10 rounded-2xl bg-[#0a0a0a] p-6 text-sm z-10 shadow-2xl relative">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-500/10 to-transparent opacity-30 blur-md rounded-2xl pointer-events-none"></div>

              <div className="relative">
                <div className="flex justify-between items-center mb-6 pt-2 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mb-0.5"></div>
                    <span className="font-semibold text-white text-base">
                      You&apos;re Offline
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-[#2a1708] border border-orange-500/30 text-orange-400 rounded-full text-xs font-semibold">
                    Cached Data
                  </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#111] border border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex items-center gap-4 text-gray-300">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-[15px]">
                        Attendance
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      Last synced 2h ago
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#111] border border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex items-center gap-4 text-gray-300">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-[15px]">Marks</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      Last synced 2h ago
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#111] border border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex items-center gap-4 text-gray-300">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-[15px]">Timetable</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      Last synced 2h ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-12 border-t border-white/10 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm"
          style={{ animationDelay: "400ms" }}
        >
          <p>© {new Date().getFullYear()} Acadia. Student Project.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
