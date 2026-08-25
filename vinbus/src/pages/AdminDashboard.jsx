import { useState } from "react";
import { BusFront, MessageSquare } from "lucide-react";

import AdminRoutes from "./AdminRoutes";
import AdminReviews from "../components/AdminReviews";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("routes");

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Quản trị VinBus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quản lý tuyến xe và đánh giá của hành khách.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex w-fit gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

          <button
            type="button"
            onClick={() => setActiveTab("routes")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "routes"
                ? "bg-emerald-500 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <BusFront className="h-4 w-4" />
            Tuyến xe
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "reviews"
                ? "bg-emerald-500 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Đánh giá
          </button>

        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "routes" && <AdminRoutes />}

          {activeTab === "reviews" && <AdminReviews />}
        </div>

      </div>
    </main>
  );
};

export default AdminDashboard;