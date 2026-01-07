"use client";

import Header from "@/components/Header";
import React, { useState } from "react";

export default function CgpaCalculator() {
  const [cgpa, setCgpa] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rows = Array.from(
      document.querySelectorAll<HTMLDivElement>(".gpa-row")
    );
    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach((row) => {
      const gradeSel = row.querySelector<HTMLSelectElement>(
        "select[name=grades]"
      )!;
      const creditSel = row.querySelector<HTMLSelectElement>(
        "select[name=credits]"
      )!;
      const grade = Number(gradeSel.value);
      const credit = Number(creditSel.value);
      if (grade && credit) {
        totalPoints += grade * credit;
        totalCredits += credit;
      }
    });

    setCgpa(totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00");
  };

  const handleClear = () => {
    document.querySelectorAll("select").forEach((sel) => (sel.value = "0"));
    setCgpa(null);
  };

  return (
    <>
      <Header title="CGPA Calculator" />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="mx-auto max-w-2xl px-4">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-6 space-y-4"
          >
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="gpa-row grid grid-cols-[auto_1fr_1fr] gap-2 items-center"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-18">
                  Course {idx + 1}
                </span>

                <select
                  name="grades"
                  required
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none px-3 py-2"
                >
                  <option value="0">Grade</option>
                  <option value="10">O</option>
                  <option value="9">A+</option>
                  <option value="8">A</option>
                  <option value="7">B+</option>
                  <option value="6">B</option>
                  <option value="5">C</option>
                  <option value="0">P / F</option>
                </select>

                <select
                  name="credits"
                  required
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none px-3 py-2"
                >
                  <option value="0">Credits</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition"
              >
                Clear
              </button>
            </div>
          </form>

          {cgpa && (
            <div className="mt-6 flex justify-center">
              <span className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-semibold">
                Your CGPA is {cgpa}
              </span>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
