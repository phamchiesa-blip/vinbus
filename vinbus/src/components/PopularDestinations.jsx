import { motion, AnimatePresence } from "framer-motion";
import DestinationCard from "./DestinationCard";
import {destinations} from '../index'

function PopularDestinations({ selectedCategory }) {
  const filteredDestinations =
    selectedCategory === "Tất cả"
      ? destinations
      : destinations.filter(
          (destination) =>
            destination.category === selectedCategory
        );

  return (
    <section className="bg-neutral-950 px-6 pb-24 text-white md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-400"
            >
              Explore more
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight md:text-5xl"
            >
              Popular Destinations
            </motion.h2>
          </div>

          <p className="text-sm text-neutral-500">
            {filteredDestinations.length} địa điểm
          </p>
        </div>

        {/* Cards */}
        <AnimatePresence mode="popLayout">
          {filteredDestinations.length > 0 ? (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredDestinations.map((destination) => (
                <motion.div
                  key={destination.id}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <DestinationCard
                    destination={destination}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-h-[250px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]"
            >
              <div className="text-center">
                <p className="text-lg font-medium">
                  Chưa có địa điểm
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  Hãy thử chọn một danh mục khác.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default PopularDestinations;