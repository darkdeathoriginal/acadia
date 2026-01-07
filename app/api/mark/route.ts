import { getMarks } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (token) {
    try {
      const data = await getMarks(token);
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(error);
    }
  }
  return NextResponse.json({ error: "Invalid cookie" });
}
