"use client";

import React, { useEffect, useState } from "react";
import cookie from "js-cookie";
import Header from "../Header";
import { fillFeedback, delCookie } from "@/utils/helpers";

const remarks = [
  { name: "Average", code: "2727643000027208373" },
  { name: "Excellent", code: "2727643000027208389" },
  { name: "Good", code: "2727643000027208377" },
  { name: "Poor", code: "2727643000027208369" },
  { name: "Very Good", code: "2727643000027208385" },
];

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result);
      } catch (err) {
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
  const { data, loading, error: fetchError } = useFetch("/api/feedback");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedRemark, setSelectedRemark] = useState("");
  const handleSubmit = async (e) => {
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
        selectedRemark
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
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.message === "Unauthorized") {
        setSubmitError("Oops! Your session has expired. Please login again.");
        setTimeout(() => {
          delCookie();
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;
        }, 3000);
      } else {
        setSubmitError(
          "An error occurred while submitting feedback. Please try again."
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
    <div className="min-h-screen text-gray-100">
      <Header title="📝Auto Feedback" />
      <div className="max-w-md mx-auto pt-8 px-4">
        {(fetchError || submitError) && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-100 rounded">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{fetchError || submitError}</p>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        )}

        {(data?.isCompleted || submitted) && (
          <div className="mb-4 p-4 bg-green-900 border border-green-700 text-green-100 rounded">
            <h2 className="text-lg font-semibold mb-2">Success</h2>
            <p>
              {submitted
                ? "Feedback submitted successfully. Redirecting..."
                : "Feedback already submitted."}
            </p>
          </div>
        )}

        {!loading && !fetchError && !data?.isCompleted && !submitted && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Feedback</h1>
            {/* description */}
            <p className="text-gray-400 mb-4">
              Automatic{" "}
              <a
                href="https://academia.srmist.edu.in/#Course_Feedback"
                target="_"
                className="underline text-blue-400 hover:text-blue-300"
              >
                Course Feedback
              </a>{" "}
              Completer.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Remark Selection
                </label>
                <select
                  value={selectedRemark}
                  onChange={(e) => setSelectedRemark(e.target.value)}
                  required={false}
                  disabled={submitting}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">Random</option>
                  {remarks.map((remark) => (
                    <option key={remark.code} value={remark.code}>
                      {remark.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Your Comment:
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  placeholder="Enter your feedback here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full px-4 py-2 text-white font-semibold rounded-lg ${
                  submitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
