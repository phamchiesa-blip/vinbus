import BusHero from "../components/BusHero"
import BusRoutes from "../components/BusRoutes"
import RouteDetail from "../components/RouteDetail"
import {useState} from 'react'

const BusRoute = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    setSelectedRoute(null);
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
          searchQuery={searchQuery}
          onSelectRoute={setSelectedRoute}
          onClearSearch={() => setSearchQuery("")}
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
