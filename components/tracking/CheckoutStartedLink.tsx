"use client";

import { trackClientEvent } from "@/lib/track-client-event";

type CheckoutStartedLinkProps = {
  href: string;
  productId: string;
  className: string;
  children: React.ReactNode;
  metadata?: Record<string, unknown>;
};

export default function CheckoutStartedLink({
  href,
  productId,
  className,
  children,
  metadata,
}: CheckoutStartedLinkProps) {
  function handleClick() {
    trackClientEvent({
      eventType: "checkout_started",
      productId,
      metadata,
    });
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
