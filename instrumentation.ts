import type { Instrumentation } from "next";

export function register() {
  if (process.env.NODE_ENV === "production") {
    console.log(
      JSON.stringify({
        event: "application_started",
        service: "dalo-platform",
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const message =
    error instanceof Error ? error.message : "Unknown server request error";
  const digest =
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined;

  console.error(
    JSON.stringify({
      event: "server_request_error",
      service: "dalo-platform",
      timestamp: new Date().toISOString(),
      message,
      digest,
      method: request.method,
      path: request.path.split("?")[0],
      router: context.routerKind,
      routeType: context.routeType,
    }),
  );
};
