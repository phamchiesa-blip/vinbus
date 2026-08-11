import {popularBus, remarkableDestination} from '../index'
import {SquareArrowUpRight} from 'lucide-react'

const PopularBus = () => {
  return (
    <div className="container mx-auto">
        <h1 className="mt-[100px] text-5xl font-semibold text-center text-green-400">Tuyến xe nổi bật ⭐</h1>
        <p className="text-xl font-medium text-center text-gray-500 mt-4">Khám phá các tuyến xe buýt phổ biến nhất và tìm cách di chuyển thuận tiện nhất tại Hà Nội.</p>

        <div className="mt-10 grid max-md:grid-cols-1 lg:grid-cols-3 gap-4">
            {popularBus.slice(0,3).map((popular) => (
                <div key={popular.number} 
                className="group
  rounded-xl
  border border-white/20
  bg-green-300
  backdrop-blur-xl
  p-4
  transition-all duration-300
  hover:-translate-y-0.5
  hover:bg-green-400">

    <div className="flex justify-between">
       <span className="font-semibold text-2xl flex">
        <img src="/vinbus_logo.jpg" alt="vinbus-logo" className='h-6 mt-1 mr-2'/>
        {popular.number} </span>
        <h1 className="font-medium text-green-900">{popular.type}</h1>
    </div>
    <div className="text-[17px] font-semibold mt-2">
        {popular.route}
    </div>
    <div className="mt-2">
        <h1 className="font-medium">Điểm đến nổi bật:</h1>
        <div className="space-y-1">
            {remarkableDestination.map(dest => (
                <p key={dest.number} className="m-0">{dest.destination}</p>
            ))}
        </div>
    </div>
    <div className="flex justify-between mt-2">
        <h1 className="text-gray-600">⭐ {popular.rate}</h1>
        <h1 className="flex text-gray-600">💁 {popular.reviews} Reviewers</h1>
    </div>
            <button className='mt-3 text-gray-500 flex justify-between font-semibold cursor-pointer hover:text-white active:scale-95'>Xem lộ trình <SquareArrowUpRight className='w-6 ml-2 h-6'/></button>
            </div>
            ))}
        </div>
    </div>
  )
}

export default PopularBus