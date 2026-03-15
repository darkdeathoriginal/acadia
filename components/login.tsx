"use client";

import Spinner from "@/components/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import cookie from "js-cookie";
import { ArrowLeft, Eye, EyeOff, Lock, Moon, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(250, "Maximum 250 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function Login() {
  const userName = useRef("");
  const pass = useRef("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutRequired, setLogoutRequired] = useState(false);
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [partialCookie, setPartialCookie] = useState("");
  const [hrefData, setHrefData] = useState("");

  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/attendance";

  // Redirect if already logged in
  useEffect(() => {
    const token = cookie.get("token");
    if (token) router.replace(redirect);
  }, [router, redirect]);

  const handleResetPassword = async (data: any) => {
    setErr("");
    try {
      setLoading(true);
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          combinedToken: partialCookie,
          newPassword: data.password,
          href: hrefData,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      setPasswordResetRequired(false);
      setPasswordResetSuccess(true);
    } catch (e: any) {
      setErr(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIN ---------------- */

  const handleLogin = async () => {
    setErr("");
    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userName.current.trim(),
          pass: pass.current.trim(),
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.message === "LOGIN_BLOCKED") {
        setPartialCookie(data.token);
        setLogoutRequired(true);
        return;
      }

      if (data.message && data.message.match("password")) {
        setPasswordResetRequired(true);
        setPartialCookie(data.token);
        setHrefData(data.message);
        return;
      }

      cookie.set("token", data.token, { expires: 30 });
      router.push(redirect);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ------------- LOGOUT OTHERS ------------- */

  const handleLogoutOthers = async () => {
    setErr("");
    try {
      setLoading(true);

      const res = await fetch("/api/logout-others", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partialCookie }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      cookie.set("token", data.token, {
        expires: 30,
        domain: ".acadia.works",
        path: "/",
      });
      router.push(redirect);
    } catch (e: any) {
      setErr(e.message || "Failed to logout other sessions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#070b19] font-sans relative overflow-hidden text-white">
      {/* Background gradient effects */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      <div className="absolute top-0 inset-x-0 h-96 bg-blue-500/10 blur-[100px] z-0 pointer-events-none"></div>
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-blue-900/10 to-transparent z-0 pointer-events-none"></div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 md:px-10 py-5">
        <Link
          href="/"
          className="text-xl font-bold italic tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          Acadia
        </Link>
        <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
          <Moon size={18} />
        </button>
      </div>

      {/* Centered login card */}
      <div
        className="relative z-10 flex items-center justify-center px-4 pt-8 pb-16"
        style={{ minHeight: "calc(100vh - 70px)" }}
      >
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#0d1120]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/40">
            {logoutRequired ? (
              /* -------- LOGOUT REQUIRED UI -------- */
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Session Conflict
                  </h1>
                  <p className="text-gray-400 text-sm">
                    You are logged in on too many devices
                  </p>
                </div>
                <div className="space-y-5">
                  <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="text-yellow-400 text-sm font-semibold mb-1">
                      ⚠ Session Limit Reached
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      You are logged in on more than two devices. Logout from
                      other sessions to continue.
                    </p>
                  </div>

                  {err && (
                    <p className="text-red-400 text-sm text-center">{err}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      disabled={loading}
                      onClick={handleLogoutOthers}
                      className="flex-1 bg-white hover:bg-gray-200 text-[#070b19] py-3 rounded-xl active:scale-[0.98] transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Spinner text={""} classList="fill-black" />
                      ) : (
                        "Logout Others"
                      )}
                    </button>

                    <button
                      disabled={loading}
                      onClick={() => {
                        setLogoutRequired(false);
                        setErr("");
                      }}
                      className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : passwordResetSuccess ? (
              /* -------- PASSWORD RESET SUCCESS -------- */
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Password Updated
                  </h1>
                  <p className="text-gray-400 text-sm">
                    You can now sign in with your new password
                  </p>
                </div>
                <div className="space-y-5">
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="text-green-400 text-sm font-semibold mb-1">
                      ✅ Password Reset Successful
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Your password has been updated successfully.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setPasswordResetSuccess(false);
                      setErr("");
                    }}
                    className="w-full bg-white hover:bg-gray-200 text-[#070b19] py-3 rounded-xl active:scale-[0.98] transition-all text-sm font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            ) : passwordResetRequired ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-400 text-sm">
                    This account requires a password update
                  </p>
                </div>
                <ResetPasswordForm
                  handleResetPassword={handleResetPassword}
                  loading={loading}
                  err={err}
                />
              </>
            ) : (
              /* -------------- LOGIN UI -------------- */
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Sign in to access your academic information
                  </p>
                </div>

                <form
                  className="flex flex-col space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  {err && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                      {err}
                    </div>
                  )}

                  {/* Username input */}
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      disabled={loading}
                      required
                      placeholder="Enter your username"
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-white/[0.06] transition-all text-sm"
                      onChange={(e) => (userName.current = e.target.value)}
                    />
                  </div>

                  {/* Password input */}
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      disabled={loading}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-white/[0.06] transition-all text-sm"
                      onChange={(e) => (pass.current = e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Sign In button */}
                  <button
                    disabled={loading}
                    className="
                      w-full bg-white/[0.08] hover:bg-white/[0.12]
                      border border-white/[0.08]
                      text-white py-3.5 rounded-xl
                      active:scale-[0.98] transition-all duration-200
                      flex items-center justify-center
                      text-sm font-semibold
                      disabled:opacity-50 disabled:cursor-not-allowed
                      mt-2
                    "
                  >
                    {loading ? (
                      <Spinner text={""} classList="fill-white" />
                    ) : (
                      "Sign in"
                    )}
                  </button>

                  {/* Divider with brand name */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-white/[0.08]"></div>
                    <span className="text-[11px] text-gray-500 font-medium tracking-widest uppercase">
                      Acadia
                    </span>
                    <div className="flex-1 h-px bg-white/[0.08]"></div>
                  </div>

                  {/* Back to Home */}
                  <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium"
                  >
                    <ArrowLeft size={16} />
                    Back to Home
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordForm({
  handleResetPassword,
  loading,
  err,
}: {
  handleResetPassword: (data: FormData) => void;
  loading: boolean;
  err: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: FormData) => {
    handleResetPassword(data);
  };

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {err && <div className="text-red-400 text-sm text-center">{err}</div>}

        {/* Password */}
        <div className="space-y-1">
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-gray-300 transition-colors" />
            </div>
            <input
              disabled={loading}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-white/[0.06] transition-all text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-gray-300 transition-colors" />
            </div>
            <input
              disabled={loading}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-white/[0.06] transition-all text-sm"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs pl-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className="
            w-full bg-white/[0.08] hover:bg-white/[0.12]
            border border-white/[0.08]
            text-white py-3.5 rounded-xl
            active:scale-[0.98] transition-all duration-200
            flex items-center justify-center
            text-sm font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            mt-2
          "
        >
          {loading ? (
            <Spinner text={""} classList="fill-white" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
