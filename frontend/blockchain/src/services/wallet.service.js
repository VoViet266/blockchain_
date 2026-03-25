import { BrowserProvider } from "ethers";

const WALLET_STORAGE_KEY = "producttrace_wallet";

const getInjectedProvider = () => {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
};

const getBrowserProvider = () => {
  const injectedProvider = getInjectedProvider();
  if (!injectedProvider) return null;
  return new BrowserProvider(injectedProvider);
};

const normalizeAddress = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.address === "string") return value.address;
  return "";
};

export const connectWalletWithEthers = async () => {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("Không tìm thấy MetaMask. Vui lòng cài extension trước.");
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  if (!address) {
    throw new Error("Không nhận được tài khoản từ MetaMask.");
  }

  return address;
};

export const getConnectedWalletWithEthers = async () => {
  const provider = getBrowserProvider();
  if (!provider) return "";

  const accounts = await provider.listAccounts();
  if (!accounts?.length) return "";

  return normalizeAddress(accounts[0]);
};

export const subscribeWalletChanges = (onAddressChanged) => {
  const injectedProvider = getInjectedProvider();
  if (!injectedProvider) {
    return () => {};
  }

  const handler = (accounts) => {
    const nextAddress = Array.isArray(accounts) && accounts.length ? normalizeAddress(accounts[0]) : "";
    onAddressChanged(nextAddress);
  };

  injectedProvider.on("accountsChanged", handler);

  return () => {
    injectedProvider.removeListener("accountsChanged", handler);
  };
};

export { WALLET_STORAGE_KEY };