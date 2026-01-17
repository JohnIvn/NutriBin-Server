import axios from "axios";

// Normalize backend base URL so even a bare host like
// "nutribin-server-backend-production.up.railway.app" becomes a valid HTTPS URL.
function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;

  if (raw && typeof raw === "string") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    // Assume HTTPS if protocol is missing
    return `https://${raw}`;
  }

  // Production default
  return "https://nutribin-server-backend-production.up.railway.app";
}

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
