import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const createProduct = async (formData) => {
  const response = await axiosInstance.post("/create/", formData);
  return response.data;
};

export const generateHash = async (formData) => {
  const response = await axiosInstance.post("/generate-hash/", formData);
  return response.data;
}

export const updateProduct = async (formData) => {
  const response = await axiosInstance.post("/update/", formData);
  return response.data;
};

export const getProducts = async (wallet) => {
  const response = await axiosInstance.get("/products/", {
    params: { wallet },
  });
  return response.data;
};

export const getProductDetail = async (id) => {
  const response = await axiosInstance.get(`/product/${id}`);

  return response.data;
};

export default axiosInstance;
