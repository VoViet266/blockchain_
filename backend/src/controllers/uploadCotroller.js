require('dotenv').config();
import pinataService from '../services/pinata.service.js';
const uploadImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn một hình ảnh.'
            });
        }

        const filePath = req.file.path;
        const originalName = req.file.originalname;

        const result = await pinataService.uploadFileToIPFS(filePath, originalName);

        // Trả kết quả về cho client
        return res.status(200).json({
            success: true,
            message: 'Đã upload ảnh lên IPFS thành công.',
            data: result // Chứa cid và ipfsUrl
        });

    } catch (error) {
        console.error('Lỗi tại Upload Controller:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server nội bộ.'
        });
    }
};

module.exports = {
    uploadImage
};