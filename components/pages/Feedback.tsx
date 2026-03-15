"use client";

import DashboardLayout from "@/components/DashboardLayout";
import useFetchWithCache from "@/hooks/useFetchWithCache";
import { delCookie, fillFeedback } from "@/utils/helpers";
import cookie from "js-cookie";
import { AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";

const remarks = [
  { name: "Average", code: "2727643000027208373" },
  { name: "Excellent", code: "2727643000027208389" },
  { name: "Good", code: "2727643000027208377" },
  { name: "Poor", code: "2727643000027208369" },
  { name: "Very Good", code: "2727643000027208385" },
];

const useFetch = (url: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default function Feedback() {
  const { data: user } = useFetchWithCache(
    "/api/user",
    "cache_us",
    1000 * 60 * 60,
  );

  const { data, loading, error: fetchError } = useFetch("/api/feedback");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedRemark, setSelectedRemark] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = cookie.get("token") || "";
      const model = data?.data?.MODEL;
      const record = data?.data?.RECORD;

      if (!model || !record) {
        throw new Error("Missing required data for submission");
      }
      const feedbackData = fillFeedback(
        record,
        token,
        model,
        comment,
        selectedRemark,
      );

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ data: feedbackData }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      if (error.message === "Unauthorized") {
        setSubmitError("Oops! Your session has expired. Please login again.");
        setTimeout(() => {
          delCookie();
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname,
          )}`;
        }, 3000);
      } else {
        setSubmitError(
          "An error occurred while submitting feedback. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => (window.location.href = "/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <DashboardLayout user={user} activeTab="Course Feedback">
      <div className="px-6 md:px-10 pb-20 pt-2 lg:pt-0 max-w-5xl w-full mx-auto md:mx-0">
        {/* Header Card */}
        <div className="mb-6 border border-white/5 rounded-2xl bg-[#0d0d12] overflow-hidden shadow-lg">
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-gray-300 w-5 h-5" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Course Feedback Auto-Completer
              </h2>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-400 text-sm">
              Automatically fills out your academia{" "}
              <a
                href="https://academia.srmist.edu.in/#Course_Feedback"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-400 hover:text-blue-300 transition-colors"
              >
                Course Feedback
              </a>{" "}
              for all subjects at once.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {(fetchError || submitError) && (
          <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 text-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div>
              <h2 className="text-sm font-semibold mb-0.5 text-red-400">
                Error
              </h2>
              <p className="text-xs text-red-300/80">
                {fetchError || submitError}
              </p>
            </div>
          </div>
        )}

        {(data?.isCompleted || submitted) && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-500" />
            <div>
              <h2 className="text-sm font-semibold mb-0.5 text-green-500">
                Success
              </h2>
              <p className="text-xs text-green-300/80">
                {submitted
                  ? "Feedback submitted successfully. Redirecting..."
                  : "Feedback already submitted."}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64 border border-white/5 rounded-2xl bg-[#0d0d12] shadow-lg">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin"></div>
          </div>
        )}

        {/* Form */}
        {!loading && !fetchError && !data?.isCompleted && !submitted && (
          <div className="border border-white/5 rounded-2xl bg-[#0d0d12] p-6 lg:p-8 flex flex-col shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Remark Selection
                </label>
                <select
                  value={selectedRemark}
                  onChange={(e) => setSelectedRemark(e.target.value)}
                  disabled={submitting}
                  className="block w-full rounded-xl bg-[#14141a] border border-white/10 text-white min-h-[44px] px-4 py-2 focus:border-white/20 focus:outline-none transition-colors"
                >
                  <option value="">Random (Different for each)</option>
                  {remarks.map((remark) => (
                    <option key={remark.code} value={remark.code}>
                      {remark.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave as Random if you don&apos;t mind the remarks.
                </p>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Your Comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  className="block w-full rounded-xl bg-[#14141a] border border-white/10 text-white placeholder-gray-500 min-h-[100px] px-4 py-3 focus:border-white/20 focus:outline-none transition-colors resize-y"
                  placeholder="Enter your generic feedback here (e.g. 'Good teaching', 'Classes are nice')"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full px-4 py-3 mt-4 text-white font-semibold rounded-xl flex justify-center items-center transition-all ${
                  submitting
                    ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                    : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-500/30 border-t-gray-500 animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
