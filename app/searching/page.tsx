"use client";

import Image from "next/image";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchingContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/result?${params.toString()}`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, params]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F8FF] px-6">
      <div className="max-w-xl text-center">
        <Image
          src="/dalo-logo-horizontal.png"
          alt="DALO"
          width={160}
          height={80}
          className="mx-auto mb-10 h-20 w-auto"
          priority
        />

        <div className="mx-auto mb-10 h-24 w-24 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

        <h1 className="mb-6 text-4xl font-bold text-slate-900">
          Finding your perfect eSIM...
        </h1>

        <div className="space-y-4 text-lg text-slate-600">
          <div>✓ Checking destination coverage</div>
          <div>✓ Analyzing travel duration</div>
          <div>✓ Matching usage profile</div>
          <div>✓ Comparing available plans</div>
        </div>

        <p className="mt-10 text-slate-500">
          Your recommendation will be ready in a moment.
        </p>
      </div>
    </main>
  );
}

export default function SearchingPage() {
  return (
    <Suspense fallback={null}>
      <SearchingContent />
    </Suspense>
  );
}
