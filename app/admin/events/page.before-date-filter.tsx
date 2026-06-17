import AdminShell from "../../../components/AdminShell";
import SendAbandonedCheckoutEmailButton from "../../../components/admin/SendAbandonedCheckoutEmailButton";
import SendProductInterestEmailButton from "../../../components/admin/SendProductInterestEmailButton";
import TestEmailButton from "../../../components/admin/TestEmailButton";
import { prisma } from "../../../lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
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

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return "—";
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "Could not format metadata";
  }
}

function getMinutesSince(date: Date) {
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 1000 / 60));
}

function formatPrice(value: string | null) {
  if (!value) {
    return "—";
  }

  return value.startsWith("€") ? value : `€${value}`;
}

function getEventBadgeClass(eventType: string) {
  if (eventType === "purchase_completed") {
    return "bg-green-100 text-green-700";
  }

  if (eventType === "checkout_started") {
    return "bg-orange-100 text-orange-700";
  }

  if (eventType === "checkout_email_entered") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (eventType === "product_view") {
    return "bg-purple-100 text-purple-700";
  }

  if (eventType === "search") {
    return "bg-blue-100 text-blue-700";
  }

  if (
    eventType === "abandoned_checkout_email_sent" ||
    eventType === "product_interest_email_sent"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (eventType === "marketing_email_clicked") {
    return "bg-cyan-100 text-cyan-700";
  }

  return "bg-slate-100 text-slate-700";
}

const eventFilters = [
  {
    label: "All",
    value: "all",
    href: "/admin/events",
  },
  {
    label: "Search",
    value: "search",
    href: "/admin/events?type=search",
  },
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
  {
    label: "Abandoned Sent",
    value: "abandoned_checkout_email_sent",
    href: "/admin/events?type=abandoned_checkout_email_sent",
  },
  {
    label: "Interest Sent",
    value: "product_interest_email_sent",
    href: "/admin/events?type=product_interest_email_sent",
  },
  {
    label: "Email Clicks",
    value: "marketing_email_clicked",
    href: "/admin/events?type=marketing_email_clicked",
  },
];

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedType = params.type || "all";

  const selectedFilter = eventFilters.some(
    (filter) => filter.value === selectedType
  )
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

  const abandonedCheckoutCandidates: typeof checkoutEmailEvents = [];

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

    const alreadySent = await prisma.customerEvent.findFirst({
      where: {
        eventType: "abandoned_checkout_email_sent",
        sessionId: emailEvent.sessionId,
        productId: emailEvent.productId,
        createdAt: {
          gte: emailEvent.createdAt,
        },
      },
    });

    if (!completedPurchase && !alreadySent) {
      abandonedCheckoutCandidates.push(emailEvent);
    }
  }

  const knownVisitorProductViews = await prisma.customerEvent.findMany({
    where: {
      eventType: "product_view",
      customerId: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      customer: true,
      product: true,
    },
  });

  const knownVisitorProductInterestCandidates: typeof knownVisitorProductViews =
    [];

  for (const productView of knownVisitorProductViews) {
    if (!productView.sessionId || !productView.productId) {
      continue;
    }

    const completedPurchase = await prisma.customerEvent.findFirst({
      where: {
        eventType: "purchase_completed",
        sessionId: productView.sessionId,
        productId: productView.productId,
        createdAt: {
          gte: productView.createdAt,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const checkoutStarted = await prisma.customerEvent.findFirst({
      where: {
        eventType: "checkout_started",
        sessionId: productView.sessionId,
        productId: productView.productId,
        createdAt: {
          gte: productView.createdAt,
        },
      },
    });

    const alreadySent = await prisma.customerEvent.findFirst({
      where: {
        eventType: "product_interest_email_sent",
        sessionId: productView.sessionId,
        productId: productView.productId,
        createdAt: {
          gte: productView.createdAt,
        },
      },
    });

    if (!completedPurchase && !checkoutStarted && !alreadySent) {
      knownVisitorProductInterestCandidates.push(productView);
    }
  }

  const sentMarketingEmailEvents = await prisma.customerEvent.findMany({
    where: {
      eventType: {
        in: ["abandoned_checkout_email_sent", "product_interest_email_sent"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      customer: true,
      product: true,
    },
  });

  const marketingEmailClicksCount = await prisma.customerEvent.count({
    where: {
      eventType: "marketing_email_clicked",
    },
  });

  const marketingEmailPerformanceRows = [];

  for (const sentEmailEvent of sentMarketingEmailEvents) {
    const clickedCandidates = await prisma.customerEvent.findMany({
      where: {
        eventType: "marketing_email_clicked",
        productId: sentEmailEvent.productId,
        createdAt: {
          gte: sentEmailEvent.createdAt,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 20,
    });

    const clickedEvent =
      clickedCandidates.find(
        (event) =>
          getMetadataValue(event.metadata, "sourceEventId") ===
            sentEmailEvent.id || event.sessionId === sentEmailEvent.sessionId
      ) || null;

    const purchaseCandidates = await prisma.customerEvent.findMany({
      where: {
        eventType: "purchase_completed",
        productId: sentEmailEvent.productId,
        createdAt: {
          gte: sentEmailEvent.createdAt,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 20,
    });

    const purchasedEvent =
      purchaseCandidates.find(
        (event) =>
          getMetadataValue(event.metadata, "marketingSourceEventId") ===
            sentEmailEvent.id || event.sessionId === sentEmailEvent.sessionId
      ) || null;

    marketingEmailPerformanceRows.push({
      sentEmailEvent,
      clickedEvent,
      purchasedEvent,
    });
  }

  const knownVisitorsCount = await prisma.customer.count();

  const marketingEmailsSentCount = await prisma.customerEvent.count({
    where: {
      eventType: {
        in: ["abandoned_checkout_email_sent", "product_interest_email_sent"],
      },
    },
  });

  const conversionEventsCount = await prisma.customerEvent.count({
    where: {
      eventType: "purchase_completed",
    },
  });

  const marketingPurchasesCount = marketingEmailPerformanceRows.filter(
    (row) => row.purchasedEvent
  ).length;

  const marketingAttributedRevenue = marketingEmailPerformanceRows.reduce(
    (sum, row) => {
      const price = getMetadataValue(row.purchasedEvent?.metadata, "price");

      if (!price) {
        return sum;
      }

      const numericPrice = Number(price.replace("€", ""));

      if (Number.isNaN(numericPrice)) {
        return sum;
      }

      return sum + numericPrice;
    },
    0
  );

  return (
    <AdminShell activePage="events">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Customer Tracking
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Marketing Events
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            A cleaned-up marketing cockpit for visitor recognition, abandoned
            checkout emails, product interest emails and conversion attribution.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <TestEmailButton />
        </div>
      </div>

      <section className="mb-8 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-200">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-300">
              Marketing Summary
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Automation readiness
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
            Snapshot of known visitors, open marketing opportunities, sent
            emails, clicks and attributed purchases.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Known Visitors
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {knownVisitorsCount}
            </div>
          </div>

          <div className="rounded-2xl bg-orange-500/15 p-5 ring-1 ring-orange-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-orange-200">
              Abandoned
            </div>
            <div className="mt-2 text-3xl font-black text-orange-100">
              {abandonedCheckoutCandidates.length}
            </div>
          </div>

          <div className="rounded-2xl bg-purple-500/15 p-5 ring-1 ring-purple-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-purple-200">
              Product Interest
            </div>
            <div className="mt-2 text-3xl font-black text-purple-100">
              {knownVisitorProductInterestCandidates.length}
            </div>
          </div>

          <div className="rounded-2xl bg-green-500/15 p-5 ring-1 ring-green-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-green-200">
              Emails Sent
            </div>
            <div className="mt-2 text-3xl font-black text-green-100">
              {marketingEmailsSentCount}
            </div>
          </div>

          <div className="rounded-2xl bg-cyan-500/15 p-5 ring-1 ring-cyan-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-cyan-200">
              Email Clicks
            </div>
            <div className="mt-2 text-3xl font-black text-cyan-100">
              {marketingEmailClicksCount}
            </div>
          </div>

          <div className="rounded-2xl bg-blue-500/15 p-5 ring-1 ring-blue-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-blue-200">
              Purchases
            </div>
            <div className="mt-2 text-3xl font-black text-blue-100">
              {conversionEventsCount}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-500/15 p-5 ring-1 ring-emerald-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-200">
              Marketing Purchases
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-100">
              {marketingPurchasesCount}
            </div>
          </div>

          <div className="rounded-2xl bg-yellow-500/15 p-5 ring-1 ring-yellow-300/20">
            <div className="text-xs font-black uppercase tracking-wide text-yellow-200">
              Marketing Revenue
            </div>
            <div className="mt-2 text-3xl font-black text-yellow-100">
              €{marketingAttributedRevenue.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-emerald-50 ring-1 ring-emerald-100">
        <div className="border-b border-emerald-100 bg-emerald-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
                Attribution
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Marketing Email Performance
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                The most important table: which email was sent, clicked and
                later converted into a purchase.
              </p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm ring-1 ring-emerald-100">
              <div className="text-xs font-bold uppercase text-slate-500">
                Attributed Revenue
              </div>
              <div className="text-3xl font-black text-emerald-700">
                €{marketingAttributedRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Sent</th>
                <th className="px-5 py-4">Clicked</th>
                <th className="px-5 py-4">Purchased</th>
                <th className="px-5 py-4">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {marketingEmailPerformanceRows.map(
                ({ sentEmailEvent, clickedEvent, purchasedEvent }) => (
                  <tr
                    key={sentEmailEvent.id}
                    className="align-top hover:bg-emerald-50/40"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          sentEmailEvent.eventType ===
                          "abandoned_checkout_email_sent"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {sentEmailEvent.eventType ===
                        "abandoned_checkout_email_sent"
                          ? "Abandoned"
                          : "Interest"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-950">
                      {sentEmailEvent.customer?.email ||
                        getMetadataValue(
                          sentEmailEvent.metadata,
                          "customerEmail"
                        ) ||
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-950">
                        {sentEmailEvent.product?.name ||
                          getMetadataValue(
                            sentEmailEvent.metadata,
                            "productName"
                          ) ||
                          "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {sentEmailEvent.productId || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {getMetadataValue(
                        sentEmailEvent.metadata,
                        "destination"
                      ) ||
                        sentEmailEvent.product?.country ||
                        "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                      {formatDate(sentEmailEvent.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      {clickedEvent ? (
                        <div>
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">
                            Yes
                          </span>
                          <div className="mt-2 whitespace-nowrap text-xs font-semibold text-slate-500">
                            {formatDate(clickedEvent.createdAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {purchasedEvent ? (
                        <div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                            Yes
                          </span>
                          <div className="mt-2 whitespace-nowrap text-xs font-semibold text-slate-500">
                            {formatDate(purchasedEvent.createdAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-black text-emerald-700">
                      {purchasedEvent
                        ? formatPrice(
                            getMetadataValue(purchasedEvent.metadata, "price") ||
                              getMetadataValue(
                                sentEmailEvent.metadata,
                                "price"
                              )
                          )
                        : "—"}
                    </td>
                  </tr>
                )
              )}

              {marketingEmailPerformanceRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No marketing email performance data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8 grid gap-8 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-orange-50 ring-1 ring-orange-100">
          <div className="border-b border-orange-100 bg-orange-50 p-6">
            <p className="text-sm font-black uppercase tracking-wide text-orange-700">
              Active Opportunity
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Abandoned Checkout
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Email entered in checkout, but no completed purchase afterward.
            </p>

            <div className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-black text-orange-700 ring-1 ring-orange-100">
              {abandonedCheckoutCandidates.length} candidates
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Age</th>
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
                        {getMetadataValue(event.metadata, "destination") ||
                          event.product?.country ||
                          "—"}{" "}
                        · {formatPrice(getMetadataValue(event.metadata, "price"))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                        {getMinutesSince(event.createdAt)} min ago
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <SendAbandonedCheckoutEmailButton eventId={event.id} />
                    </td>
                  </tr>
                ))}

                {abandonedCheckoutCandidates.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No abandoned checkout candidates right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-purple-50 ring-1 ring-purple-100">
          <div className="border-b border-purple-100 bg-purple-50 p-6">
            <p className="text-sm font-black uppercase tracking-wide text-purple-700">
              Active Opportunity
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Known Visitor Product Interest
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Known visitor viewed a product, but did not start checkout or buy.
            </p>

            <div className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-black text-purple-700 ring-1 ring-purple-100">
              {knownVisitorProductInterestCandidates.length} candidates
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Age</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {knownVisitorProductInterestCandidates.map((event) => (
                  <tr key={event.id} className="align-top hover:bg-purple-50/40">
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {event.customer?.email ||
                        getMetadataValue(event.metadata, "knownCustomerEmail") ||
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-950">
                        {event.product?.name ||
                          getMetadataValue(event.metadata, "productName") ||
                          "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {getMetadataValue(event.metadata, "destination") ||
                          event.product?.country ||
                          "—"}{" "}
                        · {formatPrice(getMetadataValue(event.metadata, "price"))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                        {getMinutesSince(event.createdAt)} min ago
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <SendProductInterestEmailButton eventId={event.id} />
                    </td>
                  </tr>
                ))}

                {knownVisitorProductInterestCandidates.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No known visitor product interest candidates right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-green-50 ring-1 ring-green-100">
        <div className="border-b border-green-100 bg-green-50 p-6">
          <p className="text-sm font-black uppercase tracking-wide text-green-700">
            Marketing Email Log
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Sent Marketing Emails
          </h2>

          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Recent abandoned checkout and product interest emails that were
            manually sent.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Sent</th>
                <th className="px-5 py-4">Session</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sentMarketingEmailEvents.map((event) => (
                <tr key={event.id} className="align-top hover:bg-green-50/40">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        event.eventType === "abandoned_checkout_email_sent"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {event.eventType === "abandoned_checkout_email_sent"
                        ? "Abandoned reminder"
                        : "Product interest"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-950">
                    {event.customer?.email ||
                      getMetadataValue(event.metadata, "customerEmail") ||
                      "—"}
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
                    {formatPrice(getMetadataValue(event.metadata, "price"))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                    {formatDate(event.createdAt)}
                  </td>

                  <td className="max-w-[220px] px-5 py-4">
                    <div className="truncate font-mono text-xs text-slate-500">
                      {event.sessionId || "—"}
                    </div>
                  </td>
                </tr>
              ))}

              {sentMarketingEmailEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No marketing emails sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50 ring-1 ring-blue-50">
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-slate-500">
                Raw Event Log
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Latest Events
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Technical event log. Showing the latest 100 matching events.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {eventFilters.map((filter) => (
                <a
                  key={filter.value}
                  href={filter.href}
                  className={`rounded-full px-4 py-2 text-xs font-black transition ${
                    selectedFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
                  }`}
                >
                  {filter.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
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
                <tr key={event.id} className="align-top hover:bg-blue-50/30">
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
                        <div className="mt-1 font-mono text-xs text-slate-400">
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
                    ) : event.productId ? (
                      <div className="font-mono text-xs text-slate-500">
                        {event.productId}
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
                    ) : event.orderId ? (
                      <div className="font-mono text-xs text-slate-500">
                        {event.orderId}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="max-w-[220px] px-5 py-4">
                    <div className="truncate font-mono text-xs text-slate-500">
                      {event.sessionId || "—"}
                    </div>
                  </td>

                  <td className="max-w-[360px] px-5 py-4">
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">
                      {formatMetadata(event.metadata)}
                    </pre>
                  </td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No events found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
