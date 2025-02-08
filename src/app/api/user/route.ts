import { NextResponse } from "next/server";
import { saveUser } from "@/app/lib/data";
import { getUser } from "@/app/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body)
  const { email, team_name } = body;

  if (!email || !team_name) {
    return NextResponse.json({ error: "Missing required field: email or name", success: false, status: 400 });
  }
  
  try {
    const result = await saveUser(email, team_name);
    return NextResponse.json({ message: "User added!", result, success: true, status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message, success: false, status: 500 });
  }

}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter", success: false, status: 400 });
  }

  try {
    const existingUser = await getUser(email);
    
    const exists = existingUser && existingUser.length > 0; // Check if user exists

    return NextResponse.json({ exists }, { status: 200 }); // Return exists as boolean
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json({ error: (error as Error).message, success: false, status: 500 });
  }
}
