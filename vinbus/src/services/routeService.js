const API_URL = import.meta.env.VITE_API_URL;

export const getRoutes = async (search = "", limit) => {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (limit) {
    params.append("limit", limit);
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

export const deleteRoute = async (routeId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Vui lòng đăng nhập.");
  }

  const response = await fetch(
    `${API_URL}/api/routes/${routeId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể xóa tuyến xe."
    );
  }

  return result;
};