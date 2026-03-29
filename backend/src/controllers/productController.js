import {
  addProduct,
  addVerProduct,
  getProductHistoryOnChain,
  getMyProductsOnChain,
  verifyProductIntegrity
} from "../services/blockchain.js";

export const verifyProductData = async (req, res) => {
  try {
    const { id } = req.params; // Lấy UUID từ đường dẫn /api/products/verify/:id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID sản phẩm để xác thực."
      });
    }

    // Gọi hàm verify từ blockchain.service.js
    const result = await verifyProductIntegrity(id);

    // Trường hợp service trả về success: false (thường là do không tìm thấy sp trong DB)
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    // Phân loại phản hồi dựa trên tính hợp lệ của mã Hash
    if (result.isValid) {
      return res.status(200).json({
        success: true,
        is_verified: true,
        message: "Tuyệt vời! Dữ liệu khớp hoàn toàn với bản ghi trên Blockchain.",
        data: result.data
      });
    } else {
      return res.status(409).json({
        success: false,
        is_verified: false,
        message: "CẢNH BÁO: Phát hiện sai lệch dữ liệu! Mã hash trong hệ thống không khớp với mã hash trên Blockchain.",
        data: result.data
      });
    }

  } catch (error) {
    console.error("Controller Verify Error:", error);

    // Trả về lỗi 500 nếu có sự cố kết nối Blockchain hoặc lỗi code
    return res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi trong quá trình xác thực dữ liệu."
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const result = await addProduct(req.body, req.file);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating product:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Internal server error.",
      detail: error.detail,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const result = await addVerProduct(req.body, req.file);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Internal server error.",
      detail: error.detail,
    });
  }
};

export const getProductHistory = async (req, res) => {
  try {
    const product = await getProductHistoryOnChain(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product history:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await getMyProductsOnChain(req.query.wallet);
    if (!products) {
      return res.status(404).json({ error: "Products not found" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting my products:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

export default {
  createProduct,
  updateProduct,
  getProductHistory,
  getMyProducts,
  verifyProductData
};
