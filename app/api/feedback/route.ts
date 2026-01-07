import {
  getFeedbackCompletion,
  getFeedbackParams,
  submitFeedback,
} from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  let params;
  try {
    params = await getFeedbackParams(token);
  } catch (error) {
    return NextResponse.json({ isCompleted: true, data: {} });
  }
  const data = await getFeedbackCompletion(token, params);
  return NextResponse.json(data);
}
export async function POST(req, res) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const { data } = await req.json();
  try {
    const res = await submitFeedback(data, token);
    const data1 = res.data;

    if (
      data1.find((key) => Object.keys(key).find((key) => key.match("error")))
    ) {
      return NextResponse.json({ error: "error" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    if (error.response.data.match("INVALID_CSRF_TOKEN")) {
      return NextResponse.json({ error: "RELOGIN" }, { status: 401 });
    }
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
