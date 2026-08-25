import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import {
  createAdminRoute,
  updateAdminRoute,
} from "../services/adminRouteService";

const emptyRoute = {
  routeNumber: "",
  name: "",
  type: "electric",
  operator: "VinBus",
  description: "",
  ticketPrice: "",
  distance: 0,
  travelTime: "",
  frequency: 0,
  tripsPerDay: 0,

  outbound: {
    start: "",
    end: "",
    stops: [],
  },

  inbound: {
    start: "",
    end: "",
    stops: [],
  },

  operatingHours: {
    start: "",
    end: "",
  },

  departureTimes: {
    outbound: [],
    inbound: [],
  },

  images: [],
};

const AdminRouteForm = ({
  route = null,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(route);

  const [formData, setFormData] = useState(emptyRoute);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD DATA KHI EDIT
  // =========================

  useEffect(() => {
    if (route) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        routeNumber: route.routeNumber || "",
        name: route.name || "",
        type: route.type || "electric",
        operator: route.operator || "VinBus",
        description: route.description || "",
        ticketPrice: route.ticketPrice || "",
        distance: route.distance || 0,
        travelTime: route.travelTime || "",
        frequency: route.frequency || 0,
        tripsPerDay: route.tripsPerDay || 0,

        outbound: {
          start: route.outbound?.start || "",
          end: route.outbound?.end || "",
          stops: route.outbound?.stops || [],
        },

        inbound: {
          start: route.inbound?.start || "",
          end: route.inbound?.end || "",
          stops: route.inbound?.stops || [],
        },

        operatingHours: {
          start: route.operatingHours?.start || "",
          end: route.operatingHours?.end || "",
        },

        departureTimes: {
          outbound: route.departureTimes?.outbound || [],
          inbound: route.departureTimes?.inbound || [],
        },

        images: route.images || [],
      });
    } else {
      setFormData(emptyRoute);
    }
  }, [route]);

  // =========================
  // BASIC INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OUTBOUND / INBOUND
  // =========================

  const handleDirectionChange = (
    direction,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [direction]: {
        ...prev[direction],
        [field]: value,
      },
    }));
  };

  // =========================
  // STOPS
  // =========================

  const addStop = (direction) => {
    setFormData((prev) => ({
      ...prev,
      [direction]: {
        ...prev[direction],
        stops: [
          ...prev[direction].stops,
          {
            name: "",
            order: prev[direction].stops.length + 1,
          },
        ],
      },
    }));
  };

  const updateStop = (
    direction,
    index,
    field,
    value
  ) => {
    setFormData((prev) => {
      const stops = [...prev[direction].stops];

      stops[index] = {
        ...stops[index],
        [field]:
          field === "order"
            ? Number(value)
            : value,
      };

      return {
        ...prev,
        [direction]: {
          ...prev[direction],
          stops,
        },
      };
    });
  };

  const removeStop = (direction, index) => {
    setFormData((prev) => {
      const stops = prev[direction].stops
        .filter((_, i) => i !== index)
        .map((stop, i) => ({
          ...stop,
          order: i + 1,
        }));

      return {
        ...prev,
        [direction]: {
          ...prev[direction],
          stops,
        },
      };
    });
  };

  // =========================
  // DEPARTURE TIMES
  // =========================

  const addDepartureTime = (direction) => {
    setFormData((prev) => ({
      ...prev,
      departureTimes: {
        ...prev.departureTimes,
        [direction]: [
          ...prev.departureTimes[direction],
          "",
        ],
      },
    }));
  };

  const updateDepartureTime = (
    direction,
    index,
    value
  ) => {
    setFormData((prev) => {
      const times = [
        ...prev.departureTimes[direction],
      ];

      times[index] = value;

      return {
        ...prev,
        departureTimes: {
          ...prev.departureTimes,
          [direction]: times,
        },
      };
    });
  };

  const removeDepartureTime = (
    direction,
    index
  ) => {
    setFormData((prev) => ({
      ...prev,
      departureTimes: {
        ...prev.departureTimes,
        [direction]: prev.departureTimes[
          direction
        ].filter((_, i) => i !== index),
      },
    }));
  };

  // =========================
  // OPERATING HOURS
  // =========================

  const handleOperatingHoursChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [field]: value,
      },
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validate cơ bản
    if (
      !formData.routeNumber.trim() ||
      !formData.name.trim()
    ) {
      setError(
        "Vui lòng nhập số tuyến và tên tuyến."
      );
      return;
    }

    if (
      !formData.outbound.start.trim() ||
      !formData.outbound.end.trim() ||
      !formData.inbound.start.trim() ||
      !formData.inbound.end.trim()
    ) {
      setError(
        "Vui lòng nhập đầy đủ điểm đầu và điểm cuối."
      );
      return;
    }

    try {
      setLoading(true);

      // Convert các field number
      const data = {
        ...formData,

        distance: Number(formData.distance) || 0,
        frequency: Number(formData.frequency) || 0,
        tripsPerDay:
          Number(formData.tripsPerDay) || 0,
      };

      let result;

      if (isEditing) {
        result = await updateAdminRoute(
          route._id,
          data
        );
      } else {
        result = await createAdminRoute(data);
      }

      console.log(
        isEditing
          ? "Updated route:"
          : "Created route:",
        result
      );

      if (onSuccess) {
        await onSuccess(result);
      }

      onClose();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Không thể lưu tuyến xe."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER STOPS
  // =========================

  const renderStops = (direction, title) => {
    const stops = formData[direction].stops;

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {title}
          </h3>

          <button
            type="button"
            onClick={() => addStop(direction)}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Thêm điểm
          </button>
        </div>

        <div className="mt-4 space-y-3">

          {stops.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có điểm dừng.
            </p>
          )}

          {stops.map((stop, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                {index + 1}
              </span>

              <input
                type="text"
                value={stop.name}
                onChange={(e) =>
                  updateStop(
                    direction,
                    index,
                    "name",
                    e.target.value
                  )
                }
                placeholder="Tên điểm dừng"
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  removeStop(direction, index)
                }
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

        </div>
      </div>
    );
  };

  // =========================
  // RENDER DEPARTURE TIMES
  // =========================

  const renderDepartureTimes = (
    direction,
    title
  ) => {
    const times =
      formData.departureTimes[direction];

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {title}
          </h3>

          <button
            type="button"
            onClick={() =>
              addDepartureTime(direction)
            }
            disabled={loading}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Thêm giờ
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">

          {times.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có giờ xuất phát.
            </p>
          )}

          {times.map((time, index) => (
            <div
              key={index}
              className="flex items-center gap-1"
            >
              <input
                type="time"
                value={time}
                onChange={(e) =>
                  updateDepartureTime(
                    direction,
                    index,
                    e.target.value
                  )
                }
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />

              <button
                type="button"
                onClick={() =>
                  removeDepartureTime(
                    direction,
                    index
                  )
                }
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">

      <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
              Admin Panel
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isEditing
                ? "Chỉnh sửa tuyến xe"
                : "Thêm tuyến xe"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-6 md:p-8"
        >

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ===================== */}
          {/* BASIC INFO */}
          {/* ===================== */}

          <section>
            <h3 className="text-lg font-bold text-slate-900">
              Thông tin cơ bản
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <Input
                label="Số tuyến *"
                name="routeNumber"
                value={formData.routeNumber}
                onChange={handleChange}
                placeholder="Ví dụ: E01"
              />

              <Input
                label="Tên tuyến *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Mỹ Đình - Bờ Hồ"
              />

              <Input
                label="Đơn vị vận hành"
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                placeholder="VinBus"
              />

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Loại xe
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-400"
                >
                  <option value="electric">
                    Xe điện
                  </option>

                  <option value="normal">
                    Xe thường
                  </option>
                </select>
              </div>

            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">
                Mô tả
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả về tuyến xe..."
                disabled={loading}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </section>

          {/* ===================== */}
          {/* OPERATION */}
          {/* ===================== */}

          <section>
            <h3 className="text-lg font-bold text-slate-900">
              Thông tin vận hành
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">

              <Input
                label="Giá vé"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="Ví dụ: 8.000đ"
              />

              <Input
                label="Khoảng cách (km)"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleChange}
              />

              <Input
                label="Thời gian di chuyển"
                name="travelTime"
                value={formData.travelTime}
                onChange={handleChange}
                placeholder="Ví dụ: 45 phút"
              />

              <Input
                label="Tần suất (phút)"
                name="frequency"
                type="number"
                value={formData.frequency}
                onChange={handleChange}
              />

              <Input
                label="Số chuyến/ngày"
                name="tripsPerDay"
                type="number"
                value={formData.tripsPerDay}
                onChange={handleChange}
              />

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Giờ hoạt động
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    type="time"
                    value={
                      formData.operatingHours.start
                    }
                    onChange={(e) =>
                      handleOperatingHoursChange(
                        "start",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  />

                  <input
                    type="time"
                    value={
                      formData.operatingHours.end
                    }
                    onChange={(e) =>
                      handleOperatingHoursChange(
                        "end",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* ===================== */}
          {/* ROUTE */}
          {/* ===================== */}

          <section>
            <h3 className="text-lg font-bold text-slate-900">
              Lộ trình
            </h3>

            <div className="mt-4 grid gap-5">

              {/* OUTBOUND */}

              <div className="rounded-2xl border border-slate-200 p-5">

                <h3 className="font-bold text-emerald-600">
                  Chiều đi
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  <Input
                    label="Điểm đầu *"
                    value={formData.outbound.start}
                    onChange={(e) =>
                      handleDirectionChange(
                        "outbound",
                        "start",
                        e.target.value
                      )
                    }
                    placeholder="Điểm xuất phát"
                  />

                  <Input
                    label="Điểm cuối *"
                    value={formData.outbound.end}
                    onChange={(e) =>
                      handleDirectionChange(
                        "outbound",
                        "end",
                        e.target.value
                      )
                    }
                    placeholder="Điểm đến"
                  />

                </div>

                <div className="mt-5">
                  {renderStops(
                    "outbound",
                    "Điểm dừng chiều đi"
                  )}
                </div>

              </div>

              {/* INBOUND */}

              <div className="rounded-2xl border border-slate-200 p-5">

                <h3 className="font-bold text-blue-600">
                  Chiều về
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  <Input
                    label="Điểm đầu *"
                    value={formData.inbound.start}
                    onChange={(e) =>
                      handleDirectionChange(
                        "inbound",
                        "start",
                        e.target.value
                      )
                    }
                    placeholder="Điểm xuất phát"
                  />

                  <Input
                    label="Điểm cuối *"
                    value={formData.inbound.end}
                    onChange={(e) =>
                      handleDirectionChange(
                        "inbound",
                        "end",
                        e.target.value
                      )
                    }
                    placeholder="Điểm đến"
                  />

                </div>

                <div className="mt-5">
                  {renderStops(
                    "inbound",
                    "Điểm dừng chiều về"
                  )}
                </div>

              </div>

            </div>
          </section>

          {/* ===================== */}
          {/* DEPARTURE TIMES */}
          {/* ===================== */}

          <section>
            <h3 className="text-lg font-bold text-slate-900">
              Giờ xuất phát
            </h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2">

              {renderDepartureTimes(
                "outbound",
                "Chiều đi"
              )}

              {renderDepartureTimes(
                "inbound",
                "Chiều về"
              )}

            </div>
          </section>

          {/* ===================== */}
          {/* ACTIONS */}
          {/* ===================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Đang lưu..."
                : isEditing
                  ? "Lưu thay đổi"
                  : "Tạo tuyến"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

// =========================
// REUSABLE INPUT
// =========================

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
};

export default AdminRouteForm;