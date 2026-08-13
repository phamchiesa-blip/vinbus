import BusHero from "../components/BusHero"
import BusRoutes from "../components/BusRoutes"
import RouteDetail from "../components/RouteDetail"
import {useState} from 'react'

const BusRoute = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <div className="mb-[100px]">
        <BusHero />
        
        {!selectedRoute ? (
        <BusRoutes onSelectRoute={setSelectedRoute} />
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