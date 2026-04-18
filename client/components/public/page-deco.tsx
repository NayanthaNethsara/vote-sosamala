export function GridDecoration() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate overflow-hidden contain-strict"
      >
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(55%_70%_at_50%_0%,rgba(133,255,236,0.22),transparent)] contain-strict" />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 h-full w-full overflow-hidden mask-[radial-gradient(100%_100%_at_top_center,white_30%,transparent_100%)]"
      >
        <div className="absolute inset-0 mx-auto w-full max-w-6xl">
          <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
        </div>

        <div className="absolute inset-y-0 left-4 w-px bg-white/6 md:left-8 lg:left-12" />
        <div className="absolute inset-y-0 right-4 w-px bg-white/6 md:right-8 lg:right-12" />
        <div className="absolute inset-y-0 left-8 w-px bg-white/4 md:left-12 lg:left-20" />
        <div className="absolute inset-y-0 right-8 w-px bg-white/4 md:right-12 lg:right-20" />

        <div className="absolute inset-x-0 top-32 h-px bg-white/10" />
        <div className="absolute inset-x-0 top-64 h-px bg-white/6" />
        <div className="absolute inset-x-0 top-96 h-px bg-white/4" />
      </div>
    </>
  );
}
