const RouteInfo = ({ route }) => {
  const operatingHours = route.operatingHours
    ? `${route.operatingHours.start} - ${route.operatingHours.end}`
    : "Đang cập nhật";

  const infoItems = [
    {
      label: "Giá vé",
      value: route.ticketPrice || "Đang cập nhật",
      icon: "₫",
    },
    {
      label: "Độ dài tuyến",
      value: `${route.distance ?? 0} km`,
      icon: "↔",
    },
    {
      label: "Thời gian chạy",
      value: route.travelTime || "Đang cập nhật",
      icon: "◷",
    },
    {
      label: "Thời gian hoạt động",
      value: operatingHours,
      icon: "◴",
    },
    {
      label: "Giãn cách tuyến",
      value:
        route.frequency > 0
          ? `${route.frequency} phút`
          : "Đang cập nhật",
      icon: "↻",
    },
    {
      label: "Số chuyến / ngày",
      value:
        route.tripsPerDay > 0
          ? route.tripsPerDay
          : "Đang cập nhật",
      icon: "▣",
    },
  ];

  return (
    <section className="p-6 md:p-10">
      {/* Heading */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          Thông tin tuyến
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Thông tin vận hành
        </h2>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="group rounded-2xl border border-slate-100 bg-green-200 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-green-400"
          >
            {/* Icon */}
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-semibold text-emerald-500 shadow-sm">
              {item.icon}
            </div>

            {/* Label */}
            <p className="mt-4 text-xl font-semibold text-slate-400">
              {item.label}
            </p>

            {/* Value */}
            <p className="mt-1 text-base font-bold leading-6 text-slate-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Operator */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-green-300 px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            Đơn vị vận hành
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {route.operator || "VinBus"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Đang hoạt động
        </span>
      </div>
    </section>
  );
};

export default RouteInfo;