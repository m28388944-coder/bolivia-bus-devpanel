import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:8000" });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("dev_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    localStorage.removeItem("dev_token");
    localStorage.removeItem("dev_user");
    window.location.reload();
  }
  return Promise.reject(err);
});
export default api;
