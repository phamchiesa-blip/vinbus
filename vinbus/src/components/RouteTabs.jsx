import { useState } from "react";

import RouteInfo from "./RouteInfo";
import RouteStops from "./RouteStops";
import DepartureTimes from "./DepartureTimes";
import Reviews from "./Reviews";

const RouteTabs = ({ route }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Tổng quan",
    },
    {
      id: "route",
      label: "Lộ trình",
    },
    {
      id: "schedule",
      label: "Giờ xuất bến",
    },
    {
      id: "reviews",
      label: "Đánh giá",
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-5 py-4 text-sm font-semibold transition-colors md:px-8 ${
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.label}

                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && (
          <RouteInfo route={route} />
        )}

        {activeTab === "route" && (
          <RouteStops route={route} />
        )}

        {activeTab === "schedule" && (
          <DepartureTimes route={route} />
        )}

        {activeTab === "reviews" && (
          <Reviews route={route} />
        )}
      </div>
    </div>
  );
};

export default RouteTabs;