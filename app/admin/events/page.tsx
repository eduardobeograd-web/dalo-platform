import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

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

export default async function AdminEventsPage() {
  const events = await prisma.customerEvent.findMany({
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

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50 ring-1 ring-blue-50">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-black text-slate-950">
            Latest Events
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing the latest 100 events.
          </p>
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
                    No customer events found yet.
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
