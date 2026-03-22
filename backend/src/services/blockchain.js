import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

const RPC_URL = process.env.RPC_URL;
//Địa chỉ smart contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let contract = null;
let signer = null;
//Đọc file abi.json
const abiPath = path.join(process.cwd(), 'abi.json');
const ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

const initBlockchain = () => {
    try {
        if (!process.env.ADMIN_PRIVATE_KEY) {
            console.warn("WARNING: ADMIN_PRIVATE_KEY is not set in .env. Blockchain writing will fail.");
            return;
        }
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("Blockchain provider initialized!");
    } catch (error) {
        console.error("Blockchain init error:", error);
    }
};

export const addProductOnChain = async (productId, hashValue) => {
    if (!contract) return null;
    try {
        const tx = await contract.addProduct(productId, hashValue);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Lỗi khi thêm lên Blockchain:", error);
        throw error;
    }
};

export const updateProductOnChain = async (productId, hashValue) => {
    if (!contract) return null;
    try {
        const tx = await contract.updateProduct(productId, hashValue);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Lỗi khi update lên Blockchain:", error);
        throw error;
    }
};

export { initBlockchain };
