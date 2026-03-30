import { verifyProductIntegrity } from "../services/blockchain.js";

export const integrityCheck = async (req, res, next) => {
    try {
        const productId = req.params.id || req.body.id;

        if (!productId) {
            return res.status(400).json({ message: "Không tìm thấy ID sản phẩm để xác thực." });
        }

        const result = await verifyProductIntegrity(productId);

        if (!result.isValid) {
            // Dữ liệu bị sai lệch - Chặn không cho đi tiếp
            return res.status(409).json({
                success: false,
                message: "CẢNH BÁO: Dữ liệu sản phẩm này đã bị thay đổi trái phép so với Blockchain. Truy cập bị từ chối!",
                details: result.data
            });
        }
        console.log(`[Integrity Check] Product ${productId}: PASSED`);
        next();
    } catch (error) {
        // Nếu lỗi kết nối Blockchain (RPC lỗi), tùy bạn quyết định cho qua hay chặn
        res.status(500).json({ message: "Không thể xác thực với Blockchain: " + error.message });
    }
};