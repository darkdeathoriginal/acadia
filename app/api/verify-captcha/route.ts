import { VerifyCaptchaReq, VerifyCaptchaRes } from "@/lib/contracts/reset";
import { verifyCaptcha } from "@/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = VerifyCaptchaReq.safeParse(body);
  if (!parsed.success) {
    console.error("Captcha verification failed:", parsed.error);

    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    });
  }

  const { cookie, cdigest, email, captcha, token } = parsed.data;

  try {
    const data = await verifyCaptcha(cookie, cdigest, captcha, token, email);

    const validated = VerifyCaptchaRes.parse(data);

    return new Response(JSON.stringify(validated), { status: 200 });
  } catch (e: any) {
    console.error(e);

    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
