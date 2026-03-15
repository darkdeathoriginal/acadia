"use client";

import Spinner from "@/components/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import cookie from "js-cookie";
import { Eye, EyeOff, Mail, Unlock } from "lucide-react";
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
    if (token) router.replace("/attendance");
  }, [router]);

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
        domain: ".example.com",
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Card Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Acadia</h1>
            <p className="text-zinc-400 text-sm">
              Welcome back to your dashboard
            </p>
          </div>

          {logoutRequired ? (
            /* -------- LOGOUT REQUIRED UI -------- */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-yellow-400 text-lg font-semibold mb-2">
                  ⚠ Session Limit Reached
                </div>
                <p className="text-zinc-300 text-sm">
                  You are logged in on more than two devices.
                  <br />
                  Logout from other sessions to continue.
                </p>
              </div>

              {err && <p className="text-red-400 text-sm">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={loading}
                  onClick={handleLogoutOthers}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg active:scale-95 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Spinner text={""} classList="fill-white" />
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
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : passwordResetSuccess ? (
            /* -------- PASSWORD RESET SUCCESS -------- */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-green-400 text-lg font-semibold mb-2">
                  ✅ Password Reset Successful
                </div>
                <p className="text-zinc-300 text-sm">
                  Your password has been updated.
                  <br />
                  You can now sign in with your new password.
                </p>
              </div>

              <button
                onClick={() => {
                  setPasswordResetSuccess(false);
                  setErr("");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg active:scale-95 transition-all text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          ) : passwordResetRequired ? (
            <ResetPasswordForm
              handleResetPassword={handleResetPassword}
              loading={loading}
              err={err}
            />
          ) : (
            /* -------------- LOGIN UI -------------- */
            <form
              className="flex flex-col space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="text-center text-zinc-400 mb-2 text-sm">
                Sign in with Academia credentials
              </div>

              {err && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {err}
                </div>
              )}

              <div className="space-y-4">
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    disabled={loading}
                    required
                    placeholder="Email or NetID"
                    className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    onChange={(e) => (userName.current = e.target.value)}
                  />
                </div>

                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Unlock className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    disabled={loading}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    onChange={(e) => (pass.current = e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                disabled={loading}
                className="
                  w-full bg-blue-600 hover:bg-blue-700
                  text-white py-2.5 rounded-lg 
                  active:scale-95 transition-all duration-200
                  flex items-center justify-center
                  text-sm font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <Spinner text={""} classList="fill-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-zinc-600 pb-4">
          © {new Date().getFullYear()} Acadia. Student Project.
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
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
        <div className="text-yellow-400 text-lg font-semibold mb-2">
          ⚠ Password Reset Required
        </div>
        <p className="text-zinc-300 text-xs">
          This account requires a password update.
        </p>
      </div>

      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {err && <div className="text-red-400 text-sm text-center">{err}</div>}

        {/* Password */}
        <div className="space-y-1">
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Unlock className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              disabled={loading}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="block w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Unlock className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              disabled={loading}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="block w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
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
            w-full bg-blue-600 hover:bg-blue-700
            text-white py-2.5 rounded-lg 
            active:scale-95 transition-all duration-200
            flex items-center justify-center
            text-sm font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
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
