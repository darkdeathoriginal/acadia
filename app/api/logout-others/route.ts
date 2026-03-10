import { deleteOtherSessions } from "@/utils";

export async function POST(req, res) {
  const body = await req.json();
  const partialCookie = body.partialCookie;
  if (!partialCookie) {
    return new Response(
      JSON.stringify({ error: "partialCookie is required" }),
      { status: 400 },
    );
  }
  try {
    const token = await deleteOtherSessions(partialCookie);
    return new Response(
      JSON.stringify({ message: "Other sessions logged out", token }),
      { status: 200 },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e }), { status: 500 });
  }
}
