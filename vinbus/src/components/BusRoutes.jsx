import BusRouteCard from "./BusRouteCard";
import {VinBusRoute} from '../index'

const BusRoutes = ({ onSelectRoute }) => {
  return (
    <section className="mt-16 container mx-auto">
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
          {VinBusRoute.length} tuyến
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {VinBusRoute.map((route) => (
          <BusRouteCard
            key={route.id}
            route={route}
            onClick={() => onSelectRoute(route)}
          />
        ))}
      </div>
    </section>
  );
};

export default BusRoutes;