function getDestinationFlag(destination: string) {
  const flags: Record<string, string> = {
    Europe: "🇪🇺",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
    Japan: "🇯🇵",
    Thailand: "🇹🇭",
    "United States": "🇺🇸",
    "United States of America": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Portugal: "🇵🇹",
    Greece: "🇬🇷",
    Turkey: "🇹🇷",
    Switzerland: "🇨🇭",
    Austria: "🇦🇹",
    Netherlands: "🇳🇱",
    Croatia: "🇭🇷",
    Serbia: "🇷🇸",
    Montenegro: "🇲🇪",
    Albania: "🇦🇱",
    Dubai: "🇦🇪",
    "United Arab Emirates": "🇦🇪",
  };

  return flags[destination] || "🌍";
}

export default function TravelTicketCard({
  country,
  usageLabel,
}: {
  country: string;
  planName: string;
  data: string;
  validityDays: number;
  usageLabel: string;
}) {
  const flag = getDestinationFlag(country);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-6 text-white">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-90px] right-[-90px] h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl shadow-blue-950/30">
        <div className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-800" />
        <div className="absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-800" />

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                DALO Travel Match
              </div>

              <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Destination detected
              </h3>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              Best match
            </div>
          </div>

          <div className="my-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🏠
            </div>

            <div className="h-px flex-1 border-t-2 border-dashed border-blue-300" />

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
              ✈️
            </div>

            <div className="h-px flex-1 border-t-2 border-dashed border-blue-300" />

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              {flag}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-500">From</div>
              <div className="mt-1 text-xl font-black">Home</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-slate-500">To</div>
              <div className="mt-1 text-xl font-black">
                {flag} {country}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-5">
            <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Matched usage profile
            </div>

            <div className="mt-2 text-2xl font-black text-slate-950">
              {usageLabel}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Your selected destination, trip length and phone usage were used
              to find the strongest available eSIM match.
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                ✓
              </div>

              <div>
                <div className="font-black text-slate-950">
                  QR code after purchase
                </div>
                <div className="text-sm font-medium text-slate-500">
                  Activation details appear after checkout.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            <span>Digital delivery</span>
            <span>Ready for checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
