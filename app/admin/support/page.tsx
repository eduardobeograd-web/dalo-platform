import Link from "next/link";
import { prisma } from "../../../lib/db";

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

export default async function AdminSupportPage() {
  const supportRequests = await prisma.supportRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              DALO Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Support Requests
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Customer support messages linked to orders, ICCIDs and eSIM plans.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Back to admin
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-950">
              All requests
            </h2>
          </div>

          {supportRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No support requests yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Customer messages will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {supportRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/support/${request.id}`}
                  className="grid gap-4 px-6 py-5 hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 font-semibold text-slate-950">
                      {request.reason}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {request.message}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {request.customerEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {request.orderNumber || "No order number"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {request.iccid || "No ICCID"}
                    </p>
                  </div>

                  <div className="flex items-center text-sm font-semibold text-blue-600">
                    View
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}