import { Router } from 'express';
import productController from '../controllers/productController.js';
import upload from '../middleware/upload.js';

const router = Router();
router.post('/create', upload.single('image'), productController.createProduct);
router.post('/update', upload.single('image'), productController.updateProduct);
router.get('/product/:id', productController.getProductHistory);
router.get('/products', productController.getMyProducts);

export default router;
