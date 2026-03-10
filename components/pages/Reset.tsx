"use client";
import {
  ChangePasswordReqT,
  ForgotPasswordReqT,
  ForgotPasswordRes,
  ForgotPasswordResT,
  GetCaptchaReqT,
  GetCaptchaRes,
  GetCaptchaResT,
  SendOtpReqT,
  SendOtpRes,
  SendOtpResT,
  VerifyCaptchaReqT,
  VerifyCaptchaRes,
  VerifyCaptchaResT,
  VerifyOtpReqT,
  VerifyOtpRes,
  VerifyOtpResT,
} from "@/lib/contracts/reset";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Shield, Unlock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Spinner from "../spinner";

/* =======================
   STEP SCHEMAS
======================= */

const emailSchema = z.object({ email: z.string().email("Invalid email") });

const captchaSchema = z.object({
  captcha: z.string().min(1, "Captcha is required"),
});

const otpSchema = z.object({
  otp: z.string().min(1, "OTP is required"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/* =======================
   TYPES
======================= */

type State = "email" | "captcha" | "otp" | "reset" | "success";

const schemaByState: Record<State, z.ZodTypeAny> = {
  email: emailSchema,
  captcha: captchaSchema,
  otp: otpSchema,
  reset: resetSchema,
  success: z.object({}),
};

const titles: Record<State, string> = {
  email: "Enter your email",
  captcha: "Verify captcha",
  otp: "Enter OTP",
  reset: "Reset password",
  success: "Password updated",
};

/* =======================
   STABLE FIELD COMPONENT
======================= */

type FieldProps = {
  icon: any;
  type: string;
  name: string;
  placeholder: string;
  showToggle?: boolean;
  register: any;
  errors: any;
  loading: boolean;
};

function Field({
  icon: Icon,
  type,
  name,
  placeholder,
  showToggle = false,
  register,
  errors,
  loading,
}: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col">
      <div className="flex items-center bg-gray-700 rounded px-2">
        <Icon className="text-gray-400 mr-2" />

        <input
          disabled={loading}
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          className="bg-gray-700 text-gray-200 w-full h-12 px-2 focus:outline-none rounded"
          {...register(name)}
        />

        {showToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-xs text-gray-400 hover:text-gray-200 px-2"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {errors?.[name] && (
        <p className="text-red-400 text-xs mt-1">
          {String(errors[name]?.message)}
        </p>
      )}
    </div>
  );
}

/* =======================
   COMPONENT
======================= */

export default function Reset() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<State>("email");

  // Resend OTP state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Refresh captcha state
  const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);

  const identifierRef = useRef<string>("");
  const tokenRef = useRef<string>("");
  const cookieRef = useRef<string>("");
  const captchaRef = useRef<{ image: string; digest: string }>({
    image: "",
    digest: "",
  });
  const jwtRef = useRef<string>("");
  const e_emailRef = useRef<string>("");
  const emailRef = useRef<string>("");

  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(schemaByState[state]),
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  /* =======================
     RESEND COOLDOWN TIMER
  ======================= */

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const id = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [resendCooldown]);

  /* =======================
     API HELPERS
  ======================= */

  const sendOtp = async () => {
    const sendOtpReq: SendOtpReqT = {
      cookie: cookieRef.current,
      jwt: jwtRef.current,
      e_email: e_emailRef.current,
      email: emailRef.current,
      identifier: identifierRef.current,
    };

    await typedFetch<SendOtpReqT, SendOtpResT>(
      "/api/send-otp",
      sendOtpReq,
      SendOtpRes,
    );
  };

  const resendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setErr(null);
    setResending(true);

    try {
      await sendOtp();
      setResendCooldown(60);
    } catch (e: any) {
      setErr(e.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const refreshCaptcha = async () => {
    if (refreshingCaptcha) return;

    setErr(null);
    setRefreshingCaptcha(true);

    try {
      const req: GetCaptchaReqT = { cookie: cookieRef.current };

      const resp = await typedFetch<GetCaptchaReqT, GetCaptchaResT>(
        "/api/get-captcha",
        req,
        GetCaptchaRes,
      );

      captchaRef.current = resp;
    } catch (e: any) {
      setErr(e.message || "Failed to refresh captcha");
    } finally {
      setRefreshingCaptcha(false);
    }
  };

  /* =======================
     SUBMIT HANDLER
  ======================= */

  const onSubmit = async (data: any) => {
    setErr(null);
    setLoading(true);

    try {
      if (state === "email") {
        emailRef.current = data.email;

        const req: ForgotPasswordReqT = { email: data.email };

        const resp = await typedFetch<ForgotPasswordReqT, ForgotPasswordResT>(
          "/api/forgot-password",
          req,
          ForgotPasswordRes,
        );

        identifierRef.current = resp.identifier;
        captchaRef.current = resp.captcha;
        tokenRef.current = resp.token;
        cookieRef.current = resp.cookie;

        setState("captcha");
      }

      if (state === "captcha") {
        const req: VerifyCaptchaReqT = {
          cookie: cookieRef.current,
          cdigest: captchaRef.current.digest,
          email: emailRef.current,
          captcha: data.captcha,
          token: tokenRef.current,
        };

        try {
          const resp = await typedFetch<VerifyCaptchaReqT, VerifyCaptchaResT>(
            "/api/verify-captcha",
            req,
            VerifyCaptchaRes,
          );
          jwtRef.current = resp.jwt;
          e_emailRef.current = resp.e_email;
        } catch (err) {
          await refreshCaptcha();
          throw err;
        }

        await sendOtp();
        setResendCooldown(60);
        setState("otp");
      }

      if (state === "otp") {
        const req: VerifyOtpReqT = {
          cookie: cookieRef.current,
          identifier: identifierRef.current,
          jwt: jwtRef.current,
          e_email: e_emailRef.current,
          otp: data.otp,
        };

        await typedFetch<VerifyOtpReqT, VerifyOtpResT>(
          "/api/verify-otp",
          req,
          VerifyOtpRes,
        );

        setState("reset");
      }

      if (state === "reset") {
        const req: ChangePasswordReqT = {
          cookie: cookieRef.current,
          new_password: data.password,
          identifier: identifierRef.current,
          jwt: jwtRef.current,
        };

        await typedFetch<ChangePasswordReqT, { success: true }>(
          "/api/change-password",
          req,
          z.object({ success: z.literal(true) }),
        );

        setState("success");
      }
    } catch (e: any) {
      setErr(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="flex justify-center mt-28 text-white">
      <div className="bg-slate-800 rounded-2xl p-8 w-96 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">{titles[state]}</h2>
          <p className="text-sm text-gray-400">
            Follow the steps to recover your account
          </p>
        </div>

        {err && <p className="text-red-500 text-sm">Error: {err}</p>}

        {state !== "success" && (
          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {state === "email" && (
              <Field
                icon={Mail}
                type="email"
                name="email"
                placeholder="Email"
                register={register}
                errors={errors}
                loading={loading}
              />
            )}

            {state === "captcha" && (
              <>
                <div className="relative group overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-1 shadow-inner transition-all hover:border-slate-600">
                  {/* Captcha Container */}
                  <div className="flex h-24 w-full items-center justify-center bg-white/5 rounded-lg backdrop-blur-sm">
                    <Image
                      src={captchaRef.current.image}
                      alt="Security Captcha"
                      width={240}
                      height={80}
                      className={`max-h-full object-contain transition-opacity duration-300 ${
                        refreshingCaptcha ? "opacity-20" : "opacity-100"
                      }`}
                    />
                  </div>

                  {/* Action Overlay */}
                  <button
                    type="button"
                    disabled={refreshingCaptcha}
                    onClick={refreshCaptcha}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 text-yellow-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Refresh captcha"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-5 w-5 ${refreshingCaptcha ? "animate-spin" : ""}`}
                    >
                      <path d="M21 12a9 9 0 1 1-3-6.7" />
                      <polyline points="21 3 21 9 15 9" />
                    </svg>
                  </button>

                  {/* Loading State Overlay */}
                  {refreshingCaptcha && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 pointer-events-none">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-widest animate-pulse">
                        Updating...
                      </span>
                    </div>
                  )}
                </div>

                <Field
                  icon={Shield}
                  type="text"
                  name="captcha"
                  placeholder="Enter captcha"
                  register={register}
                  errors={errors}
                  loading={loading}
                />
              </>
            )}

            {state === "otp" && (
              <>
                <Field
                  icon={KeyRound}
                  type="text"
                  name="otp"
                  placeholder="6-digit OTP"
                  register={register}
                  errors={errors}
                  loading={loading}
                />

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Didn’t receive the OTP?</span>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resending}
                    onClick={resendOtp}
                    className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                  >
                    {resending
                      ? "Resending..."
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {state === "reset" && (
              <>
                <Field
                  icon={Unlock}
                  type="password"
                  name="password"
                  placeholder="New password"
                  showToggle
                  register={register}
                  errors={errors}
                  loading={loading}
                />

                <Field
                  icon={Unlock}
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  showToggle
                  register={register}
                  errors={errors}
                  loading={loading}
                />
              </>
            )}

            <button
              disabled={loading}
              className="bg-blue-700 py-2 rounded-lg hover:ring-2 hover:ring-blue-400 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Spinner text={""} classList="fill-white" />
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}

        {state === "success" && (
          <div className="text-center space-y-4">
            <p className="text-green-400">
              Your password has been reset successfully.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-green-700 py-2 px-4 rounded-lg hover:ring-2 hover:ring-green-400"
            >
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   TYPED FETCH
======================= */

async function typedFetch<Req, Res>(
  url: string,
  body: Req,
  resSchema: z.ZodType<Res>,
): Promise<Res> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new Error(json?.error || "Request failed");
  }

  return resSchema.parse(json);
}
