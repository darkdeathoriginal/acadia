import { GetCaptchaReq, GetCaptchaRes } from "@/lib/contracts/reset";
import { getCaptcha } from "@/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = GetCaptchaReq.safeParse(body);
  if (!parsed.success) {
    console.error("Captcha verification failed:", parsed.error);

    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    });
  }

  const { cookie } = parsed.data;

  try {
    const data = await getCaptcha(cookie);

    const validated = GetCaptchaRes.parse(data);

    return new Response(JSON.stringify(validated), { status: 200 });
  } catch (e: any) {
    console.error(e);

    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
