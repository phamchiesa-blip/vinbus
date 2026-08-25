import { useEffect, useState } from "react";
import RouteTabs from "../components/RouteTabs";

const RouteDetail = ({ route, onBack }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [routeDetail, setRouteDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRouteDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/routes/${route._id}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Không thể tải thông tin tuyến"
          );
        }

        setRouteDetail(result.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (route?._id) {
      fetchRouteDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (!route) return null;

  // Loading
  if (loading) {
    return (
      <section className="container mx-auto mt-8 px-6 md:px-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

            <p className="mt-4 text-sm text-slate-400">
              Đang tải thông tin tuyến...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error
  if (error) {
    return (
      <section className="container mx-auto mt-8 px-6 md:px-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-600">
            Không thể tải thông tin tuyến
          </p>

          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>

          <button
            onClick={onBack}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </section>
    );
  }

  if (!routeDetail) return null;

  return (
    <section className="container mx-auto mt-8 overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="relative mt-10 overflow-hidden px-6 py-8 md:px-10 md:py-10">

        {/* Decorative glow */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">

          {/* Back */}
          <button
            onClick={onBack}
            className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-500"
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
                <span className="rounded-xl bg-emerald-400 px-3 py-1.5 text-sm font-bold text-slate-700">
                  {routeDetail.routeNumber}
                </span>

                <span className="text-sm font-medium text-slate-500">
                  {routeDetail.operator}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                {routeDetail.name}
              </h1>

              {/* Start → End */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{routeDetail.outbound.start}</span>

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

                <span>{routeDetail.outbound.end}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl text-yellow-400">
                  ★
                </span>

                <span className="text-lg font-bold text-slate-900">
                  {routeDetail.rating.toFixed(1) ?? "—"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {routeDetail.reviewCount ?? 0} đánh giá
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <RouteTabs route={routeDetail} />
    </section>
  );
};

export default RouteDetail;