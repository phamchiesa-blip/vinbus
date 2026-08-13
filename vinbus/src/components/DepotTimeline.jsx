import { motion } from "framer-motion";

const depotSteps = [
  {
    number: "01",
    title: "Xe trở về Depot",
    description:
      "Sau khi hoàn thành hành trình trong ngày, những chiếc VinBus trở về Depot để chuẩn bị cho chu kỳ vận hành tiếp theo.",
    time: "10:00 PM",
  },
  {
    number: "02",
    title: "Kiểm tra & bảo dưỡng",
    description:
      "Đội ngũ kỹ thuật tiến hành kiểm tra tình trạng xe, vệ sinh và bảo dưỡng những bộ phận cần thiết.",
    time: "11:00 PM",
  },
  {
    number: "03",
    title: "Sạc năng lượng",
    description:
      "Các xe điện được đưa vào khu vực sạc để đảm bảo đủ năng lượng cho những hành trình tiếp theo.",
    time: "11:30 PM",
  },
  {
    number: "04",
    title: "Sẵn sàng xuất bến",
    description:
      "Trước khi ngày mới bắt đầu, những chiếc xe được kiểm tra lần cuối và sẵn sàng lăn bánh.",
    time: "05:00 AM",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

function DepotTimeline() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 px-6 py-24 text-white md:px-12 lg:px-24 mt-[100px]">
      
      {/* Header */}
      <div className="mx-auto mb-20 max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-green-400"
        >
          Behind the journey
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl"
        >
          Một ngày tại{" "}
          <span className="text-green-400">Depot</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 md:text-lg"
        >
          Đằng sau mỗi chuyến xe VinBus là cả một quy trình vận hành
          được chuẩn bị kỹ lưỡng tại Depot.
        </motion.p>
      </div>

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Timeline line */}
        <div className="absolute left-[27px] top-0 h-full w-px bg-neutral-800 md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-16 md:space-y-24">
          {depotSteps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative grid md:grid-cols-2"
            >
              {/* Left side */}
              <div
                className={`pr-0 md:pr-16 ${
                  index % 2 !== 0 ? "md:order-2 md:pl-16 md:pr-0" : ""
                }`}
              >
                <span className="text-sm font-semibold tracking-widest text-green-400">
                  {step.time}
                </span>

                <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-neutral-400">
                  {step.description}
                </p>
              </div>

              {/* Number */}
              <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 md:left-1/2 md:-translate-x-1/2">
                <span className="text-sm font-bold text-green-400">
                  {step.number}
                </span>
              </div>

              {/* Empty opposite side */}
              <div
                className={`hidden md:block ${
                  index % 2 !== 0 ? "md:order-1" : ""
                }`}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default DepotTimeline;