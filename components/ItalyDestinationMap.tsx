import Image from "next/image";

export default function ItalyDestinationMap() {
  return (
    <div className="relative min-h-[300px] overflow-hidden bg-[#e9f7ff] sm:min-h-[360px] lg:min-h-full">
      <Image
        src="/destination-maps/italy.svg"
        alt="Map of southern Europe with Italy highlighted and Rome marked"
        fill
        unoptimized
        sizes="(max-width: 1023px) 100vw, 470px"
        className="object-cover"
      />

      <div className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-blue-800 shadow-sm backdrop-blur-md sm:right-5 sm:top-5 sm:text-xs">
        Italy · destination ready
      </div>

      <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_16px_38px_rgba(30,64,120,0.16)] backdrop-blur-md sm:inset-x-5 sm:bottom-5">
        {[
          ["Local", "Rome · CET"],
          ["Currency", "Euro · EUR"],
          ["Emergency", "112"],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`min-w-0 px-2 py-3 sm:px-4 sm:py-4 ${
              index < 2 ? "border-r border-slate-200" : ""
            }`}
          >
            <p className="truncate text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">
              {label}
            </p>
            <p
              className={`mt-1 truncate text-xs font-black sm:text-sm ${
                label === "Emergency" ? "text-orange-700" : "text-slate-950"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
