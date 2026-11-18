import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("ng_session");
  cookieStore.delete("ng_token");

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("ng_session");
  response.cookies.delete("ng_token");

  return response;
}
