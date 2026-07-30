import AdminShell from "../../../components/AdminShell";
import {
  ADMIN_PERMISSION_GROUPS,
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_PERMISSIONS,
  parseAdminPermissions,
  type AdminRole,
} from "../../../lib/admin-permissions";
import { prisma } from "../../../lib/db";
import {
  createAdminUser,
  resetAdminPassword,
  updateAdminUser,
} from "./actions";

const errorMessages: Record<string, string> = {
  invalid: "Enter a name, valid email and a temporary password with 10 characters.",
  exists: "An admin account with this email already exists.",
  self: "You cannot deactivate your own account.",
  owner: "DALO must always have at least one active owner.",
  password: "The temporary password must contain at least 10 characters.",
  missing: "This admin account no longer exists.",
};

function PermissionGrid({ defaults }: { defaults: string[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ADMIN_PERMISSION_GROUPS.map((group) => (
        <fieldset
          key={group.label}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <legend className="px-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            {group.label}
          </legend>
          <div className="mt-2 grid gap-2">
            {group.permissions.map(([permission, label]) => (
              <label
                key={permission}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                <input
                  type="checkbox"
                  name="permissions"
                  value={permission}
                  defaultChecked={defaults.includes(permission)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    reset?: string;
    error?: string;
  }>;
}) {
  const [users, params] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }),
    searchParams,
  ]);

  return (
    <AdminShell activePage="users">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Security & access
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Team & access
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Create individual accounts and decide exactly which DALO areas each
            team member may view or change.
          </p>
        </div>

        {params.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {errorMessages[params.error] || "The change could not be saved."}
          </div>
        ) : null}
        {params.created || params.reset ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">
            {params.created
              ? "Admin user created. They must change the temporary password at first login."
              : "Temporary password saved. Existing sessions were signed out."}
          </div>
        ) : null}

        <details className="group mt-8 rounded-[2rem] border border-blue-200 bg-white shadow-sm" open={users.length <= 1}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Add team member</h2>
              <p className="mt-1 text-sm text-slate-500">
                Start with a role, then tailor the individual permissions.
              </p>
            </div>
            <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
              New user
            </span>
          </summary>
          <form action={createAdminUser} className="border-t border-slate-100 p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input name="name" required placeholder="Full name" className="rounded-xl border border-slate-200 px-4 py-3" />
              <input name="email" type="email" required placeholder="Email address" className="rounded-xl border border-slate-200 px-4 py-3" />
              <input name="password" type="password" minLength={10} required placeholder="Temporary password" className="rounded-xl border border-slate-200 px-4 py-3" />
              <select name="role" defaultValue="MANAGER" className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold">
                {Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <PermissionGrid defaults={ADMIN_ROLE_PERMISSIONS.MANAGER} />
            </div>
            <button className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800">
              Create admin user
            </button>
          </form>
        </details>

        <div className="mt-8 grid gap-5">
          {users.map((user) => {
            const permissions = parseAdminPermissions(user.permissions);
            const roleLabel =
              ADMIN_ROLE_LABELS[user.role as AdminRole] || user.role;
            const update = updateAdminUser.bind(null, user.id);
            const reset = resetAdminPassword.bind(null, user.id);

            return (
              <details
                key={user.id}
                className="rounded-[2rem] border border-slate-200 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black text-slate-950">{user.name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {user.active ? "Active" : "Disabled"}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {roleLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{permissions.length} permissions</p>
                    <p className="mt-1">
                      {user.lastLoginAt
                        ? `Last login ${user.lastLoginAt.toLocaleDateString("en")}`
                        : "Never signed in"}
                    </p>
                  </div>
                </summary>

                <div className="border-t border-slate-100 p-6">
                  <form action={update}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <input name="name" required defaultValue={user.name} className="rounded-xl border border-slate-200 px-4 py-3" />
                      <select name="role" defaultValue={user.role} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold">
                        {Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-bold">
                        <input type="checkbox" name="active" defaultChecked={user.active} className="h-4 w-4 accent-blue-700" />
                        Account active
                      </label>
                    </div>
                    <div className="mt-6">
                      <PermissionGrid defaults={permissions} />
                    </div>
                    <button className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-black text-white hover:bg-slate-800">
                      Save access
                    </button>
                  </form>

                  <form action={reset} className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                    <input name="password" type="password" minLength={10} required placeholder="New temporary password" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3" />
                    <button className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
                      Reset password
                    </button>
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
