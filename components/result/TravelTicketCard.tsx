import Image from "next/image";
import { getDestinationImage } from "../../lib/destination-images";

export default function TravelTicketCard({
  country,
  planName,
  data,
  validityDays,
  usageLabel,
}: {
  country: string;
  planName: string;
  data: string;
  validityDays: number;
  usageLabel: string;
}) {
  const destinationImage = getDestinationImage(country);

  return (
    <div className="relative flex h-full min-h-[400px] overflow-hidden bg-[#0b2750] p-5 text-white">
      <Image
        src={destinationImage}
        alt={`${country} travel destination`}
        fill
        preload
        quality={72}
        sizes="(max-width: 1023px) 100vw, 42vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,25,55,.06),rgba(7,25,55,.38)_48%,rgba(7,25,55,.94)_100%)]" />
      <div className="absolute left-6 top-6 rounded-full border border-white/35 bg-[#08254d]/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-md">
        DALO travel match
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/35 bg-white/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#1738a0] backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-cyan-500" />
        Live match
      </div>

      <div className="relative mt-auto w-full">
        <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-white/75">
          <span>Home</span>
          <span className="h-px flex-1 border-t border-dashed border-white/50" />
          <span>{country}</span>
        </div>

        <h3 className="max-w-sm text-4xl font-black tracking-[-0.045em]">
          Ready for {country}.
        </h3>
        <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-white/80">
          One clear recommendation, matched to your trip and how you travel.
        </p>

        <div className="mt-5 rounded-[1.35rem] border border-white/25 bg-[#08254d]/72 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                Recommended plan
              </p>
              <h4 className="mt-1 text-lg font-bold">{planName}</h4>
            </div>
            <span className="rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#08254d]">
              Best fit
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-white/20 text-center">
            <div className="px-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-white/55">Data</p>
              <p className="mt-1 text-sm font-black">{data}</p>
            </div>
            <div className="px-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-white/55">Validity</p>
              <p className="mt-1 text-sm font-black">{validityDays} days</p>
            </div>
            <div className="px-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-white/55">Usage</p>
              <p className="mt-1 truncate text-sm font-black">{usageLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
