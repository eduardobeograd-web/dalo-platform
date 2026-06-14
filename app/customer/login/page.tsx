import { requestCustomerLogin } from "./actions";

export default function CustomerLoginPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-xl">
        <a href="/" className="inline-block">
          <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
        </a>

        <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Customer Login
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Access your eSIMs
          </h1>

          <p className="mt-3 text-slate-600">
            Enter the email you used during checkout. We will send you a secure
            login link.
          </p>

          <form action={requestCustomerLogin} className="mt-8 space-y-5">
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

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Send login link
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            Development mode: the login link is printed in the terminal.
          </p>
        </div>
      </div>
    </main>
  );
}