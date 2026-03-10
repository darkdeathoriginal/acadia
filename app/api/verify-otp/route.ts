import { VerifyOtpReq, VerifyOtpRes } from "@/lib/contracts/reset";
import { verifyOtp } from "@/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = VerifyOtpReq.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const { cookie, jwt, e_email, identifier, otp } = parsed.data;

  try {
    const data = await verifyOtp(cookie, identifier, jwt, e_email, otp);

    const validated = VerifyOtpRes.parse(data);

    return new Response(JSON.stringify(validated), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
