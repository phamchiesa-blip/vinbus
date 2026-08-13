import DeportBackground from "../components/DeportBackground"
import {Mail, PhoneCall, CircleArrowDown} from 'lucide-react'
import { CountUp } from 'use-count-up'
import { useEffect, useRef, useState } from "react"
import PrimaryDeport from "../components/PrimaryDeport"
import DepotTimeline from "../components/DepotTimeline"

const Deport = () => {
  const count = useRef(null);
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    const element = count.current;
    if (!element) return;

    // IntersectionObserver theo dõi phần tử
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element);

    return () => observer.disconnect();
  }, [])

  return (
  <>
  <DeportBackground />

  <div className="container mx-auto flex lg:flex-row max-md:flex-col gap-10">
    <div className="w-[68%] flex flex-col bg-[#ebe4e42d] rounded-xl mt-[50px] px-5">
     <div className="flex gap-3 mt-7">
      <img src="/vinbus_logo.jpg" alt="" className="w-6 h-6 mt-1" />
      <h1 className="font-semibold text-2xl text-green-800">Về VinBus</h1>
     </div>
     <p className="mt-5 font-normal text-green-600">Công ty TNHH Dịch vụ Vận tải Sinh thái VinBus, 
      một thành viên của Vingroup, hoạt động với sứ mệnh phi lợi nhuận
      nhằm góp phần xây dựng hệ thống giao thông công cộng hiện đại,
      văn minh và sạch. Chúng tôi cam kết giảm thiểu khí thải 
      nhà kính và ô nhiễm tiếng ồn tại các thành phố lớn trên khắp Việt Nam.
      </p>
      <div className="flex justify-between mt-10 text-green-600">
        <div ref={count} className="flex flex-col">
          <h1 className="font-semibold text-xl">
             <CountUp isCounting={startCount} end={100} duration={2} />%
            </h1>
          <h1 className="">Xe điện</h1>
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl">0</h1>
          <h1 className="">Khí thải</h1>
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl">24/7</h1>
          <h1 className="">Giám sát</h1>
        </div>
      </div>
    </div>

    <div className="w-[30%] flex flex-col mt-[50px] bg-[#016B33] rounded-2xl px-4 py-2">
      <p className="mt-2 font-medium text-white text-2xl">Hỗ Trợ</p>
      <p className="mt-1 text-white">Đội ngũ dịch vụ khách hàng của chúng tôi 
        luôn sẵn sàng hỗ trợ bạn về các vấn đề liên quan đến lộ trình,
        vé và các thắc mắc chung. 
      </p>
       {/* Email */}
  <div className="flex items-center gap-4">
    {/* Icon */}
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 mt-5">
     <Mail className="text-white"/>
    </div>

    {/* Text */}
    <div className="mt-5">
      <p className="font-medium text-white">Email Us</p>
      <p className="mt-1 font-normal text-white">cskh@vinbus.vn</p>
    </div>
  </div>

  {/* Call Center */}
  <div className="flex items-center gap-4">
    {/* Icon */}
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 mt-5">
     <PhoneCall className="text-white"/>
    </div>

    {/* Text */}
    <div className="text-white mt-5 mb-2">
      <p className="text-base font-medium">Call Center</p>
      <p className="mt-1 text-base font-normal">1900 866 663</p>
    </div>
  </div>
    </div>
  </div>

  <DepotTimeline />

  <PrimaryDeport />

  <div className="mt-[100px] text-center">
    <h1 className="text-5xl font-semibold text-green-700">Từ Depot tới hành trình của bạn</h1>
    <span className="text-center flex items-center justify-center mt-5"><CircleArrowDown className="animate-bounce text-red-700"/></span>
    <a href="/buses" className="font-medium text-xl text-green-500 mb-[100px] cursor-pointer underline">Khám phá các tuyến xe tại đây</a>
  </div>
  </>
  )
}

export default Deport