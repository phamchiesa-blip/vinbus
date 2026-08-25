/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Trash2, Loader2, Star } from "lucide-react";

import {
  getAdminReviews,
  deleteAdminReview,
} from "../services/adminReviewService";


const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReviews();

      setReviews(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Không thể tải danh sách đánh giá."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReviews();
  }, []);


  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa đánh giá này không?"
    );

    if (!confirmed) return;

    try {
      await deleteAdminReview(review._id);

      setReviews((prev) =>
        prev.filter(
          (item) => item._id !== review._id
        )
      );
    } catch (error) {
      alert(
        error.message || "Không thể xóa đánh giá."
      );
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }


  return (
    <section>

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          Admin Panel
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Quản lý đánh giá
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Xem và quản lý các đánh giá được gửi bởi hành khách.
        </p>
      </div>


      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* Review list */}
      {!error && (
        <div className="mt-8 space-y-4">

          {reviews.map((review) => (
            <article
              key={review._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              {/* Top */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
                    <span className="text-sm font-bold text-emerald-600">
                      U
                    </span>
                  </div>


                  <div>

                    <p className="font-semibold text-slate-900">
                      Người dùng
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString("vi-VN")}
                    </p>

                  </div>

                </div>


                {/* Delete */}
                <button
                  onClick={() => handleDelete(review)}
                  className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />

                  Xóa
                </button>

              </div>


              {/* Route */}
              <div className="mt-4">
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  {review.route?.routeNumber || "Không rõ tuyến"}
                </span>

                <span className="ml-2 text-sm text-slate-500">
                  {review.route?.name}
                </span>
              </div>


              {/* Rating */}
              <div className="mt-4 flex items-center gap-1">

                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}

              </div>


              {/* Comment */}
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {review.comment}
              </p>


              {/* Images */}
              {review.images?.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">

                  {review.images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt="Ảnh review"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ))}

                </div>
              )}

            </article>
          ))}


          {reviews.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
              Chưa có đánh giá nào.
            </div>
          )}

        </div>
      )}

    </section>
  );
};


export default AdminReviews;