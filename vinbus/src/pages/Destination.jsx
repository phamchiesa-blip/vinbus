import DestinationHero from "../components/DestinationHero"
import { useState } from "react"
import DestinationCategories from "../components/DestinationCategories"
import FeaturedDestination from "../components/FeaturedDestination"
import PopularDestinations from "../components/PopularDestinations"
import DestinationCTA from '../components/DestinationCTA'

const Destination = () => {
   const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  return (
    <div>
        <DestinationHero />
        <DestinationCategories  selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}/>
        <FeaturedDestination />
        <PopularDestinations selectedCategory={selectedCategory}/>
        <DestinationCTA />
    </div>
  )
}

export default Destination