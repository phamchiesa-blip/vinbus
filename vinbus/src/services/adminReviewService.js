const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


// GET ALL REVIEWS
export const getAdminReviews = async () => {
  const response = await fetch(
    `${API_URL}/api/reviews/admin`,
    {
      headers: getAuthHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể tải danh sách đánh giá."
    );
  }

  return result.data;
};


// DELETE REVIEW
export const deleteAdminReview = async (reviewId) => {
  const response = await fetch(
    `${API_URL}/api/reviews/admin/${reviewId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể xóa đánh giá."
    );
  }

  return result;
};