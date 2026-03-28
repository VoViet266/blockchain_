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

const listenToEvents = () => {
  if (!contract) return;

  contract.on("ProductAdded", async (uuid, owner, hash, event) => {
    try {
      console.log(
        `[EVENT] ProductAdded: uuid=${uuid}, owner=${owner}, hash=${hash}`,
      );

      const txHash = event.log.transactionHash;

      // Tìm sản phẩm theo id (uuid trên blockchain)
      const productId = uuid;

      const product = await Product.findByPk(productId);
      if (product) {
        // Cập nhật ví chủ sở hữu từ sự kiện
        await product.update({ owner_wallet: owner });

        // Cập nhật tx_hash cho version tương ứng
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

  contract.on("ProductUpdated", async (uuid, newHash, event) => {
    try {
      console.log(`ProductUpdated: uuid=${uuid}, newHash=${newHash}`);
      const txHash = event.log.transactionHash;
      const productId = uuid;

      await ProductVersion.update(
        { tx_hash: txHash },
        {
          where: {
            product_id: productId,
            hash: newHash,
          },
        },
      );
      console.log(`Updated ProductVersion ${productId} with txHash ${txHash}`);
    } catch (error) {
      console.error("Error handling ProductUpdated event:", error);
    }
  });

  contract.on(
    "OwnershipTransferred",
    async (uuid, oldOwner, newOwner, event) => {
      try {
        console.log(`OwnershipTransferred: uuid=${uuid}, newOwner=${newOwner}`);
        const productId = uuid.startsWith("0x") ? uuid.slice(2) : uuid;

        const product = await Product.findByPk(productId);
        if (product) {
          await product.update({ owner_wallet: newOwner });
          console.log(`Updated Product ${productId} owner to ${newOwner}`);
        }
      } catch (error) {
        console.error("Error handling OwnershipTransferred event:", error);
      }
    },
  );
};

export const addProductOnChain = async (productData, file) => {
  const {
    name, origin, wallet, // core
    product_type, variety, farm_name, location, producer, // origin fields
    description, additional_info, // version info
    temperature, humidity, // new fields
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
    owner_wallet: wallet,
  });

  try {
    // Stringify additional info for hash calculation
    const infoStr = additional_info ? JSON.stringify(additional_info) : "";
    const data = name + origin + status + (description || "") + infoStr;
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

export const updateProductOnChain = async (body, file) => {
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

    // Stringify additional info for hash calculation
    const infoStr = additional_info ? JSON.stringify(additional_info) : "";
    const data = product.name + product.origin + status + (description || "") + infoStr;
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
