import BusHero from "../components/BusHero"
import BusRoutes from "../components/BusRoutes"
import RouteDetail from "../components/RouteDetail"
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const BusRoute = () => {
 const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);

  const handleSearch = () => {
    setSelectedRoute(null);
    setSubmittedSearch(searchQuery);
  };

  return (
    <div className="mb-[100px]">
        <BusHero
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
        
        {!selectedRoute ? (
        <BusRoutes
            searchQuery={submittedSearch}
  onSelectRoute={setSelectedRoute}
  onClearSearch={() => {
    setSearchQuery("");
    setSubmittedSearch("");
  }}
        />
        ) : (
        <RouteDetail
          route={selectedRoute}
          onBack={() => setSelectedRoute(null)}
        />
        )}

        
    </div>
  )
}

export default BusRoute
