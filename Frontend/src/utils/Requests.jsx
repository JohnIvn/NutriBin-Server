import axios from "axios";
import getBaseUrl from "./GetBaseUrl";

// Normalize backend base URL so even a bare host like
// "nutribin-server-backend-production.up.railway.app" becomes a valid HTTPS URL.

const api = axios.create({
  baseURL: getBaseUrl(),
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
