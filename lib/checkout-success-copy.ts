export function getCheckoutSuccessCopy(input: {
  isTestMode: boolean;
  isDeliveryReady: boolean;
  payment: string;
}) {
  const payment = input.payment;
  const confirmed = payment === "Paid" || payment === "Partially Refunded";
  if (confirmed) {
    const paymentNote = payment === "Partially Refunded"
      ? "Part of your payment has been refunded."
      : input.isTestMode
        ? "Stripe test payment confirmed. This does not mean the eSIM is a test eSIM."
        : "Payment confirmed.";
    return {
      confirmed,
      title: payment === "Partially Refunded" ? "Your order was partially refunded" : "Your eSIM order is confirmed",
      label: payment === "Partially Refunded" ? "Partial refund" : "Order confirmed",
      statusMessage: `${paymentNote} ${input.isDeliveryReady ? "Your eSIM has been delivered. Check its current status in your account." : "Your eSIM delivery is still pending. Check your account for updates."}`,
      deliveryMessage: input.isDeliveryReady ? "eSIM delivered. Installation details are in your customer account." : "Delivery is not yet complete. If it remains pending, contact support; do not order again.",
    };
  }
  const state = payment === "Refunded"
    ? { title: "Your payment was refunded", label: "Refunded", message: "Your payment has been fully refunded. See your account for order details." }
    : payment === "Failed"
      ? { title: "Your payment was not completed", label: "Payment failed", message: "Payment has not been confirmed. Check your order before trying again." }
      : payment === "Expired"
        ? { title: "This checkout has expired", label: "Checkout expired", message: "This checkout session has expired. Check your account before starting another checkout." }
        : { title: "We are confirming your payment", label: "Awaiting confirmation", message: "We have not received payment confirmation yet. Refresh this page shortly or check your account. Please do not pay again while confirmation is pending." };
  return {
    confirmed,
    title: state.title,
    label: state.label,
    statusMessage: state.message,
    deliveryMessage: input.isDeliveryReady ? "An eSIM was delivered for this order. Check its current availability in your account." : "No completed eSIM delivery is recorded for this order.",
  };
}
