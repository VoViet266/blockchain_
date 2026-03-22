import { Product, ProductVersion } from '../models/index.js';
import { addProductOnChain, updateProductOnChain } from '../services/blockchain.js';
import { createHash } from 'crypto';
import pinataService from '../services/uploadPinata.js';

const sha256 = (content) => {
    return createHash('sha256').update(content).digest('hex');
};

export const createProduct = async (req, res) => {
    try {
        const { name, origin, wallet } = req.body;
        
        let image = null;
        if (req.file) {
            const uploadResult = await pinataService.uploadFileToIPFS(req.file.path, req.file.originalname);
            image = uploadResult.ipfsUrl;
        }
        
        if (!name || !origin || !wallet) {
            return res.status(400).json({ error: "Thiếu trường dữ liệu name, origin hoặc wallet." });
        }

        // Tạo Product mới
        const product = await Product.create({
            name,
            origin,
            owner_wallet: wallet,
        });

        const status = "PLANTED";
        // Băm dữ liệu kết hợp để lưu vào blockchain
        const hashValue = sha256(name + origin + status);
        
        // Gọi blockchain
        let tx_hash = "mock_tx_hash_" + hashValue.substring(0,10);
        try {
            const receiptHash = await addProductOnChain(product.id, hashValue);
            if (receiptHash) tx_hash = receiptHash;
        } catch (e) {
            console.error("Lưu blockchain thất bại, bỏ qua blockchain để tiếp tục ghi db");
        }

        // Tạo dòng phiên bản
        const productVersion = await ProductVersion.create({
            product_id: product.id,
            version: 1,
            status: status,
            image: image,
            hash: hashValue,
            tx_hash: tx_hash
        });

        res.status(201).json({ product, initial_version: productVersion });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id, status } = req.body;
        
        let image = null;
        if (req.file) {
            const uploadResult = await pinataService.uploadFileToIPFS(req.file.path, req.file.originalname);
            image = uploadResult.ipfsUrl;
        }

        if (!id || !status) {
            return res.status(400).json({ error: "Thiếu trường id hoặc status." });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Lấy version lớn nhất
        const latestVersion = await ProductVersion.findOne({
            where: { product_id: product.id },
            order: [['version', 'DESC']]
        });
        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

        // Băm dữ liệu
        const hashValue = sha256(product.name + product.origin + status);
        
        // Gọi blockchain
        let tx_hash = "mock_tx_update_" + hashValue.substring(0,10);
        try {
            const receiptHash = await updateProductOnChain(product.id, hashValue);
            if (receiptHash) tx_hash = receiptHash;
        } catch (e) {
            console.error("Lưu update blockchain thất bại, bỏ qua để tiếp tục.");
        }

        const productVersion = await ProductVersion.create({
            product_id: product.id,
            version: nextVersion,
            status: status,
            image: image,
            hash: hashValue,
            tx_hash: tx_hash
        });

        res.status(200).json({ message: "Product updated", version: productVersion });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getProductHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [{
                model: ProductVersion,
                as: 'versions',
                required: false
            }],
            order: [
                [{ model: ProductVersion, as: 'versions' }, 'version', 'ASC']
            ]
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product history:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const { wallet } = req.query;
        if (!wallet) {
            return res.status(400).json({ error: "Thiếu param wallet." });
        }

        const products = await Product.findAll({
            where: { owner_wallet: wallet },
            include: [{
                model: ProductVersion,
                as: 'versions',
                required: false,
            }],
            order: [
                [{ model: ProductVersion, as: 'versions' }, 'version', 'DESC']
            ]
        });
        
        // Transform the payload to have `latest_version` on top-level
        const result = products.map(p => {
            const productPlain = p.get({ plain: true });
            const latestVersion = productPlain.versions.length > 0 ? productPlain.versions[0] : null;
            // Remove full versions array if we only need latest to be lightweight, or keep it.
            // Description says "trả về sẽ bao gồm ngay lập tức đối tượng latest_version", so let's attach it.
            return {
                ...productPlain,
                latest_version: latestVersion
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching my products:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export default {
    createProduct,
    updateProduct,
    getProductHistory,
    getMyProducts
};
