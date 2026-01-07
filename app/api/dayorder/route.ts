import { getDo } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  try {
    const dayorder = await getDo(token);
    return NextResponse.json({ do: dayorder.split("").splice(0, 1).join("") });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
