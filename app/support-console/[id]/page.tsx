import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportConsoleHeader } from "../../../components/SupportConsoleHeader";
import { prisma } from "../../../lib/db";
import { requireSupportConsoleUser } from "../../../lib/support-console-auth";
import { sendSupportReply, updateSupportRequestStatus } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function SupportRequestPage({ params, searchParams }: PageProps) {
  await requireSupportConsoleUser();
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const request = await prisma.supportRequest.findUnique({
    where: { id },
    include: {
      replies: {
        include: { adminUser: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!request) notFound();

  return (
    <main className="min-h-screen bg-[#eef4fb] text-slate-950">
      <SupportConsoleHeader />
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <Link href="/support-console" className="inline-flex min-h-11 items-center text-sm font-bold text-[#174dc8]">
          &larr; Back to support queue
        </Link>
        {notice.sent === "1" ? <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Reply sent and saved in the ticket history.</div> : null}
        {notice.error === "message" ? <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Please enter a reply between 2 and 5,000 characters.</div> : null}
        {notice.error === "email" ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">The message was saved, but email delivery failed. Check the Resend configuration before trying again.</div> : null}

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(22,50,92,0.09)]">
            <div className="border-b border-slate-200 bg-[#0b2868] px-5 py-5 text-white sm:px-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-200">Support conversation</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight">{request.reason}</h1>
                  <p className="mt-2 text-sm text-blue-100">{request.customerEmail}</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">{request.status.replace("_", " ")}</span>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-7">
              <article className="mr-3 rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 p-4 sm:mr-12">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-extrabold">Customer</p><time className="text-xs font-semibold text-slate-500">{formatDate(request.createdAt)}</time></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.message}</p>
              </article>
              {request.replies.map((reply) => (
                <article key={reply.id} className="ml-3 rounded-2xl rounded-tr-md border border-blue-200 bg-blue-50 p-4 sm:ml-12">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-extrabold text-[#123c9b]">DALO reply &middot; {reply.adminUser.name}</p><time className="text-xs font-semibold text-slate-500">{formatDate(reply.sentAt || reply.createdAt)}</time></div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply.message}</p>
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Delivery: {reply.deliveryStatus}</p>
                </article>
              ))}

              <form action={sendSupportReply.bind(null, request.id)} className="border-t border-slate-200 pt-5">
                <label htmlFor="message" className="text-sm font-extrabold">Reply to {request.customerEmail}</label>
                <textarea id="message" name="message" required minLength={2} maxLength={5000} rows={7} placeholder="Write a clear, helpful answer..." className="mt-3 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base leading-6 outline-none transition focus:border-[#2452cc] focus:ring-4 focus:ring-blue-100" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-slate-500">Sent as a branded DALO support email and recorded here.</p>
                  <button type="submit" className="min-h-12 rounded-xl bg-[#2452cc] px-6 text-sm font-extrabold text-white transition hover:bg-[#183fa8] focus:outline-none focus:ring-4 focus:ring-blue-200">Send reply</button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Ticket details</p>
              <dl className="mt-4 space-y-4 text-sm">
                <div><dt className="font-bold text-slate-500">Order</dt><dd className="mt-1 font-extrabold">{request.orderNumber || "Not provided"}</dd></div>
                <div><dt className="font-bold text-slate-500">Product</dt><dd className="mt-1 font-extrabold">{request.productName || "Not provided"}</dd></div>
                <div><dt className="font-bold text-slate-500">ICCID</dt><dd className="mt-1 break-all font-mono text-xs font-bold">{request.iccid || "Not provided"}</dd></div>
              </dl>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Ticket status</p>
              <div className="mt-4 grid gap-2">
                {(["open", "in_progress", "resolved"] as const).map((status) => (
                  <form key={status} action={updateSupportRequestStatus.bind(null, request.id, status)}>
                    <button type="submit" className={`min-h-11 w-full rounded-xl border px-3 text-sm font-extrabold transition ${request.status === status ? "border-[#2452cc] bg-[#2452cc] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}>{status.replace("_", " ")}</button>
                  </form>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
