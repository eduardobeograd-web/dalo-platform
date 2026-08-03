import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import SendAbandonedCheckoutEmailButton from "../../../components/admin/SendAbandonedCheckoutEmailButton";
import SendProductInterestEmailButton from "../../../components/admin/SendProductInterestEmailButton";
import TestEmailButton from "../../../components/admin/TestEmailButton";
import { prisma } from "../../../lib/db";

function getRangeStart(range: string) {
  const now = new Date();
  if (range === "today") now.setHours(0, 0, 0, 0);
  else if (range === "7d") now.setDate(now.getDate() - 7);
  else if (range === "30d") now.setDate(now.getDate() - 30);
  else return null;
  return now;
}

function minutesSince(date: Date) {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

export default async function AdminMarketingPage({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  const params = (await searchParams) || {};
  const range = ["today", "7d", "30d", "all"].includes(params.range || "") ? params.range || "30d" : "30d";
  const start = getRangeStart(range);
  const dateWhere = start ? { createdAt: { gte: start } } : {};

  const [views, checkouts, purchases, sent, clicks, emailEvents, visitorViews, sentEmails] = await Promise.all([
    prisma.customerEvent.count({ where: { ...dateWhere, eventType: "product_view" } }),
    prisma.customerEvent.count({ where: { ...dateWhere, eventType: "checkout_started" } }),
    prisma.customerEvent.count({ where: { ...dateWhere, eventType: "purchase_completed" } }),
    prisma.customerEvent.count({ where: { ...dateWhere, eventType: { in: ["abandoned_checkout_email_sent", "product_interest_email_sent"] } } }),
    prisma.customerEvent.count({ where: { ...dateWhere, eventType: "marketing_email_clicked" } }),
    prisma.customerEvent.findMany({ where: { ...dateWhere, eventType: "checkout_email_entered", sessionId: { not: null } }, orderBy: { createdAt: "desc" }, take: 30, include: { product: true } }),
    prisma.customerEvent.findMany({ where: { ...dateWhere, eventType: "product_view", customerId: { not: null }, sessionId: { not: null }, productId: { not: null } }, orderBy: { createdAt: "desc" }, take: 30, include: { customer: true, product: true } }),
    prisma.customerEvent.findMany({ where: { ...dateWhere, eventType: { in: ["abandoned_checkout_email_sent", "product_interest_email_sent"] } }, orderBy: { createdAt: "desc" }, take: 20, include: { customer: true, product: true } }),
  ]);

  const sessionIds = [...new Set([...emailEvents, ...visitorViews, ...sentEmails].map((event) => event.sessionId).filter((value): value is string => Boolean(value)))];
  const relatedEvents = sessionIds.length ? await prisma.customerEvent.findMany({
    where: { sessionId: { in: sessionIds }, eventType: { in: ["purchase_completed", "checkout_started", "abandoned_checkout_email_sent", "product_interest_email_sent", "marketing_email_clicked"] } },
    select: { eventType: true, sessionId: true, productId: true, createdAt: true },
  }) : [];

  const abandoned = emailEvents.filter((event) => !relatedEvents.some((related) => related.sessionId === event.sessionId && related.createdAt >= event.createdAt && ["purchase_completed", "abandoned_checkout_email_sent"].includes(related.eventType)));
  const interested = visitorViews.filter((event) => !relatedEvents.some((related) => related.sessionId === event.sessionId && related.productId === event.productId && related.createdAt >= event.createdAt && ["purchase_completed", "checkout_started", "product_interest_email_sent"].includes(related.eventType)));

  return (
    <AdminShell activePage="events">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Growth</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Marketing</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Actionable recovery opportunities and email performance without the technical event noise.</p>
          <Link href="/admin/activity" className="mt-4 inline-block text-sm font-black text-blue-700">Open technical activity log →</Link>
        </div>
        <div className="w-full max-w-sm"><TestEmailButton /></div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[['today','Today'],['7d','7 days'],['30d','30 days'],['all','All']].map(([value,label]) => (
          <Link key={value} href={value === "30d" ? "/admin/events" : `/admin/events?range=${value}`} className={`rounded-xl px-4 py-2 text-sm font-black ${range === value ? "bg-blue-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{label}</Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[["Product views",views],["Checkouts",checkouts],["Purchases",purchases],["Emails sent",sent],["Email clicks",clicks]].map(([label,value]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p></div>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div><p className="text-xs font-black uppercase tracking-wide text-orange-600">Checkout recovery</p><h2 className="mt-1 text-2xl font-black">Abandoned checkouts</h2><p className="mt-1 text-sm text-slate-500">Only sessions without a purchase or previous reminder.</p></div>
          <div className="mt-5 divide-y divide-slate-100">
            {abandoned.slice(0,10).map((event) => <div key={event.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-slate-900">{event.email || "Unknown email"}</p><p className="mt-1 text-sm text-slate-500">{event.product?.name || "Unknown product"} · {minutesSince(event.createdAt)} min ago</p></div><SendAbandonedCheckoutEmailButton eventId={event.id} /></div>)}
            {abandoned.length === 0 ? <p className="py-8 text-center text-slate-500">No open recovery opportunities.</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div><p className="text-xs font-black uppercase tracking-wide text-blue-600">Known customers</p><h2 className="mt-1 text-2xl font-black">Product interest</h2><p className="mt-1 text-sm text-slate-500">Signed-in visitors who viewed a plan without starting checkout.</p></div>
          <div className="mt-5 divide-y divide-slate-100">
            {interested.slice(0,10).map((event) => <div key={event.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-slate-900">{event.customer?.email || "Known customer"}</p><p className="mt-1 text-sm text-slate-500">{event.product?.name || "Unknown product"} · {minutesSince(event.createdAt)} min ago</p></div><SendProductInterestEmailButton eventId={event.id} /></div>)}
            {interested.length === 0 ? <p className="py-8 text-center text-slate-500">No open product-interest opportunities.</p> : null}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Recent marketing emails</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {sentEmails.map((event) => <div key={event.id} className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_1.3fr_1fr_auto]"><p className="font-bold text-slate-900">{event.customer?.email || "Unknown customer"}</p><p className="text-slate-600">{event.product?.name || "No product"}</p><p className="font-mono text-xs text-slate-500">{event.eventType}</p><p className="text-slate-500">{event.createdAt.toLocaleString("en")}</p></div>)}
          {sentEmails.length === 0 ? <p className="py-6 text-slate-500">No marketing emails sent in this period.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}
