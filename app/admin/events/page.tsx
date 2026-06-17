import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";
import TestEmailButton from "../../../components/admin/TestEmailButton";
import SendAbandonedCheckoutEmailButton from "../../../components/admin/SendAbandonedCheckoutEmailButton";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return "—";
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "Invalid metadata";
  }
}

function getMetadataValue(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function getMinutesSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / 1000 / 60));
}

const eventFilters = [
  { label: "All", value: "all", href: "/admin/events" },
  { label: "Search", value: "search", href: "/admin/events?type=search" },
  {
    label: "Product Views",
    value: "product_view",
    href: "/admin/events?type=product_view",
  },
  {
    label: "Checkout Started",
    value: "checkout_started",
    href: "/admin/events?type=checkout_started",
  },
  {
    label: "Email Entered",
    value: "checkout_email_entered",
    href: "/admin/events?type=checkout_email_entered",
  },
  {
    label: "Purchases",
    value: "purchase_completed",
    href: "/admin/events?type=purchase_completed",
  },
];

function getEventBadgeClass(eventType: string) {
  if (eventType === "purchase_completed") {
    return "bg-green-100 text-green-700";
  }

  if (eventType === "checkout_started") {
    return "bg-blue-100 text-blue-700";
  }

  if (eventType === "product_view") {
    return "bg-purple-100 text-purple-700";
  }

  if (eventType === "search") {
    return "bg-yellow-100 text-yellow-800";
  }

  if (eventType.includes("failed") || eventType.includes("expired")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    type?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedType = params.type || "all";
  const selectedFilter = eventFilters.some((filter) => filter.value === selectedType)
    ? selectedType
    : "all";

  const eventWhere =
    selectedFilter === "all"
      ? {}
      : {
          eventType: selectedFilter,
        };

  const events = await prisma.customerEvent.findMany({
    where: eventWhere,
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    include: {
      customer: true,
      order: true,
      product: true,
    },
  });

  const totalEvents = await prisma.customerEvent.count();

  const searchEvents = await prisma.customerEvent.count({
    where: {
      eventType: "search",
    },
  });

  const productViews = await prisma.customerEvent.count({
    where: {
      eventType: "product_view",
    },
  });

  const checkoutStarts = await prisma.customerEvent.count({
    where: {
      eventType: "checkout_started",
    },
  });

  const purchases = await prisma.customerEvent.count({
    where: {
      eventType: "purchase_completed",
    },
  });

  const checkoutEmailEvents = await prisma.customerEvent.findMany({
    where: {
      eventType: "checkout_email_entered",
      sessionId: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      product: true,
    },
  });

  const abandonedCheckoutCandidates = [];

  for (const emailEvent of checkoutEmailEvents) {
    if (!emailEvent.sessionId) {
      continue;
    }

    const completedPurchase = await prisma.customerEvent.findFirst({
      where: {
        eventType: "purchase_completed",
        sessionId: emailEvent.sessionId,
        createdAt: {
          gte: emailEvent.createdAt,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!completedPurchase) {
      abandonedCheckoutCandidates.push(emailEvent);
    }
  }

  return (
    <AdminShell activePage="events">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          Customer Tracking
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Customer Events
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Live overview of tracked customer actions across search, product
          views, checkout starts and purchases.
        </p>
      </div>

      <div className="mb-8">
        <TestEmailButton />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
          <div className="text-sm font-bold text-slate-500">Total Events</div>
          <div className="mt-2 text-3xl font-black text-slate-950">
            {totalEvents}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
          <div className="text-sm font-bold text-slate-500">Searches</div>
          <div className="mt-2 text-3xl font-black text-yellow-700">
            {searchEvents}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
          <div className="text-sm font-bold text-slate-500">Product Views</div>
          <div className="mt-2 text-3xl font-black text-purple-700">
            {productViews}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
          <div className="text-sm font-bold text-slate-500">Checkouts</div>
          <div className="mt-2 text-3xl font-black text-blue-700">
            {checkoutStarts}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
          <div className="text-sm font-bold text-slate-500">Purchases</div>
          <div className="mt-2 text-3xl font-black text-green-700">
            {purchases}
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-orange-50 ring-1 ring-orange-100">
        <div className="border-b border-orange-100 bg-orange-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-orange-700">
                Marketing Automation Preview
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Abandoned Checkout Candidates
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Customers who entered an email in checkout but have no completed
                purchase with the same session afterward.
              </p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm ring-1 ring-orange-100">
              <div className="text-xs font-bold uppercase text-slate-500">
                Candidates
              </div>
              <div className="text-3xl font-black text-orange-700">
                {abandonedCheckoutCandidates.length}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Entered</th>
                <th className="px-5 py-4">Age</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {abandonedCheckoutCandidates.map((event) => (
                <tr key={event.id} className="align-top hover:bg-orange-50/40">
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {getMetadataValue(event.metadata, "customerEmail") || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-950">
                      {event.product?.name ||
                        getMetadataValue(event.metadata, "productName") ||
                        "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {event.productId || "—"}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {getMetadataValue(event.metadata, "destination") ||
                      event.product?.country ||
                      "—"}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {getMetadataValue(event.metadata, "price")
                      ? `€${getMetadataValue(event.metadata, "price")}`
                      : "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                    {formatDate(event.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                      {getMinutesSince(event.createdAt)} min ago
                    </span>
                  </td>

                  <td className="max-w-[220px] px-5 py-4">
                    <div className="truncate font-mono text-xs text-slate-500">
                      {event.sessionId || "—"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <SendAbandonedCheckoutEmailButton eventId={event.id} />
                  </td>
                </tr>
              ))}

              {abandonedCheckoutCandidates.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    No abandoned checkout candidates right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50 ring-1 ring-blue-50">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Latest Events
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing the latest 100 events
                {selectedFilter === "all" ? "" : ` for ${selectedFilter}`}.
              </p>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                Filter Events
              </div>

              <div className="flex max-w-full flex-wrap gap-2">
                {eventFilters.map((filter) => {
                  const isActive = filter.value === selectedFilter;

                  return (
                    <a
                      key={filter.value}
                      href={filter.href}
                      className={`rounded-full px-4 py-2 text-xs font-black transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {filter.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Metadata</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                    {formatDate(event.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getEventBadgeClass(
                        event.eventType
                      )}`}
                    >
                      {event.eventType}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {event.customer ? (
                      <div>
                        <div className="font-bold text-slate-950">
                          {event.customer.email}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {event.customerId}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Anonymous</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {event.product ? (
                      <div>
                        <div className="font-bold text-slate-950">
                          {event.product.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {event.product.country} · {event.product.data}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {event.order ? (
                      <div>
                        <div className="font-bold text-slate-950">
                          {event.order.orderNumber || event.order.id}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {event.order.payment} · {event.order.fulfillment}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="max-w-[180px] px-5 py-4">
                    <div className="truncate font-mono text-xs text-slate-500">
                      {event.sessionId || "—"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <pre className="max-h-40 max-w-[360px] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                      {formatMetadata(event.metadata)}
                    </pre>
                  </td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    No customer events found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
