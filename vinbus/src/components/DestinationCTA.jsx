import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function DestinationCTA() {
  return (
    <section className="bg-neutral-950 px-6 pb-24 text-white md:px-12 lg:px-20">
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.7,
        }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-green-400 px-7 py-16 text-neutral-950 md:px-14 md:py-20"
      >
        {/* Decorative circle */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-800/60">
            Your journey starts here
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Đã chọn được
            <br />
            điểm đến?
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-neutral-800/70">
            Tìm tuyến VinBus phù hợp và bắt đầu hành trình
            khám phá Hà Nội của bạn.
          </p>

          <Link to="/buses">
            <motion.span
              whileHover={{
                x: 5,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white"
            >
              Khám phá tuyến xe

              <span className="text-lg">
                →
              </span>
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default DestinationCTA;