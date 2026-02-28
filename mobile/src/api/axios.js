import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://10.19.141.90:3000",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  console.log("[axios] Token check for:", config.url);
  console.log("[axios] Token exists:", !!token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[axios] Auth header set");
  } else {
    console.log("[axios] No token found - request will fail auth");
  }

  return config;
});

export default api;