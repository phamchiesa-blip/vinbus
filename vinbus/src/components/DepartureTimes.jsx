import { useMemo, useState } from "react";

const DepartureTimes = ({ route }) => {
  const [direction, setDirection] = useState("outbound");

  const times =
    direction === "outbound"
      ? route.departureTimes.outbound
      : route.departureTimes.inbound;

  // Chia giờ thành các khung trong ngày
  const groupedTimes = useMemo(() => {
    const groups = {
      Sáng: [],
      Trưa: [],
      Chiều: [],
      Tối: [],
    };

    times.forEach((time) => {
      const hour = Number(time.split(":")[0]);

      if (hour < 11) {
        groups.Sáng.push(time);
      } else if (hour < 14) {
        groups.Trưa.push(time);
      } else if (hour < 18) {
        groups.Chiều.push(time);
      } else {
        groups.Tối.push(time);
      }
    });

    return groups;
  }, [times]);

  return (
    <section className=" p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Schedule
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Giờ xuất bến
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Lịch khởi hành của tuyến {route.id}
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

      {/* Current route */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
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
              d="M5 12h14m-6-6 6 6-6 6"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-emerald-600">
            {direction === "outbound" ? "Chiều đi" : "Chiều về"}
          </p>

          <p className="truncate text-sm font-semibold text-slate-800">
            {direction === "outbound"
              ? route.outbound.start
              : route.inbound.start}

            <span className="mx-2 text-slate-500">→</span>

            {direction === "outbound"
              ? route.outbound.end
              : route.inbound.end}
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="mt-6 max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 p-5 md:p-7">
        <div className="space-y-8">
          {Object.entries(groupedTimes).map(
            ([period, periodTimes]) => {
              if (periodTimes.length === 0) return null;

              return (
                <div key={period}>
                  {/* Period heading */}
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      {period}
                    </h3>

                    <div className="h-px flex-1 bg-slate-100" />

                    <span className="text-xs text-slate-400">
                      {periodTimes.length} chuyến
                    </span>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {periodTimes.map((time) => (
                      <div
                        key={time}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center text-sm font-semibold text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>
          Tổng cộng{" "}
          <strong className="font-semibold text-slate-600">
            {times.length}
          </strong>{" "}
          chuyến
        </span>

        <span>
          Tần suất trung bình:{" "}
          <strong className="font-semibold text-slate-600">
            {route.frequency} phút
          </strong>
        </span>
      </div>
    </section>
  );
};

export default DepartureTimes;