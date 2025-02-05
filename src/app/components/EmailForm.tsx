// src/app/communication/EmailForm.tsx
"use client";

import { useState } from "react";
import { sendEmail } from "@/app/actions/actions"; 

const EmailForm = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await sendEmail(formData);
      if (response?.success) {
        setSuccessMessage(response.message); 
        form.reset(); 
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccessMessage("Failed to send email. Please try again.");
    }
  };

  return (
    <div>
      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-lg">
        <input
          type="text"
          name="emails"
          placeholder="Enter parent emails (comma-separated)"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="subject"
          placeholder="Enter subject"
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="message"
          placeholder="Enter message"
          required
          className="w-full p-2 border rounded"
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Send Email
        </button>
      </form>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default EmailForm;
