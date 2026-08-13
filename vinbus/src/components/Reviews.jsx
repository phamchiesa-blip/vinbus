import ReviewForm from "./ReviewForm";
import { useState } from "react";

const Reviews = ({ route }) => {
    const [showForm, setShowForm] = useState(false);

    const reviews = route.reviews || [];

  // Gom toàn bộ ảnh từ các review
  const reviewImages = reviews.flatMap((review) =>
    (review.images || []).map((image) => ({
      image,
      user: review.user,
    }))
  );

  // Tính số lượng review theo rating
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter(
      (review) => review.rating === rating
    ).length,
  }));

  const totalReviews = reviews.length;

  return (
    <section className=" p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Reviews
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Đánh giá từ hành khách
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Chia sẻ và khám phá trải nghiệm thực tế trên tuyến {route.id}.
          </p>
        </div>

        <button
            onClick={() => setShowForm((prev) => !prev)}
            className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
            {showForm ? "Đóng form" : "Viết đánh giá"}
        </button>
      </div>

       {/* Review form */}
        {showForm && (
        <ReviewForm
          route={route}
          onClose={() => setShowForm(false)}
        />
        )}

      {/* Rating summary */}
      <div className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-[220px_1fr] md:p-8">
        {/* Overall rating */}
        <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <span className="text-5xl font-bold tracking-tight text-slate-900">
            {route.rating}
          </span>

          <div className="mt-2 flex gap-1 text-xl text-yellow-400">
            {"★★★★★"}
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {route.reviewCount} đánh giá
          </p>
        </div>

        {/* Rating bars */}
        <div className="flex flex-col justify-center gap-3">
          {ratingCounts.map((item) => {
            const percentage =
              totalReviews > 0
                ? (item.count / totalReviews) * 100
                : 0;

            return (
              <div
                key={item.rating}
                className="flex items-center gap-3"
              >
                <span className="w-8 text-sm font-medium text-slate-500">
                  {item.rating}★
                </span>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <span className="w-8 text-right text-xs text-slate-400">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo gallery */}
      {reviewImages.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ảnh từ hành khách
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Những hình ảnh được chia sẻ trong các đánh giá.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {reviewImages.length} ảnh
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reviewImages.map((item, index) => (
              <div
                key={`${item.image}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
              >
                <img
                  src={item.image}
                  alt={`Ảnh từ ${item.user}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-medium text-white">
                    {item.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Đánh giá gần đây
          </h3>

          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Xem tất cả
          </button>
        </div>

        <div className="mt-5 divide-y divide-slate-400">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="py-6 first:pt-0 last:pb-0"
            >
              {/* User + rating */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {review.user}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm tracking-wide text-yellow-400">
                      {"★".repeat(review.rating)}
                      <span className="text-slate-200">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </span>

                    <span className="text-xs text-slate-400">
                      {review.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <p className="mt-4 max-w-3xl flex items-start text-sm leading-6 text-slate-600 font-medium">
                {review.comment}
              </p>

              {/* Review images */}
              {review.images?.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {review.images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Ảnh đánh giá của ${review.user}`}
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;