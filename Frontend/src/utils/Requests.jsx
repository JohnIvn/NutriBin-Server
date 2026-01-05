import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

async function Requests({ url, method = "GET", params, data, auth }) {
  try {
    const response = await api.request({
      url,
      method,
      params: params || undefined,
      data: data || undefined,
      auth: auth || undefined, 
    });

    return response.data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

export default Requests;
