import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { updateSupportRequestStatus } from "./actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "resolved") return "Resolved";
  return "Open";
}

function getStatusClass(status: string) {
  if (status === "resolved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "in_progress") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.supportRequest.findUnique({
    where: {
      id,
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              DALO Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Support Request
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Full customer message and order context.
            </p>
          </div>

          <Link
            href="/admin/support"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Back to support
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                  request.status
                )}`}
              >
                {getStatusLabel(request.status)}
              </span>

              <span className="text-sm text-slate-400">
                Created {formatDate(request.createdAt)}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reason
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {request.reason}
              </h2>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Message
              </p>
              <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                {request.message}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <form
                  action={async () => {
                    "use server";
                    await updateSupportRequestStatus(request.id, "open");
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Mark open
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await updateSupportRequestStatus(
                      request.id,
                      "in_progress"
                    );
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Mark in progress
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await updateSupportRequestStatus(request.id, "resolved");
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Mark resolved
                  </button>
                </form>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Customer
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {request.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer ID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {request.customerId || "Not linked"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Order</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    DALO Order Number
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {request.orderNumber || "No order number"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    ICCID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {request.iccid || "No ICCID"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Product
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {request.productName || "No product saved"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order ID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {request.orderId || "Not linked"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}