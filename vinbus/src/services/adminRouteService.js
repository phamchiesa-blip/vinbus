const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// GET
export const getAdminRoutes = async () => {
  const response = await fetch(
    `${API_URL}/api/routes?limit=50`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể tải danh sách tuyến."
    );
  }

  return result.data;
};

// CREATE
export const createAdminRoute = async (routeData) => {
  const response = await fetch(
    `${API_URL}/api/routes`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(routeData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể tạo tuyến xe."
    );
  }

  return result.data;
};

// UPDATE
export const updateAdminRoute = async (
  routeId,
  routeData
) => {
  const response = await fetch(
    `${API_URL}/api/routes/${routeId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(routeData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Không thể cập nhật tuyến xe."
    );
  }

  return result.data;
};

// DELETE
export const deleteAdminRoute = async (routeId) => {
  const response = await fetch(
    `${API_URL}/api/routes/${routeId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
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