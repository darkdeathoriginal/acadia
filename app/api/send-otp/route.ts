import { SendOtpReq, SendOtpRes } from "@/lib/contracts/reset";
import { sendOtp } from "@/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = SendOtpReq.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const { cookie, jwt, e_email, email, identifier } = parsed.data;

  try {
    const data = await sendOtp(cookie, jwt, e_email, email, identifier);

    const validated = SendOtpRes.parse(data);

    return new Response(JSON.stringify(validated), { status: 200 });
  } catch (e: any) {
    console.error(e);

    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
