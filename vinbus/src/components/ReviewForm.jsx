import { useState } from "react";

const ReviewForm = ({ route, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Tối đa 5 ảnh
    const selectedFiles = files.slice(0, 5);

    setImages(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá.");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng chia sẻ trải nghiệm của bạn.");
      return;
    }

    const reviewData = {
      routeId: route.id,
      rating,
      comment: comment.trim(),
      images,
    };

    console.log("Review:", reviewData);

    // Sau này sẽ gửi reviewData lên API
    onClose();
  };

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Your experience
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            Đánh giá tuyến {route.id}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Chia sẻ trải nghiệm của bạn với những hành khách khác.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        {/* Rating */}
        <div>
          <label className="text-sm font-semibold text-slate-800">
            Bạn đánh giá tuyến này thế nào?
          </label>

          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-transform hover:scale-110"
                aria-label={`${star} sao`}
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {rating === 0
              ? "Chọn số sao"
              : rating === 5
                ? "Tuyệt vời"
                : rating === 4
                  ? "Rất tốt"
                  : rating === 3
                    ? "Ổn"
                    : rating === 2
                      ? "Chưa tốt"
                      : "Rất không hài lòng"}
          </p>
        </div>

        {/* Comment */}
        <div className="mt-7">
          <label
            htmlFor="review-comment"
            className="text-sm font-semibold text-slate-800"
          >
            Chia sẻ trải nghiệm
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ví dụ: Xe sạch, điều hòa mát, nhân viên thân thiện..."
            rows={5}
            maxLength={500}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {comment.length}/500
          </div>
        </div>

        {/* Images */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-800">
            Thêm hình ảnh
            <span className="ml-2 font-normal text-slate-400">
              (tối đa 5 ảnh)
            </span>
          </label>

          <div className="mt-3 flex flex-wrap gap-3">
            {/* Upload button */}
            {images.length < 5 && (
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-500">
                <span className="text-2xl">+</span>

                <span className="mt-1 text-xs font-medium">
                  Thêm ảnh
                </span>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Preview */}
            {images.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative h-24 w-24 overflow-hidden rounded-2xl bg-slate-200"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Ảnh ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImages((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white backdrop-blur transition hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            JPG, PNG hoặc WEBP
          </p>
        </div>

        {/* Submit */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
          >
            Hủy
          </button>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Gửi đánh giá
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;