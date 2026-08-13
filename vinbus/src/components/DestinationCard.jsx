// tạo card để sao này gọi API địa điểm

import { motion } from "framer-motion";

function DestinationCard({ destination }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-3xl bg-neutral-900"
    >
      {/* Image */}
      <div className="relative h-[360px] overflow-hidden">
        <motion.img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Category */}
        <div className="absolute left-5 top-5">
          <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {destination.category}
          </span>
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="mb-2 text-xs text-white/50">
            📍 {destination.location}
          </p>

          <h3 className="text-2xl font-bold text-white">
            {destination.name}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
            {destination.description}
          </p>
        </div>
      </div>

      {/* Bottom information */}
      <div className="flex items-center justify-between gap-4 border-t border-white/5 px-5 py-4">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">
            VinBus routes
          </p>

          <div className="flex gap-1.5">
            {destination.busRoutes.map((route) => (
              <span
                key={route}
                className="rounded-md bg-white/5 px-2 py-1 text-xs font-semibold text-green-400"
              >
                {route}
              </span>
            ))}
          </div>
        </div>

        <motion.a
          href={destination.googleMapsUrl}
          whileHover={{ x: 4 }}
          className="text-sm font-medium text-white transition-colors hover:text-green-400"
        >
          Maps ↗
        </motion.a>
      </div>
    </motion.article>
  );
}

export default DestinationCard;