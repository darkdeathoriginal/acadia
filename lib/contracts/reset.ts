import { z } from "zod";

/* =======================
   REQUEST SCHEMAS
======================= */

export const ForgotPasswordReq = z.object({
  email: z.email(),
});

export const ForgotPasswordRes = z.object({
  identifier: z.string(),
  captcha: z.object({
    image: z.string(),
    digest: z.string(),
  }),
  token: z.string(),
  cookie: z.string(),
});

export const VerifyCaptchaReq = z.object({
  cookie: z.string(),
  cdigest: z.string(),
  email: z.email(),
  captcha: z.string().min(1),
  token: z.string(),
});

export const VerifyCaptchaRes = z.object({
  jwt: z.string(),
  e_email: z.string(),
});

export const SendOtpReq = z.object({
  cookie: z.string(),
  jwt: z.string(),
  e_email: z.string(),
  email: z.string(),
  identifier: z.string(),
});
export const SendOtpRes = z.object({
  success: z.literal(true),
});

export const VerifyOtpReq = z.object({
  cookie: z.string(),
  identifier: z.string(),
  jwt: z.string(),
  e_email: z.string(),
  otp: z.string().min(1),
});
export const VerifyOtpRes = z.object({
  success: z.literal(true),
});

export const changePasswordReq = z.object({
  cookie: z.string(),
  new_password: z.string().min(8),
  identifier: z.string(),
  jwt: z.string(),
});
export const changePasswordRes = z.object({
  success: z.literal(true),
});

export const GetCaptchaReq = z.object({
  cookie: z.string(),
});
export const GetCaptchaRes = z.object({
  image: z.string(),
  digest: z.string(),
});

/* =======================
   TYPE INFERENCE
======================= */

export type ForgotPasswordReqT = z.infer<typeof ForgotPasswordReq>;
export type ForgotPasswordResT = z.infer<typeof ForgotPasswordRes>;

export type VerifyCaptchaReqT = z.infer<typeof VerifyCaptchaReq>;
export type VerifyCaptchaResT = z.infer<typeof VerifyCaptchaRes>;

export type SendOtpReqT = z.infer<typeof SendOtpReq>;
export type SendOtpResT = z.infer<typeof SendOtpRes>;

export type VerifyOtpReqT = z.infer<typeof VerifyOtpReq>;
export type VerifyOtpResT = z.infer<typeof VerifyOtpRes>;

export type ChangePasswordReqT = z.infer<typeof changePasswordReq>;
export type ChangePasswordResT = z.infer<typeof changePasswordRes>;

export type GetCaptchaReqT = z.infer<typeof GetCaptchaReq>;
export type GetCaptchaResT = z.infer<typeof GetCaptchaRes>;
