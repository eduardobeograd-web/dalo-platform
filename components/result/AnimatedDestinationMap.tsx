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

function getMapPosition(destination: string) {
  const positions: Record<string, { left: string; top: string }> = {
    Europe: { left: "50%", top: "40%" },
    Spain: { left: "47%", top: "45%" },
    Italy: { left: "52%", top: "46%" },
    France: { left: "49%", top: "42%" },
    Germany: { left: "51%", top: "39%" },
    Portugal: { left: "45%", top: "45%" },
    Greece: { left: "55%", top: "48%" },
    Turkey: { left: "59%", top: "47%" },
    Switzerland: { left: "51%", top: "43%" },
    Austria: { left: "53%", top: "42%" },
    Netherlands: { left: "50%", top: "37%" },
    Croatia: { left: "54%", top: "45%" },
    Serbia: { left: "55%", top: "46%" },
    Montenegro: { left: "55%", top: "47%" },
    Albania: { left: "55%", top: "48%" },
    Japan: { left: "82%", top: "43%" },
    Thailand: { left: "72%", top: "58%" },
    "United States": { left: "22%", top: "43%" },
    "United States of America": { left: "22%", top: "43%" },
    "United Kingdom": { left: "47%", top: "37%" },
    Dubai: { left: "62%", top: "53%" },
    "United Arab Emirates": { left: "62%", top: "53%" },
  };

  return positions[destination] || { left: "50%", top: "40%" };
}

export default function AnimatedDestinationMap({
  country,
  fitLabel,
}: {
  country: string;
  fitLabel: string;
}) {
  const position = getMapPosition(country);
  const flag = getDestinationFlag(country);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.35),transparent_32%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.2),transparent_35%)]" />

      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <img
        src="/world-map.jpg"
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[42%] w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-75 invert brightness-0"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/45" />

      <div className="absolute left-6 top-6 z-20 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-blue-50 ring-1 ring-white/20 backdrop-blur">
        Destination detected
      </div>

      <div
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
        style={{ left: position.left, top: position.top }}
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-cyan-300/35" />
          <div className="absolute h-14 w-14 animate-pulse rounded-full bg-blue-300/35" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-2xl shadow-cyan-300/40 ring-4 ring-cyan-300/40">
            {flag}
          </div>
        </div>
      </div>

      <div className="absolute left-[14%] top-[66%] h-px w-[72%] origin-left rotate-[-20deg] bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-45" />
      <div className="absolute left-[18%] top-[34%] h-px w-[66%] origin-left rotate-[14deg] bg-gradient-to-r from-transparent via-white to-transparent opacity-25" />

      <div className="absolute bottom-6 left-6 right-6 z-20 rounded-[2rem] bg-white/95 p-5 text-slate-950 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Your destination
            </div>

            <div className="mt-1 text-3xl font-black">
              {flag} {country}
            </div>
          </div>

          <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            Best match found
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <div className="text-sm font-semibold text-slate-500">
            Recommended for
          </div>

          <div className="mt-1 font-bold text-slate-950">{fitLabel}</div>
        </div>
      </div>
    </div>
  );
}
