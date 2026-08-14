

const BusHero = ({ searchQuery, onSearchQueryChange, onSearch }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();

    requestAnimationFrame(() => {
      document.getElementById("bus-routes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-16 md:px-12 md:py-20">
      
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center mt-20">
        <span className="mb-4 inline-block rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
          VinBus Network
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Khám phá mạng lưới
          <span className="block text-emerald-400 mt-1">
            Xe VinBus
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
          Tìm kiếm tuyến xe, khám phá lộ trình và xem thông tin
          chi tiết của các tuyến VinBus.
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
          <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
            
            <div className="flex flex-1 items-center gap-3 px-4">
              <svg
                className="h-5 w-5 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Tìm tuyến xe, điểm đi hoặc điểm đến..."
                className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500 md:text-base"
              />
            </div>

            <button type="submit" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Tìm kiếm
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Ví dụ: E01, Mỹ Đình, Ocean Park...
          </p>
        </form>
      </div>
    </section>
  );
};

export default BusHero;
