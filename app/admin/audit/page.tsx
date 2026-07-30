import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

export default async function AdminAuditPage() {
  const entries = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { adminUser: true },
  });

  return (
    <AdminShell activePage="audit">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Accountability
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Audit log</h1>
        <p className="mt-2 text-slate-600">
          The latest security and access changes across the DALO admin.
        </p>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {entries.length ? (
            <div className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <div key={entry.id} className="grid gap-2 px-6 py-4 md:grid-cols-[180px_1fr_1fr_180px] md:items-center">
                  <p className="text-sm text-slate-500">
                    {entry.createdAt.toLocaleString("en")}
                  </p>
                  <p className="font-bold text-slate-950">
                    {entry.adminUser?.name || "System"}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {entry.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {entry.resource}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-10 text-center text-slate-500">
              Audit entries will appear after the first admin action.
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
