import { changePasswordReq, changePasswordRes } from "@/lib/contracts/reset";
import { changePassword } from "@/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = changePasswordReq.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const { cookie, jwt, identifier, new_password } = parsed.data;

  try {
    const data = await changePassword(cookie, new_password, identifier, jwt);

    const validated = changePasswordRes.parse(data);

    return new Response(JSON.stringify(validated), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
