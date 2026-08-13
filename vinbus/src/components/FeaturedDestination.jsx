import { motion } from "framer-motion";

function FeaturedDestination() {
  return (
    <section className="bg-neutral-950 px-6 py-24 text-white md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-400"
          >
            Destination of the week
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Điểm đến nổi bật
          </motion.h2>
        </div>

        {/* Featured card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="group relative min-h-[600px] overflow-hidden rounded-[2rem]"
        >
          {/* Image */}
          <motion.img
            src="/HoGuom.jpg"
            alt="Hồ Hoàn Kiếm"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-10 lg:p-14">
            <div className="max-w-3xl">
              {/* Category */}
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
                Văn hóa
              </span>

              {/* Title */}
              <h3 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                Hồ Hoàn Kiếm
              </h3>

              {/* Description */}
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                Nằm giữa lòng Hà Nội, Hồ Hoàn Kiếm là một trong những
                biểu tượng đặc trưng của thủ đô và là điểm giao giữa
                lịch sử, văn hóa và nhịp sống hiện đại.
              </p>

              {/* Bottom information */}
              <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                {/* Bus routes */}
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wider text-white/50">
                    Các tuyến VinBus
                  </p>

                  <div className="flex gap-2">
                    {["08A", "08B", "43", "E02", "E07", "E11"].map((route) => (
                      <span
                        key={route}
                        className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md"
                      >
                        {route}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Google Maps */}
                <motion.a
                  href="https://maps.app.goo.gl/YFKWfisdM69bvD156"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-green-400"
                >
                  Xem trên Google Maps

                  <span className="text-lg">
                    ↗
                  </span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedDestination;