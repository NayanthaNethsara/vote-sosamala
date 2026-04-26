import Image from "next/image";

export function AuruduBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,220,140,0.12),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(255,200,110,0.08),transparent_32%),linear-gradient(180deg,rgba(255,224,163,0.04),transparent_42%)]" />
      <div className="absolute inset-0 opacity-10 mix-blend-soft-light bg-[url('/landing-page/noise.svg')]" />

      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute -left-28 -top-24 w-72 -rotate-12 opacity-50 blur-[1px] sm:w-100"
      />
      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute left-[14%] top-[10%] w-72 rotate-6 opacity-50 blur-[1px] sm:w-100"
      />
      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute right-[10%] top-[16%] w-72 -rotate-6 opacity-50 blur-[1px] sm:w-100"
      />
      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-50 blur-[1px] sm:w-100"
      />
      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute bottom-[14%] left-[8%] w-72 rotate-45 opacity-50 blur-[1px] sm:w-100"
      />
      <Image
        src="/mandala/mandala-light-gold.svg"
        alt=""
        width={400}
        height={400}
        className="absolute -bottom-28 -right-28 w-72 -rotate-45 opacity-50 blur-[1px] sm:w-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,8,15,0.12)_0%,rgba(36,8,15,0.34)_100%)]" />
    </div>
  );
}
