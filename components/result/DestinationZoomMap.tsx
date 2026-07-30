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
    Australia: "🇦🇺",
    Canada: "🇨🇦",
    Brazil: "🇧🇷",
    Mexico: "🇲🇽",
    India: "🇮🇳",
    Indonesia: "🇮🇩",
    Malaysia: "🇲🇾",
    Singapore: "🇸🇬",
    China: "🇨🇳",
    "Korea-Republic of": "🇰🇷",
    "VietNam": "🇻🇳",
    Philippines: "🇵🇭",
    Egypt: "🇪🇬",
    Morocco: "🇲🇦",
    "South Africa": "🇿🇦",
    "New Zealand": "🇳🇿",
  };

  return flags[destination] || "🌍";
}

function getMapPosition(destination: string) {
  const positions: Record<string, { left: string; top: string; zoom: number }> = {
    Europe: { left: "50%", top: "40%", zoom: 1 },
    Spain: { left: "47%", top: "34%", zoom: 1 },
    Italy: { left: "52%", top: "46%", zoom: 1 },
    France: { left: "49%", top: "42%", zoom: 1 },
    Germany: { left: "51%", top: "39%", zoom: 1 },
    Portugal: { left: "45%", top: "45%", zoom: 1 },
    Greece: { left: "55%", top: "48%", zoom: 1 },
    Turkey: { left: "59%", top: "47%", zoom: 1 },
    Switzerland: { left: "51%", top: "43%", zoom: 1 },
    Austria: { left: "53%", top: "42%", zoom: 1 },
    Netherlands: { left: "50%", top: "37%", zoom: 1 },
    Croatia: { left: "54%", top: "45%", zoom: 1 },
    Serbia: { left: "55%", top: "46%", zoom: 1 },
    Montenegro: { left: "55%", top: "47%", zoom: 1 },
    Albania: { left: "55%", top: "48%", zoom: 1 },
    Japan: { left: "82%", top: "43%", zoom: 1 },
    Thailand: { left: "72%", top: "58%", zoom: 1 },
    "United States": { left: "22%", top: "43%", zoom: 1 },
    "United States of America": { left: "22%", top: "43%", zoom: 1 },
    "United Kingdom": { left: "47%", top: "37%", zoom: 1 },
    Dubai: { left: "62%", top: "53%", zoom: 1 },
    "United Arab Emirates": { left: "62%", top: "53%", zoom: 1 },
    Australia: { left: "81%", top: "73%", zoom: 1 },
    Canada: { left: "22%", top: "31%", zoom: 1 },
    Brazil: { left: "35%", top: "69%", zoom: 1 },
    Mexico: { left: "24%", top: "53%", zoom: 1 },
    India: { left: "67%", top: "54%", zoom: 1 },
    Indonesia: { left: "76%", top: "66%", zoom: 1 },
    Malaysia: { left: "73%", top: "63%", zoom: 1 },
    Singapore: { left: "73%", top: "65%", zoom: 1 },
    China: { left: "74%", top: "45%", zoom: 1 },
    "Korea-Republic of": { left: "79%", top: "43%", zoom: 1 },
    VietNam: { left: "74%", top: "57%", zoom: 1 },
    Philippines: { left: "79%", top: "59%", zoom: 1 },
    Egypt: { left: "57%", top: "52%", zoom: 1 },
    Morocco: { left: "46%", top: "51%", zoom: 1 },
    "South Africa": { left: "55%", top: "78%", zoom: 1 },
    "New Zealand": { left: "89%", top: "82%", zoom: 1 },
  };

  return positions[destination] || { left: "50%", top: "40%", zoom: 1 };
}

export default function DestinationZoomMap({
  country,
  fitLabel,
}: {
  country: string;
  fitLabel: string;
}) {
  const flag = getDestinationFlag(country);
  const position = getMapPosition(country);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes daloMapZoom {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.45;
          }
          45% {
            opacity: 0.72;
          }
          100% {
            transform: translate(-50%, -50%) scale(var(--dalo-zoom));
            opacity: 0.78;
          }
        }

        @keyframes daloMarkerIn {
          0%, 45% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes daloPanelIn {
          0%, 55% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dalo-map-image {
          animation: daloMapZoom 2.2s ease-out forwards;
          transform-origin: var(--dalo-left) var(--dalo-top);
        }

        .dalo-map-marker {
          animation: daloMarkerIn 2.3s ease-out forwards;
        }

        .dalo-map-panel {
          animation: daloPanelIn 2.5s ease-out forwards;
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.35),transparent_32%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.18),transparent_35%)]" />

      <img
        src="/world-map.webp"
        alt=""
        aria-hidden="true"
        className="dalo-map-image absolute left-1/2 top-[42%] w-[95%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-[2rem] object-contain opacity-75 grayscale contrast-125 brightness-110"
        style={
          {
            "--dalo-left": position.left,
            "--dalo-top": position.top,
            "--dalo-zoom": position.zoom,
          } as React.CSSProperties
        }
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/5 via-blue-950/10 to-slate-950/65" />

      <div className="absolute left-6 top-6 z-20 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-blue-50 ring-1 ring-white/20 backdrop-blur">
        Destination detected
      </div>

      <div
        className="dalo-map-marker absolute z-30"
        style={{ left: position.left, top: position.top }}
      >
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-cyan-300/35" />
          <div className="absolute h-16 w-16 animate-pulse rounded-full bg-blue-300/40" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-2xl shadow-cyan-300/40 ring-4 ring-cyan-300/40">
            {flag}
          </div>
        </div>
      </div>

      <div className="absolute left-[10%] top-[62%] h-px w-[80%] origin-left rotate-[-19deg] bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-45" />
      <div className="absolute left-[16%] top-[32%] h-px w-[72%] origin-left rotate-[13deg] bg-gradient-to-r from-transparent via-white to-transparent opacity-25" />

      <div className="dalo-map-panel absolute bottom-6 left-6 right-6 z-20 rounded-[2rem] bg-white/95 p-5 text-slate-950 shadow-2xl backdrop-blur">
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
