"use client";

import Spinner from "@/components/spinner";
import cookie from "js-cookie";
import { Mail, Unlock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
export default function Login() {
  const userName = useRef("");
  const pass = useRef("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/attendance";

  const router = useRouter();
  const onSubmit = async () => {
    setErr("");
    try {
      setLoading(true);
      let data = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userName.current.trim(),
          pass: pass.current.trim(),
        }),
      }).then((data) => data.json());
      if (data.error) {
        setErr(data.error);
        return setTimeout(() => {
          setErr("");
        }, 3000);
      }
      cookie.set("token", data.token, { expires: 30 });
      router.push(redirect);
    } catch (error) {
      setErr("something went wrong");
      return setTimeout(() => {
        setErr("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = cookie.get("token");
    if (token) {
      // Use router instead of window.location for client-side navigation
      router.replace("/attendance");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center flex-col mt-28 text-white">
      <div className="bg-slate-800 rounded-md p-8">
        <div className="text-center text-gray-300 mb-6 text-lg">
          sign in with Academia credentials.
        </div>
        <form
          className="flex flex-col w-64"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {err && <p className="text-red-600">error: {err}</p>}
          <div className="flex items-center bg-gray-700 rounded shadow-sm mb-4">
            <Mail className="mx-2" />
            <input
              type="text"
              required={true}
              placeholder="Email or NetID"
              className="text-gray-300 bg-gray-700 w-full h-12 focus:outline-none rounded "
              onChange={(e) => (userName.current = e.target.value)}
            />
          </div>
          <div className="flex items-center bg-gray-700 rounded shadow-sm mb-4">
            <Unlock className="mx-2" />
            <input
              type="password"
              required={true}
              placeholder="password"
              className="text-gray-300 bg-gray-700 w-full h-12 focus:outline-none rounded "
              onChange={(e) => (pass.current = e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center ">
            <button className="bg-blue-700 py-1 px-4 w-auto rounded-lg drop-shadow-2xl hover:outline outline-blue-400">
              {loading ? (
                <Spinner text={""} classList="fill-white" />
              ) : (
                "submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
