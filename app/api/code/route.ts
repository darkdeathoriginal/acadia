import { getCodes } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const data = await getCodes(token);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
