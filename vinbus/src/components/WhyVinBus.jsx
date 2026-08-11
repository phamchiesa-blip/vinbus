import {features} from '../index'

const WhyVinBus = () => {

  return (
    <section
      className="relative mx-auto w-full max-w-6xl px-6 py-32"
    >
      {/* Heading */}
      <div className="why-title mb-16 max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Tại sao chọn VinBus?
        </p>

        <h2 className="text-4xl font-bold leading-tight text-green-400 md:text-6xl">
          Hành trình của bạn bắt đầu với{" "}
          <span className="text-cyan-400">đúng lộ trình.</span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-green-500">
          Tất cả những gì bạn cần để khám phá Hà Nội bằng VinBus, gói gọn tại một nơi.
        </p>
      </div>

      {/* Features */}
      <div className="">
          {features.map(feature => (
            <div key={feature.number} 
            className="flex bg-green-300 gap-10 mb-10 py-5 px-5 rounded-2xl
            opacity-80 hover:opacity-100 transition duration-300 hover:translate-y-1">
              <h1 className="text-5xl text-blue-400 font-semibold">{feature.number}</h1>
              <div className="flex flex-col">
                <h1 className="text-3xl font-semibold">{feature.title}</h1>
                <h1 className="font-medium text-gray-500">{feature.description}</h1>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default WhyVinBus;