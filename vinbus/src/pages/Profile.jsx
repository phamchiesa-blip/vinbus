import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const { user, updateUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const firstName = user?.name?.trim().split(" ").pop();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file ảnh.");
      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB.");
      return;
    }

    setSelectedImage(file);

    // Preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError("Vui lòng chọn ảnh trước.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const formData = new FormData();

      formData.append("avatar", selectedImage);

      const response = await fetch(
        `${API_URL}/api/auth/avatar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Không thể cập nhật ảnh đại diện."
        );
      }

      // Cập nhật user trong AuthContext
      updateUser(result.data);

      // Reset
      setSelectedImage(null);
      setPreview(result.data.avatar);

      setSuccess("Cập nhật ảnh đại diện thành công.");
    } catch (error) {
      console.error("Lỗi upload avatar:", error);

      setError(
        error.message || "Có lỗi xảy ra khi cập nhật ảnh."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-20 pt-32">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Hồ sơ của bạn
          </h1>

          <p className="mt-2 text-slate-500">
            Quản lý thông tin cá nhân và ảnh đại diện.
          </p>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          {/* Avatar */}
          <div className="flex flex-col items-center">

            <div className="relative">

              {preview ? (
                <img
                  src={preview}
                  alt={user?.name}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-emerald-100"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-600 text-4xl font-bold text-white ring-4 ring-emerald-100">
                  {firstName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera button */}
              <label
                className={`absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-emerald-600 ${
                  loading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                📷

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {user?.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user?.email}
            </p>
          </div>

          {/* Message */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-medium text-emerald-600">
                {success}
              </p>
            </div>
          )}

          {/* Save */}
          {selectedImage && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setPreview(user?.avatar || "");
                  setError("");
                }}
                disabled={loading}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {loading
                  ? "Đang tải ảnh..."
                  : "Lưu ảnh đại diện"}
              </button>
            </div>
          )}

          {/* User information */}
          <div className="mt-10 border-t border-slate-100 pt-8">

            <h3 className="text-lg font-bold text-slate-900">
              Thông tin tài khoản
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Họ tên
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user?.name}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-semibold text-slate-800">
                  {user?.email}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;