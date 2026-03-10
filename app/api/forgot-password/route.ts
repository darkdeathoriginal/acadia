import { forgotPassword } from "@/utils";

export async function POST(req, res) {
  const body = await req.json();
  const email = body.email;
  if (!email) {
    return new Response(JSON.stringify({ error: "email is required" }), {
      status: 400,
    });
  }
  try {
    const data = await forgotPassword(email);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
