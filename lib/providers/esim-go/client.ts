import "server-only";

import {
  requireEsimGoCapability,
  type EsimGoCapability,
} from "./config";

export type EsimGoBundleAssignment = {
  id?: string;
  callTypeGroup?: string;
  initialQuantity?: number;
  remainingQuantity?: number;
  assignmentDateTime?: string;
  assignmentReference?: string;
  bundleState?: string;
  startTime?: string;
  endTime?: string;
  unlimited?: boolean;
};

export type EsimGoAppliedBundle = {
  name?: string;
  description?: string;
  assignments?: EsimGoBundleAssignment[];
};

export type EsimGoInstallDetails = {
  iccid?: string;
  matchingId?: string;
  smdpAddress?: string;
  profileStatus?: string;
  pin?: string;
  puk?: string;
  firstInstalledDateTime?: string | number;
  installUrl?: string;
  appleInstallUrl?: string;
  androidInstallUrl?: string;
};

export type EsimGoOrderItem = {
  type?: string;
  item?: string;
  quantity?: number;
  subTotal?: number;
  pricePerUnit?: number;
  AllowReassign?: boolean;
  iccids?: string[];
  esims?: EsimGoInstallDetails[];
};

export type EsimGoOrderResponse = {
  order?: EsimGoOrderItem[];
  total?: number;
  valid?: boolean;
  currency?: string;
  status?: string;
  statusMessage?: string;
  orderReference?: string;
  createdDate?: string;
  assigned?: boolean;
  runningBalance?: string;
};

export class EsimGoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfterSeconds: number | null,
  ) {
    super(message);
    this.name = "EsimGoApiError";
  }
}

async function requestJson<T>(input: {
  capability: EsimGoCapability;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
}): Promise<T> {
  const { apiKey, baseUrl } = requireEsimGoCapability(input.capability);
  const response = await fetch(`${baseUrl}${input.path}`, {
    method: input.method || "GET",
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
      ...(input.body ? { "Content-Type": "application/json" } : {}),
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(input.timeoutMs || 15_000),
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: "Provider returned a non-JSON response." };
    }
  }

  if (!response.ok) {
    const providerMessage =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message || "")
        : "";
    const retryAfter = Number(response.headers.get("retry-after"));

    throw new EsimGoApiError(
      providerMessage || `eSIM Go request failed with status ${response.status}.`,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : null,
    );
  }

  return payload as T;
}

function encodePath(value: string) {
  return encodeURIComponent(value.trim());
}

function orderBody(input: { bundleName: string; iccid?: string | null }) {
  const iccid = input.iccid?.trim() || null;

  return {
    assign: true,
    order: [
      {
        type: "bundle",
        quantity: 1,
        item: input.bundleName.trim(),
        ...(iccid ? { iccids: [iccid] } : {}),
        // DALO must never silently install a second eSIM during a top-up.
        allowReassign: false,
      },
    ],
  };
}

export async function getEsimGoCatalogue(input?: {
  page?: number;
  perPage?: number;
  country?: string;
  group?: string;
}) {
  const params = new URLSearchParams();
  if (input?.page) params.set("page", String(input.page));
  if (input?.perPage) params.set("perPage", String(input.perPage));
  if (input?.country) params.set("country", input.country.trim().toUpperCase());
  if (input?.group) params.set("group", input.group.trim());

  return requestJson<Record<string, unknown>>({
    capability: "read",
    path: `/catalogue${params.size ? `?${params.toString()}` : ""}`,
  });
}

export async function getEsimGoNetworks() {
  return requestJson<{
    countryNetworks?: Array<{
      name?: unknown;
      networks?: unknown;
    }>;
  }>({
    capability: "read",
    path: "/networks?returnAll=true",
  });
}

export async function checkEsimGoCompatibility(
  iccid: string,
  bundleName: string,
) {
  return requestJson<{ compatible: boolean }>({
    capability: "read",
    path: `/esims/${encodePath(iccid)}/compatible/${encodePath(bundleName)}`,
  });
}

export async function listEsimGoBundles(iccid: string, includeUsed = true) {
  const params = new URLSearchParams({
    includeUsed: String(includeUsed),
    limit: "200",
  });

  return requestJson<{ bundles?: EsimGoAppliedBundle[] }>({
    capability: "read",
    path: `/esims/${encodePath(iccid)}/bundles?${params.toString()}`,
  });
}

export async function getEsimGoBundleStatus(
  iccid: string,
  bundleName: string,
) {
  return requestJson<{ assignments?: EsimGoBundleAssignment[] }>({
    capability: "read",
    path: `/esims/${encodePath(iccid)}/bundles/${encodePath(bundleName)}`,
  });
}

export async function getEsimGoInstallDetails(reference: string) {
  const params = new URLSearchParams({
    reference: reference.trim(),
    additionalFields: "installUrl",
  });

  return requestJson<EsimGoInstallDetails | EsimGoInstallDetails[]>({
    capability: "read",
    path: `/esims/assignments?${params.toString()}`,
  });
}

export async function validateEsimGoOrder(input: {
  bundleName: string;
  iccid?: string | null;
}) {
  return requestJson<EsimGoOrderResponse>({
    capability: "validate",
    path: "/orders",
    method: "POST",
    body: {
      type: "validate",
      ...orderBody(input),
    },
  });
}

export async function createEsimGoTransaction(input: {
  bundleName: string;
  iccid?: string | null;
}) {
  return requestJson<EsimGoOrderResponse>({
    capability: "transaction",
    path: "/orders",
    method: "POST",
    body: {
      type: "transaction",
      ...orderBody(input),
    },
    // A timed-out transaction is deliberately not retried automatically.
    timeoutMs: 30_000,
  });
}
