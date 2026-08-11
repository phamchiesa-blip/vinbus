import {Search} from 'lucide-react'
import { CountUp } from 'use-count-up'
import {stats} from '../index';


export const SearchItem = () => {
  return (
        <>
        {/* Title */}
        <h1 className="text-6xl py-15 text-center font-bold leading-tight bg-gradient-to-r from-[#3FAE2A] via-[#45B875] to-[#43B7B5] bg-clip-text text-transparent">
          Di chuyển Xanh 
          <br />
          <span className="bg-gradient-to-r from-pink-300 via-gray-400 to-green-500 bg-clip-text text-transparent">cùng VinBus</span>
        </h1>
        <h3 className="text-center font-medium text-gray-400 mb-5">Tìm tuyến xe phù hợp với hành trình của bạn</h3>
  
        {/* Search */}
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <Search className='w-5 h-5 text-pink-400'/>
            </div>
  
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Tìm tuyến xe, điểm đến
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Nhập số tuyến, tên tuyến hoặc điểm đến bạn muốn tìm
            </p>
          </div>
          </div>
  
          <div className="flex h-12 items-center rounded-xl border border-emerald-400 px-3">
          <span className="mr-3 text-gray-400">
            <Search className='w-4 h-4 text-pink-400'/>
          </span>
  
          <input
          type="text"
          placeholder="Nhập số tuyến, tên tuyến hoặc điểm đến..."
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
  
          <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
            Tìm kiếm →
          </button>
          </div>
  
          {/* Eg */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
    <span className="text-sm text-gray-400">
      Ví dụ:
    </span>
  
    {["E01", "E02", "08A", "21A", "BX Mỹ Đình", "KĐT Smart City", "Aeon Mall Hà Đông"].map(
      (item) => (
        <button
          key={item}
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100"
        >
          {item}
        </button>
      )
    )}
  </div>
        </div>

        {/* Achievement */}
        <div className="mx-auto mt-30 flex max-w-2xl justify-between">

  {stats.map((stat) => (
    <div
      key={stat.title}
      className="flex items-center gap-3"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        {stat.icon}
      </div>

      <div>
        <div className="text-xl font-semibold text-green-600">
          {stat.value !== null && (
            <CountUp
              end={stat.value}
              duration={2}
              isCounting
            />
          )}
          {stat.suffix}
          {stat.value === null && stat.title}
        </div>

        <p className="text-xs font-medium text-gray-700">
          {stat.value !== null ? stat.title : ""}
        </p>

        <p className="text-[10px] text-gray-400 font-semibold">
          {stat.description}
        </p>
      </div>

    </div>
  ))}

</div>
  
        </>
  )
}

export default SearchItem