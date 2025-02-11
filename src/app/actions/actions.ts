"use server";

import { saveEmailLog, uploadFile } from "@/app/lib/data";

interface EmailLog {
  recipients: string[];
  subject: string;
  message: string;
  sender: string;
  created_at: string;
  attachment_url?: string;
}

// Handles email sending and integrates both attachment + storage
export async function sendEmail(formData: FormData) {
  const recipientsString = formData.get("emails") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const file = formData.get("attachment") as File | null;
  console.log("file", file);
  console.log("file.name", file?.name);

  const emailList = recipientsString.split(",").map(email => email.trim());

  let attachment_url = null;
  let attachments = [];


  if (file && file.name && file.name !== "undefined") {
    // Upload to Supabase for later access
    console.log("Inside if block"); // Debugging
    attachment_url = await uploadFile(file);

    // Convert to Base64 for direct email attachment
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");

    attachments.push({
      name: file.name,
      content: base64String,
    });
  }

  console.log("attachment_url", attachment_url);

  // Send email with attachments
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
      htmlContent: `
        <p>${message}</p>
        ${attachment_url ? `<p>Download attachment: <a href="${attachment_url}">${attachment_url}</a></p>` : ""}
      `,
      attachment: attachments.length > 0 ? attachments : undefined,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send email");
  }

  // Log email with attachment URL
  const emailLog: EmailLog = {
    recipients: emailList,
    subject,
    message,
    sender: "paultrose1@gmail.com",
    created_at: new Date().toISOString(),
    attachment_url: attachment_url,  
  };

  await saveEmailLog(emailLog);

  return { success: true, message: "Email sent successfully!" };
}
