

const DeportBackground = () => {
  return (
    <div className="relative w-full overflow-hidden">
    {/* Background */}
        <img
    src="/deport.png"
    alt="VinBus"
    className="h-full w-full object-cover"
  />
  {/* Text */}
  <div className="absolute inset-0 flex flex-col left-50 top-[88%] text-white">
    <h1 className="text-4xl font-semibold text-white">
      Các kho bãi hiện đại bậc nhất
    </h1>

    <p className="mt-1 text-xl font-semibold">
      Thúc đẩy tương lai của giao thông đô thị bằng cơ sở hạ tầng sạc hiệu suất cao và <br />các tiêu chuẩn bảo trì tỉ mỉ.
    </p>
  </div>
   </div>
  )
}

export default DeportBackground