import {
  BarChart3,
  Binary,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Background Gradients (Removed for professional look) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16 md:mb-24 animate-fade-in">
          <div className="text-2xl font-bold text-white tracking-tighter">
            Acadia
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-medium text-sm"
            >
              Login
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-24 md:mb-32 space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 hover:bg-white/10 transition-colors cursor-default">
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              New Semester, New Goals
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white pb-4">
            Your Academic Life, <br />
            <span className="text-blue-500">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for SRMIST students. Track attendance,
            calculate CGPA, and manage your schedule effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-300"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200"
          style={{ animationDelay: "200ms" }}
        >
          <FeatureCard
            icon={<CheckCircle2 className="w-8 h-8 text-green-400" />}
            title="Attendance Tracker"
            desc="Real-time monitoring with smart visual indicators for your attendance percentage."
            href="/attendance"
            delay="0ms"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-blue-400" />}
            title="Smart Timetable"
            desc="Your daily class schedule, automatically organized and strictly followed."
            href="/timetable"
            delay="100ms"
          />
          <FeatureCard
            icon={<Binary className="w-8 h-8 text-purple-400" />}
            title="CGPA Calculator"
            desc="Plan your academic future by calculating and predicting your GPA outcomes."
            href="/cgpacalculator"
            delay="200ms"
          />
          <FeatureCard
            icon={<LayoutDashboard className="w-8 h-8 text-orange-400" />}
            title="Academic Planner"
            desc="Never miss a deadline. Keep track of assignments, exams, and personal tasks."
            href="/planner"
            delay="300ms"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-pink-400" />}
            title="Mark Analytics"
            desc="Visualize your performance across different subjects with detailed mark views."
            href="/mark"
            delay="400ms"
          />
          <FeatureCard
            icon={<ScrollText className="w-8 h-8 text-cyan-400" />}
            title="Easy Feedback"
            desc="Submit course feedback quickly and efficiently through our automated system."
            href="/feedback"
            delay="500ms"
          />
        </div>

        {/* Footer */}
        <footer
          className="mt-32 border-t border-white/10 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          <p>© {new Date().getFullYear()} Acadia. Student Project.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className="group block p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-slate-500/30 hover:bg-white/10 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1"
      style={{ animationDelay: delay }}
    >
      <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/10 group-hover:ring-slate-500/30">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-slate-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed text-sm font-medium">
        {desc}
      </p>
    </Link>
  );
}
