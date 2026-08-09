export function getCheckoutSuccessCopy(input: {
  isTestMode: boolean;
  isDeliveryReady: boolean;
}) {
  if (input.isTestMode) {
    return input.isDeliveryReady
      ? {
          statusMessage:
            "Your test payment was received and your test eSIM is ready.",
          deliveryMessage:
            "Stripe test payment and test eSIM delivery completed successfully.",
        }
      : {
          statusMessage:
            "Your payment was received in test mode. Your eSIM is now being prepared.",
          deliveryMessage:
            "Stripe test payment completed. Your eSIM delivery is being prepared.",
        };
  }

  return input.isDeliveryReady
    ? {
        statusMessage: "Your payment was received and your eSIM is ready.",
        deliveryMessage: "Payment and eSIM delivery completed successfully.",
      }
    : {
        statusMessage:
          "Your payment was received. Your eSIM is now being prepared.",
        deliveryMessage:
          "Payment completed. Your eSIM delivery is being prepared.",
      };
}
