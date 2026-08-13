// import RouteInfo from "./RouteInfo";
// import RouteStops from "./RouteStops";
// import DepartureTimes from "./DepartureTimes";
// import Reviews from "./Reviews";
import RouteTabs from '../components/RouteTabs'

const RouteDetail = ({ route, onBack }) => {
  if (!route) return null;

  return (
    <section className="container mx-auto mt-8 overflow-hidder border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="relative overflow-hidden px-6 py-8 md:px-10 md:py-10 mt-10">

        {/* Decorative glow */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">

          {/* Back */}
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Quay lại danh sách
          </button>

          {/* Route heading */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-400 px-3 py-1.5 text-sm font-bold text-slate-950">
                  {route.id}
                </span>

                <span className="text-sm font-medium text-emerald-300">
                  {route.operator}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-green-500 md:text-5xl">
                {route.name}
              </h1>

              {/* Start → End */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span>{route.outbound.start}</span>

                <svg
                  className="h-4 w-4 text-emerald-400"
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

                <span>{route.outbound.end}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="text-xl text-yellow-400">★</span>

                <span className="text-lg font-bold text-green-500">
                  {route.rating ?? "—"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {route.reviewCount ?? 0} đánh giá
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="p-6 md:p-10">
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-400">
           {/* <RouteInfo route={route} />
           <RouteStops route={route} />
           <DepartureTimes route={route} />
           <Reviews route={route} /> */}
           <RouteTabs route={route} />
          </p>
        </div>
      </div>

    </section>
  );
};

export default RouteDetail;