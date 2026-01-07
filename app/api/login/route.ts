import { getCookie } from "@/utils";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const body = await req.json();
  const email = body.email.match(/@/g)
    ? body.email
    : body.email + "@srmist.edu.in";
  const password = body.pass;
  try {
    const cookie = await getCookie(email, password);
    return NextResponse.json({ token: cookie });
  } catch (e) {
    return NextResponse.json({ error: e });
  }
}
