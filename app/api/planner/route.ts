import { getPlanner } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(params) {
  const { searchParams } = params.nextUrl;
  const code = await searchParams.get("code");

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const data = await getPlanner(token, code);
  return NextResponse.json(data);
}
