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

//Đọc file abi.json
const abiPath = path.join(process.cwd(), "abi.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const initBlockchain = () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    listenToEvents();
    console.log("Blockchain service initialized and listener started.");
  } catch (error) {
    console.error("Blockchain init error:", error);
  }
};


// Lắng nghe sự kiện từ blockchain và cập nhật database tương ứng
const listenToEvents = () => {
  if (!contract) return;

  const hasEvent = (eventName) =>
    ABI.some((fragment) => fragment.type === "event" && fragment.name === eventName);

  if (hasEvent("ProductAdded")) {
    contract.on("ProductAdded", async (uuid, owner, hash, event) => {
      try {
        console.log(`ProductAdded: uuid=${uuid}, owner=${owner}, hash=${hash}`);

        const txHash = event.log.transactionHash;
        const productId = uuid;

        const product = await Product.findByPk(productId);
        if (product) {
          await product.update({ owner_wallet: owner });

          await ProductVersion.update(
            { tx_hash: txHash },
            {
              where: {
                product_id: productId,
                hash: hash,
              },
            },
          );
          console.log(`Updated Product ${productId} with txHash ${txHash}`);
        } else {
          console.warn(`Product ${productId} not found in DB when event received.`);
        }
      } catch (error) {
        console.error("Error handling ProductAdded event:", error);
      }
    });
  }

  if (hasEvent("ProductVersionAdded")) {
    contract.on(
      "ProductVersionAdded",
      async (uuid, version, dataHash, event) => {
        try {
          console.log(
            `ProductVersionAdded: uuid=${uuid}, version=${version}, dataHash=${dataHash}`,
          );
          const txHash = event.log.transactionHash;
          const productId = uuid;

          await ProductVersion.update(
            { tx_hash: txHash },
            {
              where: {
                product_id: productId,
                hash: dataHash,
              },
            },
          );
          console.log(`Updated ProductVersion ${productId} with txHash ${txHash}`);
        } catch (error) {
          console.error("Error handling ProductVersionAdded event:", error);
        }
      },
    );
  }
};

export const addProduct = async (productData, file) => {
  const {
    name,
    origin,
    wallet, // core
    product_type,
    variety,
    farm_name,
    location,
    producer,
    description,
    additional_info,
    temperature,
    humidity, // new fields
    plant_area_id,
  } = productData;

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

  // Create Product with new fields
  const product = await Product.create({
    name,
    origin,
    product_type,
    variety,
    farm_name,
    location,
    producer,
    plant_area_id,
    owner_wallet: wallet,
  });

  try {

    const infoStr = additional_info ? JSON.stringify(additional_info) : "";
    const data = productData + infoStr;
    const hashValue = crypto.createHash("sha256").update(data).digest("hex");

    await ProductVersion.create({
      product_id: product.id,
      version: 1,
      status: status,
      description: description,
      additional_info: additional_info ? JSON.parse(additional_info) : null,
      location: location,
      image: image,
      hash: hashValue,
      tx_hash: null,
      temperature,
      humidity,
    });

    return {
      success: true,
      uuid: product.id,
      hash: hashValue,
      product_id: product.id,
    };
  } catch (error) {
    console.error("Lỗi khi chuẩn bị dữ liệu Blockchain:", error.message);
    await product.destroy();
    throw error;
  }
};

export const verifyProductIntegrity = async (productId) => {
  try {
    if (!contract) throw new Error("Blockchain service chưa khởi tạo.");

    const product = await Product.findByPk(productId, {
      include: [{ model: ProductVersion, as: "versions" }],
    });

    if (!product || !product.versions.length) return { success: false, message: "Không tìm thấy DB" };

    const latestVer = product.versions.sort((a, b) => b.version - a.version)[0];

    // --- LOGIC HASH PHẢI KHỚP 100% VỚI HÀM addVerProduct CỦA BẠN ---
    // Bạn dùng: product.name + product.origin + status + description + infoStr
    const infoStr = latestVer.additional_info ? JSON.stringify(latestVer.additional_info) : "";

    // Tạo lại chuỗi y hệt như lúc bạn nhấn nút "Update" hoặc "Add"
    const dataToHash =
      product.name +
      product.origin +
      latestVer.status +
      (latestVer.description || "") +
      infoStr;

    // DEBUG: Bạn hãy nhìn vào Terminal (Console) để so sánh chuỗi này
    console.log("------------------------------------------");
    console.log("CHUỖI DỮ LIỆU ĐANG ĐƯỢC BĂM:", `"${dataToHash}"`);
    console.log("------------------------------------------");

    const dbCalculatedHash = crypto.createHash("sha256").update(dataToHash).digest("hex");

    const productOnChain = await contract.getProduct(productId);
    const onChainHash = productOnChain[2];

    const normalize = (h) => (h ? h.toLowerCase().replace(/^0x/, "") : "");
    const isValid = normalize(dbCalculatedHash) === normalize(onChainHash);

    return {
      success: true,
      isValid,
      data: {
        dbCalculatedHash: "0x" + dbCalculatedHash,
        onChainHash: onChainHash.startsWith("0x") ? onChainHash : "0x" + onChainHash,
      }
    };
  } catch (error) {
    throw error;
  }
};

export const addVerProduct = async (body, file) => {
  try {
    const { id, status, description, location, additional_info } = body;

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

    const latestVersion = await ProductVersion.findOne({
      where: { product_id: product.id },
      order: [["version", "DESC"]],
    });
    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    const infoStr = additional_info ? JSON.stringify(additional_info) : "";
    const data =
      product.name + product.origin + status + (description || "") + infoStr;
    const hashValue = crypto.createHash("sha256").update(data).digest("hex");

    const productVersion = await ProductVersion.create({
      product_id: product.id,
      version: nextVersion,
      status: status,
      description: description,
      additional_info: additional_info ? JSON.parse(additional_info) : null,
      location: location,
      image: image,
      hash: hashValue,
      tx_hash: null,
    });

    return {
      success: true,
      uuid: product.id,
      hash: hashValue,
      product_version: productVersion,
    };
  } catch (error) {
    console.error("Error updating product data:", error);
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
