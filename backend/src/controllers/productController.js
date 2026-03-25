import {
  addProductOnChain,
  updateProductOnChain,
  getProductHistoryOnChain,
  getMyProductsOnChain,
} from "../services/blockchain.js";

export const createProduct = async (req, res) => {
  try {
    const result = await addProductOnChain(req.body, req.file);
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
    const result = await updateProductOnChain(req.body, req.file);
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
};
