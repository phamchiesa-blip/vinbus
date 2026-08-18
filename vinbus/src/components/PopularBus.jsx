import { popularBus } from '../index'
import { SquareArrowUpRight, Star, Users, MapPin } from 'lucide-react'

const PopularBus = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 mt-[100px]">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 text-4xl font-semibold mb-3 border border-emerald-200/60">
          <Star className="w-4 h-4 fill-emerald-500 text-yellow-300" /> Tuyến xe phổ biến
        </div>
        <p className="text-base md:text-lg text-slate-500 mt-3 font-normal">
          Khám phá các tuyến xe buýt phổ biến nhất và tìm cách di chuyển thuận tiện nhất tại Hà Nội.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {popularBus.slice(0, 3).map((popular) => {
          // Tách toàn bộ các điểm dừng
          const stops = typeof popular.destination === 'string' 
            ? popular.destination.split(' - ').map((s) => s.trim()).filter(Boolean)
            : []

          return (
            <div
              key={popular.number}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300"
            >
              <div>
                {/* Header Card: Mã tuyến & Loại xe */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-1.5">
                      <img
                        src="/vinbus_logo-removebg-preview.png"
                        alt="vinbus-logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {popular.number}
                      </span>
                      <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        VinBus
                      </span>
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {popular.type}
                  </span>
                </div>

                {/* Lộ trình chính */}
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Lộ trình
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {popular.route}
                  </h3>
                </div>

                {/* Danh sách toàn bộ điểm đến nổi bật */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Điểm đến nổi bật:</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">{stops.length} trạm</span>
                  </div>
                  
                  {/* Container hiển thị toàn bộ trạm với thanh cuộn mỏng */}
                  <div className="max-h-[140px] overflow-y-auto pr-1 flex flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                    {stops.length > 0 ? (
                      stops.map((stop, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {stop}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {popular.destination}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Rating & Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{popular.rate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{popular.reviews} đánh giá</span>
                  </div>
                </div>

                <a
                  href="/buses"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white active:scale-98"
                >
                  Xem lộ trình chi tiết
                  <SquareArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PopularBus