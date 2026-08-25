import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getRoutes = async () => {
  const response = await axios.get(`${API_URL}/api/routes?limit=50`);

  return response.data.data;
};