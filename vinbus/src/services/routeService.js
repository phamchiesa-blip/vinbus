const API_URL = import.meta.env.VITE_API_URL;

export const getRoutes = async (search = "") => {
  const params = new URLSearchParams();
  params.append("limit", "50");

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/api/routes${query ? `?${query}` : ""}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể lấy danh sách tuyến xe."
    );
  }

  return result.data;
};