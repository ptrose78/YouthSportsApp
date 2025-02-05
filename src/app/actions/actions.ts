"use server";

import { saveEmailLog } from "@/app/lib/data";

interface EmailLog {
    recipients: string[];
    subject: string;
    message: string;
    sender: string;
    created_at: string;
  }

export async function sendEmail(formData: FormData) {
    const recipientsString = formData.get("emails") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
  
    const emailList = recipientsString.split(",").map(email => email.trim());
  
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        to: emailList.map(email => ({ email })),
        sender: { email: "paultrose1@gmail.com", name: "Coach" },
        subject,
        htmlContent: `<p>${message}</p>`,
      }),
    });
  
    if (!res.ok) {
      throw new Error("Failed to send email");
    }

  // Create an EmailLog object
  const emailLog: EmailLog = {
    recipients: emailList,
    subject,
    message,
    sender: "paultrose1@gmail.com",
    created_at: new Date().toISOString(),
  };

  // Log the sent email
  await saveEmailLog(emailLog);

  return { success: true, message: "Email sent successfully!" }; // Return success message
}
