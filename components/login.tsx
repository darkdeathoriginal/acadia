"use client";

import Spinner from "@/components/spinner";
import cookie from "js-cookie";
import { Mail, Unlock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  const handleResetPassword = async (data: FormData) => {
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

      if (data.message.match("password")) {
        setPasswordResetRequired(true);
        setPartialCookie(data.token);
        setHrefData(data.message);
        return;
      }

      cookie.set("token", data.token, {
        expires: 30,
        domain: ".acadia.works",
        path: "/",
      });
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
    <div className="flex justify-center mt-28 text-white">
      <div className="bg-slate-800 rounded-lg p-8 w-96 shadow-xl">
        {logoutRequired ? (
          /* -------- LOGOUT REQUIRED UI -------- */
          <div className="text-center space-y-4">
            <div className="text-yellow-400 text-xl font-semibold">
              ⚠ Session Limit Reached
            </div>

            <p className="text-gray-300">
              You are logged in on more than two devices.
              <br />
              Logout from other sessions to continue.
            </p>

            {err && <p className="text-red-500">{err}</p>}

            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={loading}
                onClick={handleLogoutOthers}
                className="bg-blue-700 px-4 py-2 rounded-lg hover:ring-2 hover:ring-blue-400 disabled:opacity-50"
              >
                {loading ? (
                  <Spinner text={""} classList="fill-white" />
                ) : (
                  "Logout others"
                )}
              </button>

              <button
                disabled={loading}
                onClick={() => {
                  setLogoutRequired(false);
                  setErr("");
                }}
                className="bg-gray-600 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : passwordResetSuccess ? (
          /* -------- PASSWORD RESET SUCCESS -------- */
          <div className="text-center space-y-4">
            <div className="text-green-400 text-xl font-semibold">
              ✅ Password Reset Successful
            </div>

            <p className="text-gray-300">
              Your password has been updated.
              <br />
              You can now sign in with your new password.
            </p>

            <button
              onClick={() => {
                setPasswordResetSuccess(false);
                setErr("");
              }}
              className="bg-blue-700 px-4 py-2 rounded-lg hover:ring-2 hover:ring-blue-400"
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
          <>
            <div className="text-center text-gray-300 mb-6 text-lg">
              Sign in with Academia credentials
            </div>

            <form
              className="flex flex-col space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              {err && <p className="text-red-500 text-sm">Error: {err}</p>}

              <div className="flex items-center bg-gray-700 rounded">
                <Mail className="mx-2 text-gray-400" />
                <input
                  disabled={loading}
                  required
                  placeholder="Email or NetID"
                  className="bg-gray-700 text-gray-200 w-full h-12 px-2 focus:outline-none rounded"
                  onChange={(e) => (userName.current = e.target.value)}
                />
              </div>

              <div className="flex items-center bg-gray-700 rounded">
                <Unlock className="mx-2 text-gray-400" />
                <input
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="bg-gray-700 text-gray-200 w-full h-12 px-2 focus:outline-none rounded"
                  onChange={(e) => (pass.current = e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="mx-2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Link
                href="/forgot-password"
                className="mr-2 text-sm text-blue-400"
              >
                Forgot?
              </Link>

              <button
                disabled={loading}
                className="
    bg-blue-700 py-2 rounded-lg
    hover:ring-2 hover:ring-blue-400
    disabled:opacity-50
    flex items-center justify-center
  "
              >
                {loading ? (
                  <Spinner text={""} classList="fill-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

type FormData = {
  password: string;
  confirmPassword: string;
};

function ResetPasswordForm({ handleResetPassword, loading, err }) {
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
    <div className="text-center space-y-4">
      <div className="text-yellow-400 text-xl font-semibold">
        ⚠ Password Reset Required
      </div>

      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {err && <p className="text-red-500 text-sm">Error: {err}</p>}

        {/* Password */}
        <div className="flex flex-col">
          <div className="flex items-center bg-gray-700 rounded">
            <Unlock className="mx-2 text-gray-400" />
            <input
              disabled={loading}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="bg-gray-700 text-gray-200 w-full h-12 px-2 focus:outline-none rounded"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="mx-2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <div className="flex items-center bg-gray-700 rounded">
            <Unlock className="mx-2 text-gray-400" />
            <input
              disabled={loading}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="bg-gray-700 text-gray-200 w-full h-12 px-2 focus:outline-none rounded"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="mx-2 text-gray-400 hover:text-white"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className="
            bg-blue-700 py-2 rounded-lg
            hover:ring-2 hover:ring-blue-400
            disabled:opacity-50
            flex items-center justify-center
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
