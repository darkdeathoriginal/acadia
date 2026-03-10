import { resetPassword } from "@/utils";

export async function POST(req, res) {
  const body = await req.json();
  const combinedToken = body.combinedToken;
  const href = body.href;
  const newPassword = body.newPassword;
  if (!combinedToken) {
    return new Response(
      JSON.stringify({ error: "combinedToken is required" }),
      { status: 400 },
    );
  }
  if (!newPassword) {
    return new Response(JSON.stringify({ error: "newPassword is required" }), {
      status: 400,
    });
  }
  if (!href) {
    return new Response(JSON.stringify({ error: "href is required" }), {
      status: 400,
    });
  }
  try {
    await resetPassword(combinedToken, newPassword, href);
    return new Response(
      JSON.stringify({ message: "Other sessions logged out", token: "" }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
