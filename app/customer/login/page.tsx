import { loginCustomer } from "./actions";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-xl">
        <a href="/" className="inline-block">
          <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-16 w-auto" />
        </a>

        <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Customer Login
          </p>

          <h1 className="mt-3 text-4xl font-bold">Access your eSIMs</h1>

          <p className="mt-3 text-slate-600">
            Log in with your email and password to manage your eSIMs, top-ups
            and orders.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              Email or password is incorrect.
            </div>
          ) : null}

          <form action={loginCustomer} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Your password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Log in
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            No password yet?{" "}
            <a href="/customer/set-password" className="font-bold text-blue-600">
              Create password
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}