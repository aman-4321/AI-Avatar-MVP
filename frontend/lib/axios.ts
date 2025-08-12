import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
      : "http://localhost:8080/api/v1",
  withCredentials: true,
});
