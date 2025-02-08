import { NextResponse } from "next/server";
import { getEmailLogs } from "@/app/lib/data";

export async function GET(req: Request) {
    
  const emailLogs = await getEmailLogs();
  return NextResponse.json(emailLogs);
}
