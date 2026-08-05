import { redirect } from "next/navigation";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import {
  changeCustomerPassword,
  logoutCustomerEverywhere,
  updateBillingAddress,
  updateCustomerProfile,
  updateMarketingPreferences,
} from "./actions";

type SettingsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<
  string,
  { tone: "success" | "error"; text: string }
> = {
  "profile-saved": {
    tone: "success",
    text: "Your name has been updated.",
  },
  "email-saved": {
    tone: "success",
    text: "Your login email has been updated.",
  },
  "email-unchanged": {
    tone: "error",
    text: "Enter a different email address to make a change.",
  },
  "email-change-unavailable": {
    tone: "error",
    text: "Email changes are temporarily disabled while secure email confirmation is being completed.",
  },
  "billing-saved": {
    tone: "success",
    text: "Your billing address has been saved.",
  },
  "marketing-enabled": {
    tone: "success",
    text: "Email tips, plan reminders and occasional offers are enabled.",
  },
  "marketing-disabled": {
    tone: "success",
    text: "Marketing emails are disabled. Essential order and account emails will continue.",
  },
  "password-saved": {
    tone: "success",
    text: "Your password has been changed and other sessions were signed out.",
  },
  "invalid-email": {
    tone: "error",
    text: "Enter a valid email address.",
  },
  "profile-password": {
    tone: "error",
    text: "Enter your current password to change your email address.",
  },
  "email-in-use": {
    tone: "error",
    text: "That email address already belongs to another DALO account.",
  },
  "billing-incomplete": {
    tone: "error",
    text: "Complete the street, city, postal code and country, or leave the address empty.",
  },
  "password-current": {
    tone: "error",
    text: "Your current password is not correct.",
  },
  "password-short": {
    tone: "error",
    text: "Your new password must contain at least 10 characters.",
  },
  "password-match": {
    tone: "error",
    text: "The new passwords do not match.",
  },
};

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#2148c0] focus:ring-4 focus:ring-[#2148c0]/10";

export default async function CustomerSettingsPage({
  searchParams,
}: SettingsPageProps) {
  const [customer, params] = await Promise.all([
    getCurrentCustomer(),
    searchParams,
  ]);

  if (!customer) {
    redirect("/customer/login?next=/customer/settings");
  }

  const message = params.status ? statusMessages[params.status] : null;

  return (
    <main className="dalo-page min-h-screen bg-[#f4f7fc] text-slate-950">
      <SiteHeader mode="account" />

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              href="/customer/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2148c0] transition hover:text-[#173f91]"
            >
              <span aria-hidden="true">←</span>
              Back to my eSIMs
            </a>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#2148c0]">
              DALO account
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Account settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Keep your personal details, billing information and account
              security up to date.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-slate-500">Signed in as</p>
            <p className="mt-0.5 break-all font-bold text-slate-900">
              {customer.email}
            </p>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 sm:mt-8">
          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,64,120,0.08)]">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2148c0]">
                Email preferences
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Travel updates
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Order confirmations, delivery and security emails are always sent.
                The setting below only controls optional tips, reminders and offers.
              </p>
            </div>
            <form action={updateMarketingPreferences} className="p-5 sm:p-8">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  name="marketingEmailConsent"
                  type="checkbox"
                  defaultChecked={customer.marketingEmailConsent}
                  className="mt-1 h-5 w-5 rounded border-slate-300 accent-[#2148c0]"
                />
                <span>
                  <span className="block font-black text-slate-950">
                    Send me useful eSIM tips, plan reminders and occasional offers
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    You can switch this off again at any time.
                  </span>
                </span>
              </label>
              <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2148c0] px-6 text-sm font-black text-white transition hover:bg-[#173f91] sm:w-auto">
                Save email preferences
              </button>
            </form>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,64,120,0.08)]">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2148c0]">
                Personal details
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Your DALO profile
              </h2>
            </div>
            <form
              action={updateCustomerProfile}
              className="p-5 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-800">
                Full name
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={customer.name || ""}
                  className={inputClassName}
                  placeholder="Your name"
                />
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Login email
                  </p>
                  <p className="mt-1 break-all text-sm font-bold text-slate-900">
                    {customer.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Managed separately below
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2148c0] px-6 text-sm font-black text-white transition hover:bg-[#173f91] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto">
                  Save name
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,64,120,0.08)]">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2148c0]">
                Billing
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Billing address
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Optional. We use this information for future invoices. Existing
                invoices remain unchanged.
              </p>
            </div>
            <form
              action={updateBillingAddress}
              className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8"
            >
              <label className="text-sm font-bold text-slate-800 sm:col-span-2">
                Company
                <input
                  name="billingCompany"
                  type="text"
                  autoComplete="organization"
                  defaultValue={customer.billingCompany || ""}
                  className={inputClassName}
                  placeholder="Optional"
                />
              </label>
              <label className="text-sm font-bold text-slate-800 sm:col-span-2">
                Street and number
                <input
                  name="billingAddressLine1"
                  type="text"
                  autoComplete="address-line1"
                  defaultValue={customer.billingAddressLine1 || ""}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-bold text-slate-800 sm:col-span-2">
                Address line 2
                <input
                  name="billingAddressLine2"
                  type="text"
                  autoComplete="address-line2"
                  defaultValue={customer.billingAddressLine2 || ""}
                  className={inputClassName}
                  placeholder="Apartment, suite or floor"
                />
              </label>
              <label className="text-sm font-bold text-slate-800">
                City
                <input
                  name="billingCity"
                  type="text"
                  autoComplete="address-level2"
                  defaultValue={customer.billingCity || ""}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-bold text-slate-800">
                State or region
                <input
                  name="billingState"
                  type="text"
                  autoComplete="address-level1"
                  defaultValue={customer.billingState || ""}
                  className={inputClassName}
                  placeholder="Optional"
                />
              </label>
              <label className="text-sm font-bold text-slate-800">
                Postal code
                <input
                  name="billingPostalCode"
                  type="text"
                  autoComplete="postal-code"
                  defaultValue={customer.billingPostalCode || ""}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-bold text-slate-800">
                Country
                <input
                  name="billingCountry"
                  type="text"
                  autoComplete="country-name"
                  defaultValue={customer.billingCountry || ""}
                  className={inputClassName}
                />
              </label>
              <div className="sm:col-span-2">
                <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 sm:w-auto">
                  Save billing address
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,64,120,0.08)]">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2148c0]">
                Security
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Login and security
              </h2>
            </div>
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h3 className="font-black text-slate-950">
                  Login email
                </h3>
                <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                  {customer.email}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800 sm:max-w-sm">
                Email changes will be available after secure confirmation to
                the current email address is enabled.
              </div>
            </div>

            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition hover:bg-slate-50 sm:px-8">
                <div>
                  <h3 className="font-black text-slate-950">
                    Change password
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Create a new secure account password
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xl font-bold text-[#2148c0] transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <form
                action={changeCustomerPassword}
                className="grid gap-5 border-t border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 sm:p-8"
              >
                <label className="text-sm font-bold text-slate-800 sm:col-span-2">
                  Current password
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm font-bold text-slate-800">
                  New password
                  <input
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    required
                    className={inputClassName}
                    placeholder="At least 10 characters"
                  />
                </label>
                <label className="text-sm font-bold text-slate-800">
                  Confirm new password
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    required
                    className={inputClassName}
                  />
                </label>
                <div className="sm:col-span-2">
                  <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2148c0] px-6 text-sm font-black text-white transition hover:bg-[#173f91] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto">
                    Confirm password change
                  </button>
                </div>
              </form>
            </details>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-8">
              <div>
                <p className="font-bold text-slate-900">Sign out everywhere</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  End every active DALO customer session, including this one.
                </p>
              </div>
              <form action={logoutCustomerEverywhere} className="mt-4 sm:mt-0">
                <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 sm:w-auto">
                  Sign out all devices
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
