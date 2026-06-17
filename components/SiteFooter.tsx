export default function SiteFooter() {
  return (
    <footer className="border-t bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-black">DALO</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The travel eSIM recommendation engine.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Popular eSIM destinations</h4>

            <div className="space-y-2 text-slate-600">
              <a className="block hover:text-blue-700" href="/esim/turkey">
                Turkey eSIM
              </a>
              <a className="block hover:text-blue-700" href="/esim/thailand">
                Thailand eSIM
              </a>
              <a className="block hover:text-blue-700" href="/esim/serbia">
                Serbia eSIM
              </a>
              <a className="block hover:text-blue-700" href="/esim/germany">
                Germany eSIM
              </a>
              <a className="block hover:text-blue-700" href="/esim/france">
                France eSIM
              </a>
              <a
                className="block hover:text-blue-700"
                href="/esim/united-states-of-america"
              >
                USA eSIM
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Support</h4>

            <div className="space-y-2 text-slate-600">
              <a className="block hover:text-blue-700" href="/support">
                Support
              </a>
              <a className="block hover:text-blue-700" href="/contact">
                Contact
              </a>
              <a className="block hover:text-blue-700" href="/refund-policy">
                Refund Policy
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Company</h4>

            <div className="space-y-2 text-slate-600">
              <a className="block hover:text-blue-700" href="/about">
                About
              </a>
              <a className="block hover:text-blue-700" href="/privacy-policy">
                Privacy Policy
              </a>
              <a className="block hover:text-blue-700" href="/terms">
                Terms
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-slate-500">
          © 2026 DALO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
