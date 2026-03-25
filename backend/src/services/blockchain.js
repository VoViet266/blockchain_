import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Product, ProductVersion } from "../models/index.js";
import pinataService from "./uploadPinata.js";

const RPC_URL = process.env.RPC_URL;
//Địa chỉ smart contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let contract = null;
let signer = null;
//Đọc file abi.json
const abiPath = path.join(process.cwd(), "abi.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const initBlockchain = () => {
  try {
    if (!process.env.ADMIN_PRIVATE_KEY) {
      console.warn(
        "WARNING: ADMIN_PRIVATE_KEY is not set in .env. Blockchain writing will fail.",
      );
      return;
    }
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  } catch (error) {
    console.error("Blockchain init error:", error);
  }
};

export const addProductOnChain = async (productData, file) => {
  const { name, origin, wallet } = productData;
  if (wallet == null) {
    throw new Error("Missing wallet address.");
  }
  const status = "PLANTED";

  let image = null;
  if (file) {
    const uploadResult = await pinataService.uploadFileToIPFS(
      file.path,
      file.originalname,
    );
    image = uploadResult.ipfsUrl;
  }

  const product = await Product.create({
    name,
    origin,
    owner_wallet: wallet,
  });

  try {
    const data = name + origin + status;
    const hashValue = crypto.createHash("sha256").update(data).digest("hex");
    const productIdOnChain = product.id.startsWith("0x")
      ? product.id
      : "0x" + product.id;

    const tx = await contract.addProduct(productIdOnChain, hashValue);
    const receipt = await tx.wait();
    const txHash = receipt.hash;

    await ProductVersion.create({
      product_id: product.id,
      version: 1,
      status: status,
      image: image,
      hash: hashValue,
      tx_hash: txHash,
    });

    return { success: true, tx_hash: txHash, product_id: product.id };
  } catch (error) {
    console.error(
      "Lỗi khi thêm lên Blockchain:",
      error.shortMessage || error.message,
    );

    // Xóa bản ghi trong DB nếu blockchain thất bại để đảm bảo tính nhất quán (Optional)
    await product.destroy();

    // Throw a enhanced error to be handled by controller
    const enhancedError = new Error(error.message);
    if (error.reason || (error.message && error.message.includes("reverted"))) {
      enhancedError.status = 409;
      enhancedError.detail =
        error.reason || "Sản phẩm đã tồn tại trên hệ thống";
    } else {
      enhancedError.status = 500;
    }
    throw enhancedError;
  }
};

export const updateProductOnChain = async (body, file) => {
  try {
    const { id, status } = body;

    let image = null;
    if (file) {
      const uploadResult = await pinataService.uploadFileToIPFS(
        file.path,
        file.originalname,
      );
      image = uploadResult.ipfsUrl;
    }

    if (!id || !status) {
      throw new Error("Missing ID or status.");
    }

    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Lấy version lớn nhất
    const latestVersion = await ProductVersion.findOne({
      where: { product_id: product.id },
      order: [["version", "DESC"]],
    });
    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    // Băm dữ liệu
    const data = product.name + product.origin + status;
    const hashValue = crypto.createHash("sha256").update(data).digest("hex");

    // Convert UUID hex to numeric-compatible format
    const productIdOnChain = product.id.startsWith("0x")
      ? product.id
      : "0x" + product.id;

    let tx_hash;

    const tx = await contract.updateProduct(productIdOnChain, hashValue);
    const receipt = await tx.wait();

    const productVersion = await ProductVersion.create({
      product_id: product.id,
      version: nextVersion,
      status: status,
      image: image,
      hash: hashValue,
      tx_hash: receipt.hash,
    });

    return { success: true, tx_hash: receipt.hash, product_version: productVersion };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const getProductHistoryOnChain = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductVersion,
        as: "versions",
        required: false,
      },
    ],
    order: [[{ model: ProductVersion, as: "versions" }, "version", "ASC"]],
  });
  return product;
};

export const getMyProductsOnChain = async (wallet) => {
  const products = await Product.findAll({
    where: { owner_wallet: wallet },
    include: [
      {
        model: ProductVersion,
        as: "versions",
        required: false,
      },
    ],
    order: [[{ model: ProductVersion, as: "versions" }, "version", "DESC"]],
  });

  // Transform the payload to have `latest_version` on top-level
  const result = products.map((p) => {
    const productPlain = p.get({ plain: true });
    const latestVersion =
      productPlain.versions.length > 0 ? productPlain.versions[0] : null;
    return {
      ...productPlain,
      latest_version: latestVersion,
    };
  });

  return result;
};

export { initBlockchain };
