import { NextResponse } from "next/server";
import { saveUser } from "@/app/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, user_name, team_name } = body;

  if (!email || !user_name || !team_name) {
    return NextResponse.json({ error: "Missing required field: email or name" }, { status: 400 });
  }
  
  try {
    const result = await saveUser(email, user_name, team_name);
    return NextResponse.json({ message: "User added!", result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
