import { motion } from "framer-motion";

const categories = [
  "Tất cả",
  "Văn hóa",
  "Ẩm thực",
  "Mua sắm",
  "Thiên nhiên",
  "Giải trí",
  "Cafe",
];

function DestinationCategories({
  selectedCategory,
  setSelectedCategory,
}) {
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
            Explore Hanoi
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Bạn muốn đi đâu?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-xl text-neutral-400"
          >
            Chọn một trải nghiệm và khám phá những địa điểm
            phù hợp với hành trình của bạn.
          </motion.p>
        </div>

        {/* Categories */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-full border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "border-green-400 bg-green-400 text-neutral-950"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default DestinationCategories;