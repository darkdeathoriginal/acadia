import { getTimetable, getUserDetails } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(params) {
  const { searchParams: param } = params.nextUrl;
  const join = param.get("join");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json({ error: "no token found" });
  }
  let hasChange = false;
  let batch: string = cookieStore.get("batch")?.value || "";
  let regno = cookieStore.get("regno")?.value || "";
  let section = cookieStore.get("section")?.value || "";
  if (!batch || !regno || !section) {
    hasChange = true;
    const batchData = await getUserDetails(token);
    batch = batchData.batch;
    regno = batchData.roll;
    section = batchData.section;
  }
  try {
    const data = await getTimetable(
      token,
      batch,
      !Boolean(join),
      regno,
      section
    );
    const headers = new Headers({ "Content-type": "application/json" });
    if (hasChange) {
      headers.append("Set-Cookie", `batch=${batch}`);
      headers.append("Set-Cookie", `regno=${regno}`);
      headers.append("Set-Cookie", `section=${section}`);
    }
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: headers,
    });
  } catch (e) {
    return NextResponse.json({ error: e });
  }
}
