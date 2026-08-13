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

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.45,
            }}
            className="mt-9 flex max-w-xl items-center rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md"
          >
            <div className="flex h-12 w-12 items-center justify-center text-white/70">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/50 md:text-base"
            />

            <button className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-400">
              Tìm kiếm
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3 text-white/60">
          <span className="text-[10px] uppercase tracking-[0.3em]">
            Explore
          </span>

          <a href="#category">
            <CircleArrowDown className="animate-bounce"/>
            </a>
        </div>
      </motion.div>
    </section>
  );
}

export default DestinationHero;