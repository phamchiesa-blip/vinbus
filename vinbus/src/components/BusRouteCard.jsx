const BusRouteCard = ({ route, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl mb-10"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
            {route.id}
          </span>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            {route.name}
          </h3>
        </div>

        {/* Arrow */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-emerald-50">
          <svg
            className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-6-6 6 6-6 6"
            />
          </svg>
        </div>
      </div>

      {/* Route */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />

        <span className="truncate text-sm font-medium text-slate-700">
          {route.outbound.start}
        </span>

        <div className="h-px flex-1 bg-slate-200" />

        <div className="h-3 w-3 shrink-0 rounded-full bg-slate-400" />

        <span className="truncate text-sm font-medium text-slate-700">
          {route.outbound.end}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400">
            Khoảng cách
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {route.distance} km
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400">
            Thời gian chạy
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {route.travelTime}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-yellow-400">★</span>

        <span className="font-semibold text-slate-800">
          {route.rating}
        </span>

        <span className="text-slate-400">
          ({route.reviewCount} đánh giá)
        </span>
      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {route.ticketPrice}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {route.frequency} phút/chuyến
          </p>
        </div>

        <span className="text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1">
          Chi tiết →
        </span>
      </div>
    </article>
  );
};

export default BusRouteCard;