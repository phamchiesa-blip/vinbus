import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import {
  getAdminRoutes,
  deleteAdminRoute,
} from "../services/adminRouteService";
import AdminRouteForm from "../components/AdminRouteForm";

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // =========================
  // GET ROUTES
  // =========================

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminRoutes();

      setRoutes(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Không thể tải danh sách tuyến."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutes();
  }, []);

  // =========================
  // CREATE
  // =========================

  const handleCreate = () => {
    setEditingRoute(null);
    setShowForm(true);
  };

  // =========================
  // UPDATE
  // =========================

  const handleEdit = (route) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  // =========================
  // FORM SUCCESS
  // =========================

  const handleFormSuccess = async () => {
    await fetchRoutes();
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoute(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (route) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tuyến ${route.routeNumber}?`
    );

    if (!confirmed) return;

    try {
      await deleteAdminRoute(route._id);

      setRoutes((prev) =>
        prev.filter(
          (item) => item._id !== route._id
        )
      );
    } catch (error) {
      alert(
        error.message ||
          "Không thể xóa tuyến xe."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">

          {/* ===================== */}
          {/* HEADER */}
          {/* ===================== */}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
                Admin Panel
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Quản lý tuyến xe
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Thêm, chỉnh sửa hoặc xóa thông tin
                các tuyến VinBus.
              </p>
            </div>

            {/* CREATE */}

            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Thêm tuyến
            </button>

          </div>

          {/* ===================== */}
          {/* ERROR */}
          {/* ===================== */}

          {error && (
            <div className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ===================== */}
          {/* ROUTE LIST */}
          {/* ===================== */}

          {!error && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="divide-y divide-slate-100">

                {routes.map((route) => (
                  <div
                    key={route._id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >

                    {/* ROUTE INFO */}

                    <div>
                      <div className="flex items-center gap-3">

                        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                          {route.routeNumber}
                        </span>

                        <h2 className="font-semibold text-slate-900">
                          {route.name}
                        </h2>

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {route.outbound?.start} →{" "}
                        {route.outbound?.end}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          handleEdit(route)
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600"
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          handleDelete(route)
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>

                    </div>

                  </div>
                ))}

                {routes.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    Chưa có tuyến xe nào.
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================= */}
      {/* CREATE / UPDATE FORM */}
      {/* ========================= */}

      {showForm && (
        <AdminRouteForm
          route={editingRoute}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default AdminRoutes;