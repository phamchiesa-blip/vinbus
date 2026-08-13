import {depots} from '../index'
import {EvCharger, LocateFixed, MapPin} from 'lucide-react'

const PrimaryDeport = () => {
  return (
    <div className="container max-auto">
        <h1 className="text-4xl font-semibold text-green-700 mt-[100px] mb-[50px]">Depots VinBus</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {depots.map(depot => (
                <div key={depot.name} className="flex flex-col">
                    <img src={depot.image} alt="" className="w-full object-cover rounded-t-2xl" />
                    <div className='bg-[#F6FAFF] rounded-b-2xl hover:bg-amber-50 transition duration-300'>
                        <h1 className="flex gap-5 px-5 py-5 font-semibold text-2xl text-green-500"> <EvCharger className='mt-1'/> {depot.name}</h1>
                        <h1 className="px-5 flex gap-5 text-green-500"><MapPin /> {depot.address}</h1>
                        <a href={depot.ggmap} className="px-5 flex gap-5 py-5 text-gray-400 hover:text-red-500"><LocateFixed /> Xem trên bản đồ</a>
                    </div>
                </div>
            ))}
        </div>

        <div className="mb-[100px]"></div>

    </div>
  )
}

export default PrimaryDeport