import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  WALLET_STORAGE_KEY,
} from "../../services/wallet.service";

export default function Create() {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [image, setImage] = useState(null);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Điền thông tin và kết nối ví để tạo sản phẩm.");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shortWallet = useMemo(() => {
    if (!wallet) return "Chưa kết nối";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }, [wallet]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus("Đang mở MetaMask...");

      const account = await connectWalletWithEthers();
      setWallet(account);
      localStorage.setItem(WALLET_STORAGE_KEY, account);
      setStatus("Kết nối ví thành công (ethers).");
    } catch (error) {
      setStatus(error?.message || "Kết nối ví thất bại.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const syncWalletFromMetaMask = async () => {
      try {
        const account = await getConnectedWalletWithEthers();

        if (account) {
          setWallet(account);
          localStorage.setItem(WALLET_STORAGE_KEY, account);
          setStatus("Đã tự khôi phục kết nối ví từ phiên trước.");
          return;
        }

        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } catch (_error) {
        const cachedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (cachedWallet) {
          setWallet(cachedWallet);
        }
      }
    };

    const unsubscribe = subscribeWalletChanges((account) => {
      if (account) {
        setWallet(account);
        localStorage.setItem(WALLET_STORAGE_KEY, account);
        setStatus("Đã cập nhật ví MetaMask.");
      } else {
        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
        setStatus("MetaMask đã ngắt kết nối. Vui lòng kết nối lại để tiếp tục.");
      }
    });

    syncWalletFromMetaMask();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !origin.trim() || !image) {
      setStatus("Vui lòng nhập đầy đủ Name, Origin và chọn ảnh sản phẩm.");
      return;
    }

    if (!wallet) {
      setStatus("Vui lòng kết nối ví trước khi tạo sản phẩm.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("origin", origin.trim());
    formData.append("wallet", wallet);
    formData.append("image", image);

    try {
      setIsSubmitting(true);
      setStatus("Đang tạo sản phẩm và ghi dữ liệu lên blockchain...");

      await API.post("/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Tạo sản phẩm thành công.");
      setName("");
      setOrigin("");
      setImage(null);
    } catch (error) {
      if (!error?.response) {
        setStatus("Không kết nối được backend. Hãy chạy Django server và thử lại.");
      } else {
        setStatus(error?.response?.data?.detail || error?.message || "Tạo sản phẩm thất bại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#23372e] bg-[radial-gradient(circle_at_85%_12%,rgba(41,153,104,0.2),transparent_36%),radial-gradient(circle_at_8%_20%,rgba(255,191,92,0.2),transparent_34%),linear-gradient(150deg,#f7f3e6_0%,#edf4df_52%,#e0efe7_100%)]">
      <div className="max-w-[980px] mx-auto grid gap-[14px] animate-[fade-up_550ms_ease-out]">
        <section className="bg-white/78 border-[1px] border-[#274c3d]/18 rounded-[24px] p-[24px] shadow-[0_20px_40px_rgba(40,76,61,0.08)]">
          <h1 className="m-0 mb-[8px] text-[30px] md:text-[4vw] lg:text-[48px] text-[#163629] font-bold">
            Tạo sản phẩm
          </h1>
          <p className="m-0 text-[#3a5b4d] leading-[1.6]">
            Đăng ký sản phẩm mới, lưu thông tin xuất xứ và ảnh minh chứng lên hệ thống truy xuất nguồn gốc.
          </p>

          <div className="mt-[14px] w-fit rounded-[999px] border-[1px] border-[#204a39]/25 bg-[#f8fbf5] px-[12px] py-[8px] text-[13px] text-[#2a5443]">
            Wallet: {shortWallet}
          </div>

          <div className="mt-[16px] flex flex-wrap gap-[10px]">
            <Link className="inline-flex items-center justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] transition-all duration-180 hover:-translate-y-[2px] border-[1px] border-[#22483a]/35 bg-[#f7efe0] text-[#2e5544] no-underline" to="/">
              Về trang chủ
            </Link>
            {!wallet && (
              <button className="inline-flex items-center justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] font-semibold transition-all duration-180 hover:-translate-y-[2px] border-[1px] border-[#22483a]/35 bg-[#f7efe0] text-[#2e5544]" type="button" onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? "Đang kết nối..." : "Connect Wallet"}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mt-[20px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-semibold">Tên sản phẩm</span>
                <input
                  className="border-[1px] border-[#295242]/24 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Green Tea Leaves"
                />
              </label>

              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-semibold">Nguồn gốc</span>
                <input
                  className="border-[1px] border-[#295242]/24 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f]"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="VD: Lam Dong, Vietnam"
                />
              </label>

              <div className="grid gap-[6px] md:col-span-2">
                <span className="text-[13px] text-[#365748] font-semibold">Hình ảnh sản phẩm</span>
                <label
                  className={`relative flex flex-col items-center justify-center border-[2px] border-dashed rounded-[18px] p-[28px] cursor-pointer transition-all duration-180 
                ${image ? 'border-[#2a875f] bg-[#f0f9f4]' : 'border-[#295242]/30 bg-white/50 hover:bg-white/80 hover:border-[#2a875f]/50'}`}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-[#f0f9f4]', 'border-[#2a875f]'); }}
                  onDragLeave={(e) => { e.preventDefault(); if (!image) e.currentTarget.classList.remove('bg-[#f0f9f4]', 'border-[#2a875f]'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) setImage(file);
                  }}
                >
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                  <div className="text-center">
                    {image ? (
                      <div className="flex flex-col items-center gap-[4px]">
                        <span className="text-[#2a875f] font-bold text-[15px]">✓ Đã chọn file thành công</span>
                        <span className="text-[#1f392f] text-[14px] break-all">{image.name}</span>
                        <span className="text-[12px] text-[#3a5b4d] opacity-60">(Nhấp để thay đổi)</span>
                      </div>
                    ) : (
                      <>
                        <p className="m-0 text-[14px] text-[#1f392f] font-medium">Kéo thả ảnh vào đây hoặc nhấp để chọn</p>
                        <p className="mt-[4px] mb-0 text-[12px] text-[#3a5b4d] opacity-70">Hỗ trợ: JPG, PNG, WEBP</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-[14px] rounded-[14px] border-[1px] border-[#d8e7dd] bg-[#f6fbf8] p-[12px] text-[#32594b] text-[14px]">
              {status}
            </div>

            <div className="mt-[16px] flex justify-end">
              <button
                className="w-full md:w-fit inline-flex items-center justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] cursor-pointer transition-all duration-180 hover:-translate-y-[2px] bg-gradient-to-br from-[#2a875f] to-[#1f6648] text-[#effff6] shadow-[0_12px_20px_rgba(31,102,72,0.23)] disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
