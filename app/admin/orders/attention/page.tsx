import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdminPermission, adminHasPermission } from "@/lib/admin-auth";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { prisma } from "@/lib/db";
import { retryProviderEvent } from "../recovery-actions";

export default async function AttentionPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ORDERS_READ);
  const canWrite = adminHasPermission(actor, ADMIN_PERMISSIONS.ORDERS_WRITE);
  const { result } = await searchParams;
  const [operations, events] = await Promise.all([
    prisma.providerOperation.findMany({ where: { status: { in: ["unknown", "needs_reconciliation", "provider_committed", "failed", "processing"] } }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.providerWebhookEvent.findMany({ where: { status: { in: ["failed", "unmatched", "received", "processing"] } }, orderBy: { receivedAt: "desc" }, take: 50 }),
  ]);
  return <AdminShell activePage="orders">
    <h1 className="text-3xl font-black">Delivery and usage issues</h1>
    <p className="mt-3 text-slate-600">Latest 50 entries in each list. Unknown purchases must be checked in the provider portal before any further purchase.</p>
    <Link href="/admin/orders?status=needs_fulfillment" className="mt-4 inline-block font-bold text-blue-700">View paid orders awaiting delivery →</Link>
    {result ? <p role="status" className="mt-4 rounded-xl bg-blue-50 p-4">{result}</p> : null}
    <h2 className="mt-8 text-xl font-bold">Provider operations</h2>
    {operations.map((operation) => <div key={operation.id} className="mt-3 rounded-xl bg-white p-4">
      <p className="font-bold">{operation.operationKind} · {operation.status}</p>
      <p className="text-sm">{operation.lastErrorMessage || "Processing; investigate if this remains unchanged."}</p>
      <p className="text-sm">Provider reference: {operation.providerReference || "Unknown — do not repurchase"}</p>
      {operation.orderId ? <Link className="font-bold text-blue-700" href={`/admin/orders/${operation.orderId}`}>Open order and recovery</Link> : null}
    </div>)}
    {!operations.length ? <p className="mt-3">No unresolved provider operations.</p> : null}
    <h2 className="mt-8 text-xl font-bold">Unprocessed provider messages</h2>
    {events.map((event) => <div key={event.id} className="mt-3 rounded-xl bg-white p-4">
      <p className="font-bold">{event.eventType} · {event.status}</p>
      <p className="text-sm">{event.errorMessage || "Waiting for processing or profile assignment."}</p>
      {canWrite ? <form action={retryProviderEvent}><input type="hidden" name="eventId" value={event.id}/><button className="mt-2 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white">Retry message (no purchase)</button></form> : null}
    </div>)}
    {!events.length ? <p className="mt-3">No unresolved provider messages.</p> : null}
  </AdminShell>;
}
