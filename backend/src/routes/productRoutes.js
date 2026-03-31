import { Router } from "express";
import productController from "../controllers/productController.js";
import upload from "../middleware/upload.js";
import { integrityCheck } from "../middleware/verifyIntegrity.middleware.js";

const router = Router();
router.post("/create", upload.single("image"), productController.createProduct);
router.post("/update", upload.single("image"), productController.updateProduct);
router.get("/product/:id", integrityCheck, productController.getProductHistory);
router.get("/products", productController.getMyProducts);
router.get("/verify/:id", productController.verifyProductData);

export default router;
