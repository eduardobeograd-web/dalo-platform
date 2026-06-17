"use client";

import { useState } from "react";

type SendStatus = "idle" | "sending" | "success" | "error";

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

    if (typeof objectValue.error === "string") {
      return objectValue.error;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown error";
    }
  }

  return String(value);
}

export default function SendAbandonedCheckoutEmailButton({
  eventId,
}: {
  eventId: string;
}) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSend() {
    setStatus("sending");
    setMessage("Sending reminder...");

    try {
      const response = await fetch("/api/admin/abandoned-checkout-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Reminder sent.");
        return;
      }

      setStatus("error");
      setMessage(getReadableMessage(data.error) || "Reminder failed.");
    } catch (error) {
      console.error("Reminder request failed:", error);
      setStatus("error");
      setMessage(getReadableMessage(error) || "Reminder request failed.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSend}
        disabled={status === "sending" || status === "success"}
        className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === "sending"
          ? "Sending..."
          : status === "success"
            ? "Sent"
            : "Send reminder"}
      </button>

      {message && (
        <div
          className={`mt-2 max-w-[220px] rounded-lg p-2 text-xs font-bold ${
            status === "success"
              ? "bg-green-50 text-green-700"
              : status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-slate-50 text-slate-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
