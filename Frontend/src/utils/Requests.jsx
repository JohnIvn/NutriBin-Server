import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://nutribin-server-backend-production.up.railway.app",
});

async function Requests({
  url,
  method = "GET",
  params,
  data,
  auth,
  credentials,
}) {
  try {
    const response = await api.request({
      url,
      method,
      params: params || undefined,
      data: data || undefined,
      auth: auth || undefined,
      withCredentials: credentials,
    });

    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

export default Requests;
