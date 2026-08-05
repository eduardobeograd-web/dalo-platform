export default function CheckoutEmailInput() {
  return (
    <input
      name="email"
      type="email"
      autoComplete="email"
      required
      placeholder="you@example.com"
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
    />
  );
}
