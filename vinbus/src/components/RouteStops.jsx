import { useState } from "react";

const RouteStops = ({ route }) => {
  const [direction, setDirection] = useState("outbound");

  const currentRoute =
    direction === "outbound"
      ? route.outbound
      : route.inbound;

  const stops = [...(currentRoute?.stops || [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <section className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Route
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Lộ trình tuyến
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {stops.length} điểm dừng 🚍 {currentRoute?.start} →{" "}
            {currentRoute?.end}
          </p>
        </div>

        {/* Direction switch */}
        <div className="flex w-fit rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setDirection("outbound")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              direction === "outbound"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Chiều đi
          </button>

          <button
            onClick={() => setDirection("inbound")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              direction === "inbound"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Chiều về
          </button>
        </div>
      </div>

      {/* Route summary */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
        {/* Start */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Điểm đầu
            </p>

            <p className="truncate font-semibold text-slate-800">
              {currentRoute?.start}
            </p>
          </div>
        </div>

        {/* Line */}
        <div className="hidden h-px flex-1 bg-slate-200 sm:block" />

        {/* End */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Điểm cuối
            </p>

            <p className="truncate font-semibold text-slate-800">
              {currentRoute?.end}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
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
      </div>

      {/* Stops */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="max-h-[520px] overflow-y-auto p-5 md:p-7">
          {stops.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Chưa có thông tin điểm dừng.
            </p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute bottom-5 left-[11px] top-5 w-px bg-slate-200" />

              <div className="space-y-0">
                {stops.map((stop, index) => {
                  const isFirst = index === 0;
                  const isLast = index === stops.length - 1;

                  return (
                    <div
                      key={`${direction}-${stop.order}`}
                      className="group relative flex gap-5"
                    >
                      {/* Timeline point */}
                      <div className="relative z-10 flex w-6 shrink-0 justify-center">
                        <div
                          className={`mt-1.5 rounded-full border-4 border-white transition-all ${
                            isFirst
                              ? "h-4 w-4 bg-emerald-500 ring-4 ring-emerald-100"
                              : isLast
                                ? "h-4 w-4 bg-slate-900 ring-4 ring-slate-100"
                                : "h-3 w-3 bg-slate-300 group-hover:bg-emerald-400"
                          }`}
                        />
                      </div>

                      {/* Stop content */}
                      <div
                        className={`min-w-0 flex-1 ${
                          isLast ? "pb-2" : "pb-6"
                        }`}
                      >
                        <div
                          className={`rounded-xl px-4 py-3 transition-colors ${
                            isFirst
                              ? "bg-emerald-50"
                              : isLast
                                ? "bg-slate-100"
                                : "hover:bg-slate-50"
                          }`}
                        >
                          <p
                            className={`text-sm leading-6 ${
                              isFirst || isLast
                                ? "font-semibold text-slate-900"
                                : "text-slate-600"
                            }`}
                          >
                            {stop.name}
                          </p>

                          {isFirst && (
                            <span className="mt-1 block text-xs font-medium text-emerald-600">
                              Điểm xuất phát
                            </span>
                          )}

                          {isLast && (
                            <span className="mt-1 block text-xs font-medium text-slate-500">
                              Điểm kết thúc
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RouteStops;