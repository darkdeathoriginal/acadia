import { getAttendance } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  try {
    const data = await getAttendance(token);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e });
  }
}
