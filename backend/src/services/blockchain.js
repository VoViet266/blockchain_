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

const buildProductHash = (productData) => {
  const { name, origin, status, description, additional_info } = productData;
  const infoStr = additional_info ? JSON.stringify(additional_info) : "";
  const dataToHash =
    (name || "") +
    (origin || "") +
    (status || "") +
    (description || "") +
    infoStr;
  return crypto.createHash("sha256").update(dataToHash).digest("hex");
};

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
    ABI.some(
      (fragment) => fragment.type === "event" && fragment.name === eventName,
    );

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
          console.warn(
            `Product ${productId} not found in DB when event received.`,
          );
        }
      } catch (error) {
        console.error("Error handling ProductAdded event:", error);
      }
    });
  }

  if (hasEvent("ProductUpdated")) {
    contract.on("ProductUpdated", async (uuid, version, dataHash, event) => {
      try {
        console.log(
          `ProductUpdated: uuid=${uuid}, version=${version}, dataHash=${dataHash}`,
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
        console.log(
          `Updated ProductVersion ${productId} with txHash ${txHash}`,
        );
      } catch (error) {
        console.error("Error handling ProductVersionAdded event:", error);
      }
    });
  }
};


export const generateProductHash = async (productData, file) => {
  const {
    name,
    origin,
    description,
    additional_info,
  } = productData;

  const status = "PLANTED";

  let image = null;
  if (file) {
    const uploadResult = await pinataService.uploadFileToIPFS(
      file.path,
      file.originalname,
    );
    image = uploadResult.ipfsUrl;
  }

  const hashValue = buildProductHash({
    name,
    origin,
    status,
    description,
    additional_info: additional_info ? JSON.parse(additional_info) : null,
  });

  return {
    uuid: crypto.randomUUID(),
    hash: hashValue,
    image,
    status,
  };
};

export const addProduct = async (productData) => {
  const {
    uuid,
    hash,
    txHash,
    name,
    origin,
    wallet,
    product_type,
    variety,
    farm_name,
    location,
    producer,
    description,
    additional_info,
    temperature,
    humidity,
    plant_area_id,
    image,
  } = productData;

  if (!txHash) {
    throw new Error("Transaction chưa được xác nhận.");
  }

  // (optional nhưng nên có)
  const serverHash = buildProductHash({
    name,
    origin,
    status: "PLANTED",
    description,
    additional_info: additional_info ? JSON.parse(additional_info) : null,
  });

  if (serverHash !== hash) {
    throw new Error("Hash không hợp lệ!");
  }

  // ✅ Lúc này mới tạo DB
  const product = await Product.create({
    id: uuid,
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

  await ProductVersion.create({
    product_id: product.id,
    version: 1,
    status: "PLANTED",
    description,
    additional_info: additional_info ? JSON.parse(additional_info) : null,
    location,
    image,
    hash,
    tx_hash: txHash,
    temperature,
    humidity,
  });

  return {
    success: true,
    uuid: product.id,
  };
};

export const verifyProductIntegrity = async (productId) => {
  console.log("Verifying product integrity for product ID:", productId);
  try {
    if (!contract) throw new Error("Blockchain service chưa khởi tạo.");

    const product = await Product.findByPk(productId, {
      include: [{ model: ProductVersion, as: "versions" }],
    });

    if (!product || !product.versions.length) {
      return { success: false, isValid: false, message: "Không tìm thấy DB", data: {} };
    }

    const latestVer = product.versions.sort((a, b) => b.version - a.version)[0];
    const dbCalculatedHash = buildProductHash({
      name: product.name,
      origin: product.origin,
      status: latestVer.status,
      description: latestVer.description,
      additional_info: latestVer.additional_info,
    });

    try {
      const productOnChain = await contract.getProduct(productId);
      const onChainHash = productOnChain[2];

      const normalize = (h) => (h ? h.toLowerCase().replace(/^0x/, "") : "");
      const isValid = normalize(dbCalculatedHash) === normalize(onChainHash);

      return {
        success: true,
        isValid,
        data: {
          dbCalculatedHash: "0x" + dbCalculatedHash,
          onChainHash: onChainHash.startsWith("0x")
            ? onChainHash
            : "0x" + onChainHash,
        },
      };
    } catch (contractError) {
      const isRevert =
        contractError.code === "CALL_EXCEPTION" ||
        (contractError.message && contractError.message.includes("call revert exception"));

      if (isRevert) {
        console.log(`Product ${productId} not yet added to blockchain`);
        return {
          success: true,
          isValid: true,
          data: {
            status: "pending_blockchain",
            dbCalculatedHash: "0x" + dbCalculatedHash,
            message: "Product exists in database but not yet on blockchain",
          },
        };
      }
      throw contractError;
    }
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

    const hashValue = buildProductHash({
      name: product.name,
      origin: product.origin,
      status: status,
      description: description,
      additional_info: additional_info ? JSON.parse(additional_info) : null,
    });

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
      uuid: product.id.toString(),
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
