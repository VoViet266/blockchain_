// services/pinata.service.js
import pinataSDK from "@pinata/sdk";
import { createReadStream, existsSync, unlinkSync } from "fs";
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

const uploadFileToIPFS = async (filePath, originalName) => {
  try {
    const options = {
      pinataMetadata: {
        name: `NongSan_${originalName}`,
        keyvalues: { type: "ProductImage" },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // Đọc file và đẩy lên Pinata
    const readableStreamForFile = createReadStream(filePath);
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);

    return {
      cid: result.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error("Lỗi tại Pinata Service:", error);
    throw new Error("Không thể upload lên IPFS");
  } finally {
    try {
      if (existsSync(filePath)) {
        setTimeout(() => {
          // Đợi một chút để OS giải phóng file lock trên Windows
          unlinkSync(filePath);
          console.log(`Đã xóa file tạm: ${filePath}`);
        }, 500);
      }
    } catch (err) {
      console.error("Không thể xóa file tạm:", err.message);
    }
  }
};

export default {
  uploadFileToIPFS,
};
