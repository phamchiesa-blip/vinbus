import { motion } from "framer-motion";
import {CircleArrowDown} from 'lucide-react'

function DestinationHero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Background */}
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="/bus-des.jpg"
        alt="Hanoi"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          {/* Small title */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-green-400"
          >
            Discover Hanoi
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
            className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Khám phá
            <br />
            <span className="text-green-400">Hà Nội</span>
            <br />
            cùng VinBus.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
            }}
            className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg"
          >
            Những điểm đến nổi bật, những hành trình xanh và những
            trải nghiệm đang chờ bạn khám phá.
          </motion.p>

          <a
  href="#popular-destination"
  className="group mt-9 inline-flex items-center gap-3 text-white"
>
  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md">
    <CircleArrowDown className="h-5 w-5 animate-bounce" />
  </span>

  <span>
    <span className="block text-sm font-semibold">
      Khám phá điểm đến
    </span>

    <span className="block text-xs text-white/50">
      Xem các địa điểm nổi bật
    </span>
  </span>
</a>
        </div>
      </div>
    </section>
  );
}

export default DestinationHero;