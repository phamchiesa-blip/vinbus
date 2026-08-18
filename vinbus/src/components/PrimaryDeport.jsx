import { depots } from '../index'
import { Zap, MapPin, ExternalLink } from 'lucide-react'

const PrimaryDeport = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="mb-12">
        <div className="mt-[100px] flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xl font-semibold uppercase tracking-wider mb-2 border border-emerald-200/50">
          <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Hệ thống hạ tầng
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mt-10">
          Hệ thống Depot VinBus
        </h2>
        <p className="text-slate-500 mt-2 text-base max-w-2xl">
          Các trung tâm vận hành, bảo dưỡng kỹ thuật và trạm sạc xe buýt điện thông minh tiêu chuẩn quốc tế tại Hà Nội.
        </p>
      </div>

      {/* Danh sách Depot */}
      <div className="flex flex-col gap-8">
        {depots.map((depot) => {
          // Fallback an toàn nếu chưa có mapEmbedUrl riêng biệt
          const embedSrc = depot.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(depot.address)}&output=embed`

          return (
            <div
              key={depot.name}
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* CỘT BÊN TRÁI: Ảnh & Thông tin Depot (7 cột trên màn hình lớn) */}
              <div className="lg:col-span-7 flex flex-col md:flex-row p-6 md:p-8 gap-6 justify-between">
                {/* Ảnh đại diện Depot */}
                <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={depot.image}
                    alt={depot.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Chuẩn Smart Hub
                  </div> */}
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {depot.name}
                    </h3>

                    <div className="flex items-start gap-2.5 mt-3 text-slate-600 text-sm leading-relaxed">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{depot.address}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Trạm sạc siêu nhanh</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Trung tâm bảo dưỡng</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={depot.ggmap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline active:scale-95 transition-all"
                    >
                      <span>Mở chỉ đường trên Google Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* CỘT BÊN PHẢI: Bản đồ Google Maps nhúng iframe (5 cột) */}
              <div className="lg:col-span-5 h-[260px] lg:h-auto min-h-[240px] w-full border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50 relative">
                <iframe
                  src={embedSrc}
                  title={`Google Map - ${depot.name}`}
                  className="w-full h-full border-0 absolute inset-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PrimaryDeport