import { adminLogin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F8FF] px-6 text-slate-900">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-blue-100">
        <div className="mb-8 text-center">
          <img
            src="/dalo-logo.png"
            alt="DALO"
            className="mx-auto h-20 w-auto"
          />

          <h1 className="mt-6 text-3xl font-bold text-slate-950">
            Admin Login
          </h1>

          <p className="mt-2 text-slate-600">
            Sign in to manage DALO products and orders.
          </p>
        </div>

        {hasError && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Wrong email or password.
          </div>
        )}

        <form action={adminLogin} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">Email</label>
            <input
              name="email"
              type="email"
              placeholder="admin@dalo.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="font-bold text-slate-900">Demo Login</div>
          <div>Email: admin@dalo.com</div>
          <div>Password: dalo123</div>
        </div>
      </div>
    </main>
  );
}