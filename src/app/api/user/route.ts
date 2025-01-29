import { NextResponse } from "next/server";
import { saveUser } from "@/app/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body)
  const { email, team_name } = body;

  if (!email || !team_name) {
    return NextResponse.json({ error: "Missing required field: email or name" }, { status: 400 });
  }
  
  try {
    const result = await saveUser(email, team_name);
    return NextResponse.json({ message: "User added!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
