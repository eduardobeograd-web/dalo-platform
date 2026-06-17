"use client";

import { useState } from "react";

type TestStatus =
  | "idle"
  | "sending"
  | "success"
  | "skipped"
  | "error";

function getReadableMessage(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;

    if (typeof objectValue.message === "string") {
      return objectValue.message;
    }

    if (typeof objectValue.name === "string") {
      return objectValue.name;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown error";
    }
  }

  return String(value);
}

export default function TestEmailButton() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSendTestEmail() {
    setStatus("sending");
    setMessage("Sending test request...");

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Test email sent successfully.");
        return;
      }

      if (data.skipped) {
        setStatus("skipped");
        setMessage(getReadableMessage(data.reason) || "Email sending skipped.");
        return;
      }

      setStatus("error");
      setMessage(getReadableMessage(data.error) || "Test email failed.");
    } catch (error) {
      console.error("Test email request failed:", error);
      setStatus("error");
      setMessage(getReadableMessage(error) || "Test email request failed.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
      <div className="text-sm font-black uppercase tracking-wide text-blue-600">
        Email Test
      </div>

      <h3 className="mt-1 text-xl font-black text-slate-950">
        Abandoned Checkout Email
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Sends the current abandoned checkout test template to the admin test
        email configured in .env.
      </p>

      <button
        type="button"
        onClick={handleSendTestEmail}
        disabled={status === "sending"}
        className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === "sending" ? "Sending..." : "Send test email"}
      </button>

      {message && (
        <div
          className={`mt-4 rounded-xl p-3 text-sm font-bold ${
            status === "success"
              ? "bg-green-50 text-green-700"
              : status === "skipped"
                ? "bg-yellow-50 text-yellow-700"
                : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-50 text-slate-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
