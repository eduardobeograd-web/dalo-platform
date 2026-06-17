"use client";

import { useRef } from "react";
import { trackClientEvent } from "@/lib/track-client-event";

type CheckoutEmailInputProps = {
  productId: string;
  productName: string;
  destination: string;
  price: number;
};

function isValidEmail(value: string) {
  return value.includes("@") && value.includes(".");
}

export default function CheckoutEmailInput({
  productId,
  productName,
  destination,
  price,
}: CheckoutEmailInputProps) {
  const lastTrackedEmailRef = useRef("");

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const email = event.target.value.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return;
    }

    if (lastTrackedEmailRef.current === email) {
      return;
    }

    lastTrackedEmailRef.current = email;

    trackClientEvent({
      eventType: "checkout_email_entered",
      productId,
      metadata: {
        source: "checkout_email_input",
        customerEmail: email,
        productName,
        destination,
        price,
      },
    });
  }

  return (
    <input
      name="email"
      type="email"
      required
      placeholder="you@example.com"
      onBlur={handleBlur}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
    />
  );
}
