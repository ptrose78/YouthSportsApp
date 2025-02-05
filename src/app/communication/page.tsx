// src/app/communication/page.tsx 

import { getEmailLogs } from "@/app/lib/data";
import EmailForm from "../components/EmailForm";

// Server Component
export default async function CommunicationPage() {
  const emailLogs = await getEmailLogs(); // Fetch logs on the server

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Team Communication</h1>

      {/* Email Form */}
      <EmailForm />

      {/* Email Log */}
      <h2 className="text-2xl font-semibold mt-8">Sent Emails</h2>
      <ul className="mt-4">
        {emailLogs.map((log, index) => (
          <li key={index} className="p-2 border-b">
            <strong>To:</strong> {log.recipients.join(", ")} <br />
            <strong>Message:</strong> {log.message} <br />
            <strong>Sent At:</strong> {new Date(log.created_at).toLocaleString()}
          </li>

        ))}

      </ul>
    </div>
  );
}
