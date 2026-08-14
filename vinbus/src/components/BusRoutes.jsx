import BusRouteCard from "./BusRouteCard";
import {VinBusRoute} from '../index'

const BusRoutes = ({ searchQuery, onSelectRoute, onClearSearch }) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRoutes = VinBusRoute.filter((route) => {
    if (!normalizedQuery) return true;

    const matchesRouteInfo = [
      route.id,
      route.name,
      route.outbound.start,
      route.outbound.end,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));

    const matchesStops = [route.outbound?.stops, route.inbound?.stops].some(
      (stops) =>
        Array.isArray(stops) &&
        stops.some((stop) => stop.toLowerCase().includes(normalizedQuery))
    );

    return matchesRouteInfo || matchesStops;
  });
  
  return (
    <section id="bus-routes" className="mt-16 container mx-auto">
      {/* Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end mt-[100px]">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Bus Network
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Các tuyến xe bus
          </h2>

          <p className="mt-3 max-w-xl text-slate-500">
            Khám phá thông tin và lộ trình của các tuyến VinBus.
          </p>
        </div>

        <span className="text-sm font-medium text-slate-400">
          {filteredRoutes.length} / {VinBusRoute.length} tuyến
        </span>
      </div>

      {/* Cards */}
      {filteredRoutes.length > 0 ? (
      <div className="grid gap-5 md:grid-cols-2">
        {filteredRoutes.map((route) => (
          <BusRouteCard
            key={route.id}
            route={route}
            onClick={() => onSelectRoute(route)}
          />
        ))}
      </div>
      ) : (
        <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="text-lg font-semibold text-slate-800">
              Không tìm thấy tuyến xe phù hợp
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử lại với một từ khóa khác.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Xóa tìm kiếm
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BusRoutes;
